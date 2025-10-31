#!/bin/bash

# iSante Production Startup Script
# This script starts both backend and frontend in production mode using the same .env file

echo "🚀 Starting iSante production environment..."

# Check if .env file exists in root directory
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found in root directory"
    echo "Please create a .env file with all necessary environment variables"
    exit 1
fi

echo "✅ Found .env file in root directory"

# Load environment variables from root .env file
export $(cat .env | grep -v '^#' | xargs)

echo "📋 Environment variables loaded:"
echo "   Backend URL: $BACKEND_URL"
echo "   Frontend Backend URL: $NEXT_PUBLIC_BACKEND_URL"
echo "   Node Environment: $NODE_ENV"

# Function to cleanup on exit
cleanup() {
    echo "🛑 Stopping production environment..."
    pkill -f "npm run start"
    pkill -f "spring-boot:run"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Build frontend for production
echo "🔨 Building frontend for production..."
cd isante-front-end
npm run build
cd ..

# Start backend in background
echo "🔧 Starting Spring Boot backend..."
cd eyesante-backend
./mvnw spring-boot:run > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 15

# Check if backend is running
if curl -s http://localhost:5025/api/auth/test > /dev/null; then
    echo "✅ Backend is running on http://localhost:5025"
else
    echo "❌ Backend failed to start. Check backend.log for details"
    exit 1
fi

# Start frontend in production mode
echo "🎨 Starting Next.js frontend in production mode..."
cd isante-front-end
npm run start > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Wait for frontend to start
echo "⏳ Waiting for frontend to start..."
sleep 10

# Check if frontend is running
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend is running on http://localhost:3000"
else
    echo "❌ Frontend failed to start. Check frontend.log for details"
    exit 1
fi

echo ""
echo "🎉 iSante production environment is ready!"
echo "=========================================="
echo "   Backend:  http://localhost:5025"
echo "   Frontend: http://localhost:3000"
echo "   API Base: http://localhost:5025/api"
echo ""
echo "📝 Logs:"
echo "   Backend:  tail -f backend.log"
echo "   Frontend: tail -f frontend.log"
echo ""
echo "🛑 Press Ctrl+C to stop all services"

# Keep script running
wait
