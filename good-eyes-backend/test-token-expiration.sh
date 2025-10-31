#!/bin/bash

echo "Testing JWT Token Expiration Handling"
echo "====================================="

# Test 1: Login and get valid token
echo "1. Testing login with valid credentials..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5025/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"superadmin","password":"superadmin123"}')

if [ $? -eq 0 ]; then
    echo "✅ Login successful"
    ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
    REFRESH_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"refreshToken":"[^"]*"' | cut -d'"' -f4)
    echo "Access token obtained: ${ACCESS_TOKEN:0:20}..."
else
    echo "❌ Login failed"
    exit 1
fi

# Test 2: Test protected endpoint with valid token
echo "2. Testing protected endpoint with valid token..."
PROTECTED_RESPONSE=$(curl -s -X GET http://localhost:5025/api/optometry/patients-for-examination \
  -H "Authorization: Bearer $ACCESS_TOKEN")

if [[ $PROTECTED_RESPONSE == *"Unauthorized"* ]]; then
    echo "❌ Protected endpoint failed with valid token"
else
    echo "✅ Protected endpoint accessible with valid token"
fi

# Test 3: Test with expired/invalid token
echo "3. Testing with invalid token..."
INVALID_RESPONSE=$(curl -s -X GET http://localhost:5025/api/optometry/patients-for-examination \
  -H "Authorization: Bearer invalid.token.here")

if [[ $INVALID_RESPONSE == *"Unauthorized"* ]] || [[ $INVALID_RESPONSE == *"Token"* ]]; then
    echo "✅ Invalid token properly rejected"
else
    echo "❌ Invalid token not properly handled"
fi

# Test 4: Test refresh token
echo "4. Testing refresh token..."
REFRESH_RESPONSE=$(curl -s -X POST http://localhost:5025/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"$REFRESH_TOKEN\"}")

if [[ $REFRESH_RESPONSE == *"accessToken"* ]]; then
    echo "✅ Refresh token working"
else
    echo "❌ Refresh token failed"
fi

echo ""
echo "Token expiration handling test completed!" 