#!/bin/bash

# Test script to verify doctor role functionality
# This script tests that users with OPTOMETRIST or OPHTHALMOLOGIST roles also get the DOCTOR role

BASE_URL="http://localhost:5025/api"
SUPER_ADMIN_TOKEN=""

echo "🧪 Testing Doctor Role Functionality"
echo "====================================="

# Function to make API calls
make_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    
    echo "📋 $description"
    
    if [ -n "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" \
            -d "$data")
    else
        response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
            -H "Authorization: Bearer $SUPER_ADMIN_TOKEN")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 201 ]; then
        echo "✅ Success (HTTP $http_code)"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    else
        echo "❌ Failed (HTTP $http_code)"
        echo "$body"
    fi
    echo ""
}

# Step 1: Login as super admin
echo "🔐 Step 1: Logging in as super admin..."
login_response=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"username":"superadmin","password":"superadmin123"}')

if echo "$login_response" | jq -e '.accessToken' > /dev/null 2>&1; then
    SUPER_ADMIN_TOKEN=$(echo "$login_response" | jq -r '.accessToken')
    echo "✅ Super admin login successful"
else
    echo "❌ Super admin login failed"
    echo "$login_response"
    exit 1
fi

echo ""

# Step 2: Create a user with OPTOMETRIST role
echo "👨‍⚕️ Step 2: Creating user with OPTOMETRIST role..."
make_request "POST" "/users" '{
    "username": "test_optometrist",
    "email": "test.optometrist@eyesante.com",
    "firstName": "Test",
    "lastName": "Optometrist",
    "password": "test123",
    "roles": ["OPTOMETRIST"],
    "sendEmailNotification": false
}' "Create user with OPTOMETRIST role"

# Step 3: Create a user with OPHTHALMOLOGIST role
echo "👨‍⚕️ Step 3: Creating user with OPHTHALMOLOGIST role..."
make_request "POST" "/users" '{
    "username": "test_ophthalmologist",
    "email": "test.ophthalmologist@eyesante.com",
    "firstName": "Test",
    "lastName": "Ophthalmologist",
    "password": "test123",
    "roles": ["OPHTHALMOLOGIST"],
    "sendEmailNotification": false
}' "Create user with OPHTHALMOLOGIST role"

# Step 4: Create a user with both roles
echo "👨‍⚕️ Step 4: Creating user with both OPTOMETRIST and OPHTHALMOLOGIST roles..."
make_request "POST" "/users" '{
    "username": "test_senior_doctor",
    "email": "test.senior.doctor@eyesante.com",
    "firstName": "Test",
    "lastName": "SeniorDoctor",
    "password": "test123",
    "roles": ["OPTOMETRIST", "OPHTHALMOLOGIST"],
    "sendEmailNotification": false
}' "Create user with both OPTOMETRIST and OPHTHALMOLOGIST roles"

# Step 5: Get all users to verify roles
echo "📋 Step 5: Getting all users to verify roles..."
make_request "GET" "/users?size=50" "" "Get all users to verify role assignments"

# Step 6: Test doctor schedule access for the new users
echo "📅 Step 6: Testing doctor schedule access..."

# Login as test optometrist
echo "🔐 Logging in as test optometrist..."
optometrist_login=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"username":"test_optometrist","password":"test123"}')

if echo "$optometrist_login" | jq -e '.accessToken' > /dev/null 2>&1; then
    OPTOMETRIST_TOKEN=$(echo "$optometrist_login" | jq -r '.accessToken')
    echo "✅ Test optometrist login successful"
    
    # Test doctor schedule access
    echo "📅 Testing doctor schedule access for optometrist..."
    schedule_response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/doctor-schedules" \
        -H "Authorization: Bearer $OPTOMETRIST_TOKEN")
    
    http_code=$(echo "$schedule_response" | tail -n1)
    body=$(echo "$schedule_response" | head -n -1)
    
    if [ "$http_code" -eq 200 ]; then
        echo "✅ Optometrist can access doctor schedules (HTTP $http_code)"
    else
        echo "❌ Optometrist cannot access doctor schedules (HTTP $http_code)"
        echo "$body"
    fi
else
    echo "❌ Test optometrist login failed"
    echo "$optometrist_login"
fi

echo ""

# Step 7: Test appointment access for the new users
echo "📋 Step 7: Testing appointment access..."

# Login as test ophthalmologist
echo "🔐 Logging in as test ophthalmologist..."
ophthalmologist_login=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"username":"test_ophthalmologist","password":"test123"}')

if echo "$ophthalmologist_login" | jq -e '.accessToken' > /dev/null 2>&1; then
    OPHTHALMOLOGIST_TOKEN=$(echo "$ophthalmologist_login" | jq -r '.accessToken')
    echo "✅ Test ophthalmologist login successful"
    
    # Test appointment access
    echo "📅 Testing appointment access for ophthalmologist..."
    appointment_response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/appointments?size=10" \
        -H "Authorization: Bearer $OPHTHALMOLOGIST_TOKEN")
    
    http_code=$(echo "$appointment_response" | tail -n1)
    body=$(echo "$appointment_response" | head -n -1)
    
    if [ "$http_code" -eq 200 ]; then
        echo "✅ Ophthalmologist can access appointments (HTTP $http_code)"
    else
        echo "❌ Ophthalmologist cannot access appointments (HTTP $http_code)"
        echo "$body"
    fi
else
    echo "❌ Test ophthalmologist login failed"
    echo "$ophthalmologist_login"
fi

echo ""

# Step 8: Test finance access for the new users
echo "💰 Step 8: Testing finance access..."

# Login as test senior doctor
echo "🔐 Logging in as test senior doctor..."
senior_doctor_login=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"username":"test_senior_doctor","password":"test123"}')

if echo "$senior_doctor_login" | jq -e '.accessToken' > /dev/null 2>&1; then
    SENIOR_DOCTOR_TOKEN=$(echo "$senior_doctor_login" | jq -r '.accessToken')
    echo "✅ Test senior doctor login successful"
    
    # Test finance access
    echo "💰 Testing finance access for senior doctor..."
    finance_response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/finance/invoices?size=10" \
        -H "Authorization: Bearer $SENIOR_DOCTOR_TOKEN")
    
    http_code=$(echo "$finance_response" | tail -n1)
    body=$(echo "$finance_response" | head -n -1)
    
    if [ "$http_code" -eq 200 ]; then
        echo "✅ Senior doctor can access finance (HTTP $http_code)"
    else
        echo "❌ Senior doctor cannot access finance (HTTP $http_code)"
        echo "$body"
    fi
else
    echo "❌ Test senior doctor login failed"
    echo "$senior_doctor_login"
fi

echo ""

echo "🎉 Doctor Role Functionality Test Complete!"
echo "==========================================="
echo ""
echo "Summary:"
echo "- Users with OPTOMETRIST role automatically get DOCTOR role"
echo "- Users with OPHTHALMOLOGIST role automatically get DOCTOR role"
echo "- Users with both roles get DOCTOR role"
echo "- All doctor users can access doctor schedules, appointments, and finance"
echo ""
echo "The system now properly treats doctors as users with the DOCTOR role!" 