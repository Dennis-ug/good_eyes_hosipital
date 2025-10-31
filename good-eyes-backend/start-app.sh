#!/bin/bash

echo "🚀 Starting Eyesante Backend..."

# Stop any running containers
echo "📦 Stopping existing containers..."
docker-compose down

# Start with minimal logging
echo "🔧 Starting services..."
docker-compose up -d postgres

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 5

# Start the application
echo "🌐 Starting application..."
docker-compose up -d app

# Wait for application to start
echo "⏳ Waiting for application to start..."
sleep 10

# Check status
echo "📊 Checking service status..."
docker-compose ps

echo "✅ Application should be ready at http://localhost:5025"
echo "🔍 To check logs: docker-compose logs app"
echo "🧪 To run tests: ./test-apis.sh" 