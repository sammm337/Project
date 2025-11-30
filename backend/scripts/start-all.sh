#!/bin/bash

# Start all services script

echo "Starting Hyper-Local AI Travel Marketplace Backend..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Error: Docker is not running. Please start Docker first."
    exit 1
fi

# Start services
echo "Starting Docker containers..."
docker-compose up -d

# Wait for services to be healthy
echo "Waiting for services to be healthy..."
sleep 10

# Check service health
echo "Checking service health..."
services=("postgres" "mongodb" "rabbitmq" "minio" "qdrant")

for service in "${services[@]}"; do
    if docker-compose ps | grep -q "$service.*healthy"; then
        echo "✓ $service is healthy"
    else
        echo "✗ $service is not healthy"
    fi
done

echo ""
echo "Services are starting. Check logs with: docker-compose logs -f"
echo "API Gateway: http://localhost:3000"
echo "RabbitMQ Management: http://localhost:15672"
echo "MinIO Console: http://localhost:9001"

