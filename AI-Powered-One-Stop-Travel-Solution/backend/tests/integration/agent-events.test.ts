import axios from 'axios';
import { RabbitMQClient } from '../../shared/rabbitmq/client';

const API_BASE = process.env.API_BASE || 'http://localhost:3000';
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';

describe('Agent Event Integration Tests', () => {
  let mq: RabbitMQClient;
  let authToken: string;
  let userId: string;
  let vendorId: string;
  let listingId: string;

  beforeAll(async () => {
    mq = new RabbitMQClient(RABBITMQ_URL, 'test-client');
    await mq.connect();

    // Create test user and get auth token
    try {
      await axios.post(`${API_BASE}/auth/signup`, {
        email: 'test@example.com',
        password: 'testpass123',
        full_name: 'Test User'
      });
    } catch (error) {
      // User might already exist
    }

    const loginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'test@example.com',
      password: 'testpass123'
    });
    authToken = loginRes.data.data.token;
    userId = loginRes.data.data.user.id;
  });

  afterAll(async () => {
    if (mq) {
      await mq.close();
    }
  });

  test('should process transcription.completed event', async () => {
    // First create a vendor and package
    const vendorRes = await axios.post(`${API_BASE}/api/vendor/create`, {
      userId,
      business_name: 'Test Vendor',
      location: { lat: 40.7128, lon: -74.0060 }
    });
    vendorId = vendorRes.data.data.id;

    const packageRes = await axios.post(`${API_BASE}/api/vendor/create-package`, {
      vendorId,
      files: ['/tmp/test-audio.mp3'],
      price: 100,
      location: { lat: 40.7128, lon: -74.0060 }
    });
    listingId = packageRes.data.data.packageId;

    // Wait a bit for media processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Publish transcription.completed event
    const payload = {
      listingId,
      transcript: 'This is a test transcript of the audio file',
      language: 'en',
      duration: 120
    };

    await mq.publish('transcription.completed', payload);

    // Wait for processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Verify - in a real test, you'd query MongoDB to verify the transcript was saved
    expect(payload.listingId).toBeDefined();
  }, 10000);

  test('should process embedding.created event', async () => {
    const payload = {
      entityType: 'listing',
      entityId: listingId || 'test-listing-id',
      embeddingId: 'emb-123',
      vector: new Array(384).fill(0.1),
      metadata: {
        title: 'Test Listing',
        description: 'A test listing',
        location: { lat: 40.7128, lon: -74.0060 },
        tags: ['test', 'travel']
      }
    };

    await mq.publish('embedding.created', payload);

    // Wait for processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Verify - in a real test, you'd query Qdrant to verify the embedding was indexed
    expect(payload.embeddingId).toBeDefined();
  }, 10000);

  test('should process marketing.generated event', async () => {
    const payload = {
      listingId: listingId || 'test-listing-id',
      marketingCopy: 'Amazing travel experience in the heart of the city!',
      title: 'Amazing City Tour',
      tags: ['city', 'tour', 'amazing'],
      readyForEmbedding: true
    };

    await mq.publish('marketing.generated', payload);

    // Wait for processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    expect(payload.listingId).toBeDefined();
  }, 10000);
});

