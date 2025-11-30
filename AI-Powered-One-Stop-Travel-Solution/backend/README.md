# Hyper-Local AI Travel Marketplace - Backend

Complete backend microservices implementation for the Hyper-Local AI Travel Marketplace. All services run locally using Docker.

## Architecture

The backend consists of 11 microservices:

1. **api-gateway** - API Gateway (port 3000)
2. **auth-service** - Authentication service (port 3001)
3. **user-service** - User management (port 3002)
4. **vendor-service** - Vendor and package management (port 3003)
5. **listing-service** - Listing management with event consumers (port 3004)
6. **event-service** - Event management (port 3005)
7. **booking-service** - Booking and payment processing (port 3006)
8. **search-service** - Semantic search with vector database (port 3007)
9. **media-service** - Media storage and management (port 3008)
10. **notification-service** - Notifications (WhatsApp/SMS mocks) (port 3009)
11. **analytics-service** - Analytics and event tracking (port 3010)

## Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local development)

## Quick Start

1. **Clone and navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Start all services:**
   ```bash
   docker-compose up -d
   ```

3. **Wait for all services to be healthy** (check logs):
   ```bash
   docker-compose logs -f
   ```

4. **API Gateway will be available at:** http://localhost:3000

## Services & Ports

| Service | Port | Description |
|---------|------|-------------|
| API Gateway | 3000 | Main entry point |
| Auth Service | 3001 | Authentication |
| User Service | 3002 | User management |
| Vendor Service | 3003 | Vendor operations |
| Listing Service | 3004 | Listing management |
| Event Service | 3005 | Event management |
| Booking Service | 3006 | Bookings & payments |
| Search Service | 3007 | Semantic search |
| Media Service | 3008 | Media storage |
| Notification Service | 3009 | Notifications |
| Analytics Service | 3010 | Analytics |

## Infrastructure Services

| Service | Port | Access |
|---------|------|--------|
| PostgreSQL | 5432 | `travel_user` / `travel_pass` |
| MongoDB | 27017 | `mongo_user` / `mongo_pass` |
| Redis | 6379 | - |
| RabbitMQ | 5672 | `rabbit_user` / `rabbit_pass` |
| RabbitMQ Management | 15672 | http://localhost:15672 |
| MinIO Console | 9001 | http://localhost:9001 (`minioadmin` / `minioadmin`) |
| MinIO API | 9000 | - |
| Qdrant | 6333 | http://localhost:6333 |

## Sample API Calls

### 1. User Signup
```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "full_name": "John Doe"
  }'
```

### 2. User Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### 3. Create Vendor
```bash
curl -X POST http://localhost:3000/api/vendor/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "userId": "user-id",
    "business_name": "Amazing Tours",
    "whatsapp_number": "+1234567890",
    "location": {"lat": 40.7128, "lon": -74.0060, "city": "New York"}
  }'
```

### 4. Create Vendor Package
```bash
curl -X POST http://localhost:3000/api/vendor/create-package \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "vendorId": "vendor-id",
    "files": ["/path/to/image.jpg", "/path/to/audio.mp3"],
    "price": 100.00,
    "location": {"lat": 40.7128, "lon": -74.0060},
    "raw_text": "Optional raw text description"
  }'
```

### 5. Search Listings
```bash
curl "http://localhost:3000/api/listings?city=New%20York&min_price=50&max_price=500"
```

### 6. Semantic Search
```bash
curl -X POST http://localhost:3000/search/semantic \
  -H "Content-Type: application/json" \
  -d '{
    "q": "beautiful beach vacation",
    "mode": "via_vendor",
    "filters": {
      "minPrice": 100,
      "maxPrice": 1000
    }
  }'
```

### 7. Create Event
```bash
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "agencyId": "agency-id",
    "title": "Summer Music Festival",
    "description": "Amazing music festival",
    "location": {"lat": 40.7128, "lon": -74.0060},
    "startDate": "2024-07-01T10:00:00Z",
    "endDate": "2024-07-03T22:00:00Z",
    "price": 150.00,
    "totalSeats": 100,
    "tags": ["music", "festival", "summer"]
  }'
```

