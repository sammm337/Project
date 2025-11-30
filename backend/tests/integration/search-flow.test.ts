import axios from 'axios';

const API_BASE = process.env.API_BASE || 'http://localhost:3000';

describe('Search Flow Integration Tests', () => {
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    // Create test user
    try {
      await axios.post(`${API_BASE}/auth/signup`, {
        email: 'searchtest@example.com',
        password: 'testpass123',
        full_name: 'Search Test User'
      });
    } catch (error) {
      // User might already exist
    }

    const loginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'searchtest@example.com',
      password: 'testpass123'
    });
    authToken = loginRes.data.data.token;
    userId = loginRes.data.data.user.id;
  });

  test('should perform semantic search', async () => {
    const response = await axios.post(`${API_BASE}/search/semantic`, {
      q: 'beautiful beach vacation',
      mode: 'via_vendor',
      filters: {
        minPrice: 50,
        maxPrice: 500
      }
    });

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(Array.isArray(response.data.data)).toBe(true);
  }, 10000);

  test('should search listings with filters', async () => {
    const response = await axios.get(`${API_BASE}/api/listings`, {
      params: {
        min_price: 100,
        max_price: 1000,
        city: 'New York'
      }
    });

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(Array.isArray(response.data.data)).toBe(true);
  }, 10000);
});

