import { Pool } from 'pg';
import { MongoClient, ObjectId } from 'mongodb';
import { connectPostgres, connectMongo } from '../db/connection';
import { RabbitMQClient } from '../../../shared/dist/rabbitmq/client';
import { MediaUploadedEvent } from '../../../shared/dist/types/events';
import { ValidationError, NotFoundError } from '../../../shared/dist/utils/errors';

export class VendorService {
  private db: Pool;
  private mongo: MongoClient | null = null;
  private mq: RabbitMQClient;

  constructor() {
    this.db = connectPostgres();
    this.mq = new RabbitMQClient(process.env.RABBITMQ_URL || 'amqp://localhost:5672', 'vendor-service');
  }

  async initialize() {
    this.mongo = await connectMongo();
    await this.mq.connect();
  }

  async createVendor(userId: string, business_name: string, whatsapp_number: string, location: any) {
    if (!business_name) {
      throw new ValidationError('Business name is required');
    }

    const result = await this.db.query(
      'INSERT INTO vendors (user_id, business_name, whatsapp_number, location) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, business_name, whatsapp_number, JSON.stringify(location)]
    );
    return result.rows[0];
  }

  async createPackage(vendorId: string, files: string[], price: number, location: any, raw_text?: string) {
    if (!files || files.length === 0) {
      throw new ValidationError('At least one file is required');
    }

    if (!price || price <= 0) {
      throw new ValidationError('Valid price is required');
    }

    // Verify vendor exists
    const vendorCheck = await this.db.query('SELECT id FROM vendors WHERE id = $1', [vendorId]);
    if (vendorCheck.rows.length === 0) {
      throw new NotFoundError('Vendor');
    }

    const packageObjectId = new ObjectId();
    const packageId = packageObjectId.toHexString();
    
    // Save draft in MongoDB
    if (!this.mongo) {
      await this.initialize();
    }
    const db = this.mongo!.db('travel_marketplace');
    await db.collection('vendor_packages').insertOne({
      _id: packageObjectId,
      vendorId,
      files,
      price,
      location,
      raw_text,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Publish media.uploaded events for each file
    for (const filePath of files) {
      const event: MediaUploadedEvent = {
        topic: 'media.uploaded',
        payload: {
          entityType: 'listing',
          entityId: packageId,
          filePath,
          fileType: this.getFileType(filePath),
          fileSize: 0 // Would need to get actual size from file system
        }
      };
      await this.mq.publish('media.uploaded', event.payload);
    }

    return { packageId };
  }

  async updatePackage(id: string, updates: any) {
    if (!this.mongo) {
      await this.initialize();
    }
    const db = this.mongo!.db('travel_marketplace');
    
    const updateDoc: any = { updatedAt: new Date() };
    if (updates.price !== undefined) updateDoc.price = updates.price;
    if (updates.location !== undefined) updateDoc.location = updates.location;
    if (updates.raw_text !== undefined) updateDoc.raw_text = updates.raw_text;
    if (updates.status !== undefined) updateDoc.status = updates.status;

    const packageObjectId = this.toObjectId(id);

    const result = await db.collection('vendor_packages').updateOne(
      { _id: packageObjectId },
      { $set: updateDoc }
    );

    if (result.matchedCount === 0) {
      throw new NotFoundError('Package');
    }

    const updated = await db.collection('vendor_packages').findOne({ _id: packageObjectId });
    return updated;
  }

  async getPackages(vendorId: string) {
    if (!this.mongo) {
      await this.initialize();
    }
    const db = this.mongo!.db('travel_marketplace');
    const packages = await db.collection('vendor_packages').find({ vendorId }).toArray();
    return packages;
  }

  async generateMetadata(vendorId: string, listingId?: string) {
    if (!vendorId) {
      throw new ValidationError('vendorId is required');
    }

    const vendorResult = await this.db.query(
      'SELECT id, business_name, location FROM vendors WHERE id = $1',
      [vendorId]
    );

    if (vendorResult.rows.length === 0) {
      throw new NotFoundError('Vendor');
    }

    const vendor = vendorResult.rows[0];
    const vendorLocation =
      typeof vendor.location === 'string' ? JSON.parse(vendor.location) : vendor.location || {};
    const listingContext = listingId ? await this.fetchListingContext(listingId) : null;
    const location = listingContext?.location || vendorLocation;

    const title =
      listingContext?.title ||
      `${vendor.business_name} ${location?.city ? `- ${location.city}` : 'Signature Experience'}`;

    const description = this.composeDescription(
      vendor.business_name,
      location,
      listingContext?.description,
      listingContext?.rawText
    );

    const tags = this.buildTagList({
      tags: listingContext?.tags,
      location,
      rawText: listingContext?.rawText,
      price: listingContext?.price
    });

    return {
      title,
      description,
      tags
    };
  }

  private async fetchListingContext(listingId: string) {
    const pgResult = await this.db.query(
      `SELECT title, description, tags, price, location
       FROM listings
       WHERE id = $1`,
      [listingId]
    );

    if (pgResult.rows.length > 0) {
      const row = pgResult.rows[0];
      const location =
        typeof row.location === 'string' ? JSON.parse(row.location) : row.location || {};
      return {
        title: row.title,
        description: row.description,
        tags: row.tags || [],
        price: row.price ? Number(row.price) : undefined,
        location,
        rawText: row.description
      };
    }

    if (!this.mongo) {
      await this.initialize();
    }

    if (!ObjectId.isValid(listingId)) {
      return null;
    }

    const db = this.mongo!.db('travel_marketplace');
    const doc = await db.collection('vendor_packages').findOne({
      _id: new ObjectId(listingId)
    });
    if (!doc) {
      return null;
    }

    return {
      title: doc.title,
      description: doc.description,
      tags: doc.tags || [],
      price: doc.price,
      location: doc.location,
      rawText: doc.raw_text
    };
  }

  private buildTagList(input: {
    tags?: string[];
    location?: any;
    rawText?: string;
    price?: number;
  }) {
    const tagSet = new Set<string>();

    (input.tags || []).forEach((tag) => tagSet.add(String(tag).trim()));

    if (input.location?.city) {
      tagSet.add(input.location.city);
    }
    if (input.location?.region) {
      tagSet.add(input.location.region);
    }
    if (typeof input.price === 'number') {
      tagSet.add(input.price > 5000 ? 'Premium' : 'Budget');
    }

    if (input.rawText) {
      this.extractKeywords(input.rawText).forEach((keyword) => tagSet.add(keyword));
    }

    if (tagSet.size === 0) {
      ['Local', 'Hosted', 'SlowTravel'].forEach((tag) => tagSet.add(tag));
    }

    return Array.from(tagSet).filter(Boolean).slice(0, 8);
  }

  private composeDescription(
    vendorName: string,
    location: any,
    listingDescription?: string,
    rawText?: string
  ) {
    const segments: string[] = [];

    const where = location?.city ? ` in ${location.city}` : '';
    segments.push(`${vendorName} curates intimate, community-run experiences${where}.`);

    if (listingDescription) {
      segments.push(listingDescription);
    }

    if (rawText) {
      const highlight = rawText.slice(0, 160).trim();
      segments.push(`Highlights: ${highlight}${highlight.length === 160 ? '...' : ''}`);
    }

    return segments.join(' ');
  }

  private extractKeywords(text: string) {
    const counts = new Map<string, number>();
    const tokens = text
      .toLowerCase()
      .split(/[^a-zA-Z]+/)
      .filter((token) => token.length > 4);

    tokens.forEach((token) => {
      counts.set(token, (counts.get(token) || 0) + 1);
    });

    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([token]) => token.charAt(0).toUpperCase() + token.slice(1))
      .slice(0, 4);
  }

  private getFileType(filePath: string): string {
    const ext = filePath.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return 'image';
    if (['mp3', 'wav', 'm4a', 'ogg'].includes(ext || '')) return 'audio';
    if (['mp4', 'avi', 'mov', 'mkv'].includes(ext || '')) return 'video';
    return 'unknown';
  }

  private toObjectId(id: string): ObjectId {
    if (!ObjectId.isValid(id)) {
      throw new ValidationError('Invalid identifier format');
    }
    return new ObjectId(id);
  }
}

