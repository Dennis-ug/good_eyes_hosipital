#!/bin/bash

# iSante Development Startup Script
# This script starts both backend and frontend using the same .env file

echo "🚀 Starting iSante development environment..."

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
    echo "🛑 Stopping development environment..."
    pkill -f "npm run dev"
    pkill -f "spring-boot:run"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Start backend in background
echo "🔧 Starting Spring Boot backend..."
cd eyesante-backend
./mvnw spring-boot:run -Dspring-boot.run.jvmArguments="-Xms512m -Xmx1g -XX:+UseG1GC -XX:+UseStringDeduplication -Dspring.profiles.active=dev" > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 5

# Check if backend is running with retries
echo "🔍 Checking backend status..."
for i in {1..20}; do
    if curl -s http://localhost:5025/api/auth/test > /dev/null; then
        echo "✅ Backend is running on http://localhost:5025"
        break
    fi
    if [ $i -eq 20 ]; then
        echo "❌ Backend failed to start after 20 attempts. Check backend.log for details"
        exit 1
    fi
    echo "   Attempt $i/20 - Backend not ready yet, waiting..."
    sleep 6
done

# Start frontend in background
echo "🎨 Starting Next.js frontend..."
cd isante-front-end
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Wait for frontend to start
echo "⏳ Waiting for frontend to start..."
sleep 8

# Check if frontend is running
if curl -s http://localhost:3000 > /dev/null || curl -s http://localhost:3001 > /dev/null; then
    echo "✅ Frontend is running"
    if curl -s http://localhost:3000 > /dev/null; then
        echo "   Frontend URL: http://localhost:3000"
    else
        echo "   Frontend URL: http://localhost:3001"
    fi
else
    echo "❌ Frontend failed to start. Check frontend.log for details"
    exit 1
fi

echo ""
echo "🎉 iSante development environment is ready!"
echo "=========================================="
echo "   Backend:  http://localhost:5025"
echo "   Frontend: http://localhost:3000 (or 3001)"
echo "   API Base: http://localhost:5025/api"
echo ""
echo "📝 Logs:"
echo "   Backend:  tail -f backend.log"
echo "   Frontend: tail -f frontend.log"
echo ""
echo "🛑 Press Ctrl+C to stop all services"

# Keep script running
wait
