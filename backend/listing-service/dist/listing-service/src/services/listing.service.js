"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListingService = void 0;
const connection_1 = require("../db/connection");
const client_1 = require("../../../shared/rabbitmq/client");
const errors_1 = require("../../../shared/utils/errors");
class ListingService {
    constructor() {
        this.mongo = null;
        this.db = (0, connection_1.connectPostgres)();
        this.mq = new client_1.RabbitMQClient(process.env.RABBITMQ_URL || 'amqp://localhost:5672', 'listing-service');
    }
    async initialize() {
        this.mongo = await (0, connection_1.connectMongo)();
        await this.mq.connect();
    }
    async getListingById(id) {
        const result = await this.db.query(`SELECT l.*, v.business_name as vendor_name 
       FROM listings l 
       LEFT JOIN vendors v ON l.vendor_id = v.id 
       WHERE l.id = $1`, [id]);
        if (result.rows.length === 0) {
            throw new errors_1.NotFoundError('Listing');
        }
        const listing = result.rows[0];
        // Fetch MongoDB document if exists
        if (listing.mongo_doc_id && this.mongo) {
            const db = this.mongo.db('travel_marketplace');
            const mongoDoc = await db.collection('listings').findOne({ _id: listing.mongo_doc_id });
            listing.mongoDoc = mongoDoc;
        }
        return listing;
    }
    async searchListings(filters) {
        let query = 'SELECT l.*, v.business_name as vendor_name FROM listings l LEFT JOIN vendors v ON l.vendor_id = v.id WHERE l.status = $1';
        const params = ['published'];
        let paramIndex = 2;
        if (filters.min_price) {
            query += ` AND l.price >= $${paramIndex++}`;
            params.push(filters.min_price);
        }
        if (filters.max_price) {
            query += ` AND l.price <= $${paramIndex++}`;
            params.push(filters.max_price);
        }
        if (filters.tags && filters.tags.length > 0) {
            query += ` AND l.tags && $${paramIndex++}`;
            params.push(filters.tags);
        }
        if (filters.city) {
            query += ` AND l.location->>'city' = $${paramIndex++}`;
            params.push(filters.city);
        }
        if (filters.near && filters.radius_km) {
            const [lat, lon] = filters.near.split(',').map(Number);
            // Simple distance calculation (Haversine would be better but requires PostGIS)
            query += ` AND (
        (CAST(l.location->>'lat' AS FLOAT) - $${paramIndex})^2 + 
        (CAST(l.location->>'lon' AS FLOAT) - $${paramIndex + 1})^2
      ) <= ($${paramIndex + 2} / 111.0)^2`;
            params.push(lat, lon, filters.radius_km);
            paramIndex += 3;
        }
        query += ' ORDER BY l.created_at DESC';
        const result = await this.db.query(query, params);
        return result.rows;
    }
    async publishListing(id) {
        const listing = await this.getListingById(id);
        // Update status to published
        await this.db.query('UPDATE listings SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', ['published', id]);
        // Publish listing.created event
        const event = {
            topic: 'listing.created',
            payload: {
                listingId: id,
                vendorId: listing.vendor_id,
                title: listing.title,
                description: listing.description,
                price: parseFloat(listing.price),
                location: listing.location,
                tags: listing.tags || [],
                embeddingId: listing.embedding_id
            }
        };
        await this.mq.publish('listing.created', event.payload);
        return { ...listing, status: 'published' };
    }
}
exports.ListingService = ListingService;