### 8. Create Booking
```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "userId": "user-id",
    "eventId": "event-id",
    "seats": 2,
    "total_amount": 300.00
  }'
```

## RabbitMQ Events

### Consumed Events (from Agents)

- `media.uploaded` → media-service: stores metadata and file in MinIO
- `transcription.completed` → listing-service: attaches transcript to listing
- `marketing.generated` → listing-service: updates marketing copy
- `image.processed` → media-service & listing-service: saves enhanced image
- `embedding.created` → search-service: indexes vector in Qdrant
- `listing.created` → search-service: indexes listing
- `event.created` → search-service: indexes event

### Published Events (to Agents/Analytics)

- `booking.created` - When a booking is confirmed
- `payment.succeeded` - When payment is processed
- `user.interaction` - For analytics tracking

## Event Payload Examples

### booking.created
```json
{
  "bookingId": "uuid",
  "userId": "uuid",
  "eventId": "uuid",
  "seats": 2,
  "totalAmount": 300.00
}
```

### payment.succeeded
```json
{
  "paymentId": "uuid",
  "bookingId": "uuid",
  "amount": 300.00,
  "transactionId": "txn_123456"
}
```

### embedding.created
```json
{
  "entityType": "listing",
  "entityId": "uuid",
  "embeddingId": "emb_123",
  "vector": [0.1, 0.2, ...],
  "metadata": {
    "title": "Amazing Tour",
    "description": "...",
    "location": {...},
    "tags": ["tour", "city"]
  }
}
```

## Database Schemas

### PostgreSQL Tables

- `users` - User accounts
- `agencies` - Travel agencies
- `vendors` - Vendors
- `listings` - Canonical listing records
- `events` - Agency-hosted events
- `bookings` - Booking records
- `payments` - Payment records
- `media` - Media metadata
- `audit_logs` - Audit trail

### MongoDB Collections

- `vendor_packages` - Vendor package drafts
- `listings` - Listing documents with transcripts, marketing copy
- `transcripts` - Audio transcripts
- `marketing_docs` - Generated marketing materials

## Development

### Running a Service Locally

```bash
cd auth-service
npm install
npm run dev
```

### Building Services

```bash
docker-compose build
```

### Viewing Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f auth-service
```

### Stopping Services

```bash
docker-compose down
```

### Clean Restart

```bash
docker-compose down -v  # Removes volumes
docker-compose up -d
```

## Testing

### Integration Tests

```bash
cd tests
npm install
npm test
```

### Manual Testing

Use the sample API calls above or import the OpenAPI spec into Postman/Insomnia.

## Environment Variables

See `.env.example` for all required environment variables. Each service reads from environment variables set in `docker-compose.yml`.

## Booking Transaction Guarantees

The booking service uses PostgreSQL transactions with row-level locking (`FOR UPDATE`) to ensure:

1. Seat availability is checked atomically
2. Seats are reserved before payment processing
3. On payment failure, seats are released
4. All operations are ACID-compliant

Example SQL for seat reservation:
```sql
BEGIN;
SELECT available_seats FROM events WHERE id = $1 FOR UPDATE;
UPDATE events SET available_seats = available_seats - $2 WHERE id = $1;
COMMIT;
```

## Payment Simulation

The payment service simulates payment processing with:
- Random delay (100-500ms)
- Always succeeds (for local testing)
- Generates transaction IDs
- Publishes `payment.succeeded` event

## Search Implementation

The search service uses a hybrid approach:
1. Vector search in Qdrant for semantic similarity
2. Metadata filtering in PostgreSQL
3. Re-ranking of top results
4. Returns ranked results with scores

## Troubleshooting

### Services not starting
- Check Docker is running
- Check ports are not in use
- Review logs: `docker-compose logs [service-name]`

### Database connection errors
- Wait for databases to be healthy
- Check connection strings in docker-compose.yml
- Verify database containers are running

### RabbitMQ connection errors
- Wait for RabbitMQ to be healthy
- Check RabbitMQ management UI: http://localhost:15672
- Verify credentials match

## License

MIT

