#!/bin/bash

echo "🧪 Quick API Test"
echo "=================="

# Test if the application is responding
echo "1. Testing application health..."
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5025/api/auth/test)

if [ "$response" = "200" ]; then
    echo "✅ Application is running!"
    
    # Quick login test
    echo "2. Testing super admin login..."
    login_response=$(curl -s -X POST http://localhost:5025/api/auth/login \
        -H "Content-Type: application/json" \
        -d '{"username": "superadmin", "password": "superadmin123"}')
    
    if echo "$login_response" | grep -q "accessToken"; then
        echo "✅ Super admin login successful!"
        echo "🎉 Application is ready for testing!"
    else
        echo "❌ Super admin login failed"
        echo "Response: $login_response"
    fi
else
    echo "❌ Application not responding (HTTP $response)"
    echo "💡 Try running: ./start-app.sh"
fi 