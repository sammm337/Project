// Test setup file
// This can be used to configure test environment

export const TEST_CONFIG = {
  API_BASE: process.env.API_BASE || 'http://localhost:3000',
  RABBITMQ_URL: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://travel_user:travel_pass@localhost:5432/travel_marketplace',
  MONGO_URL: process.env.MONGO_URL || 'mongodb://mongo_user:mongo_pass@localhost:27017/travel_marketplace?authSource=admin'
};

// Increase timeout for integration tests
jest.setTimeout(30000);

