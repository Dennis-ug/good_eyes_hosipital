#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:5025"
JWT_TOKEN=""

echo -e "${BLUE}=== Eyesante Backend API Testing ===${NC}\n"

# Function to print test results
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ PASS${NC} - $2"
    else
        echo -e "${RED}❌ FAIL${NC} - $2"
    fi
}

# Function to extract JWT token from response
extract_token() {
    echo $1 | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4
}

# Test 1: Health Check
echo -e "${YELLOW}1. Testing Health Check...${NC}"
HEALTH_RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/health_response "$BASE_URL/api/auth/test")
HTTP_CODE=${HEALTH_RESPONSE: -3}
if [ "$HTTP_CODE" = "200" ]; then
    print_result 0 "Health check passed"
    echo "Response: $(cat /tmp/health_response)"
else
    print_result 1 "Health check failed - HTTP $HTTP_CODE"
fi
echo

# Test 2: Create a new user (requires super admin)
echo -e "${YELLOW}2. Testing User Creation (Super Admin Required)...${NC}"
CREATE_USER_RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/create_user_response \
    -X POST "$BASE_URL/api/auth/create-user" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" \
    -d '{
        "username": "testuser",
        "email": "test@example.com",
        "password": "password123",
        "firstName": "Test",
        "lastName": "User"
    }')
HTTP_CODE=${CREATE_USER_RESPONSE: -3}
if [ "$HTTP_CODE" = "200" ]; then
    print_result 0 "User creation passed"
    JWT_TOKEN=$(extract_token "$(cat /tmp/create_user_response)")
    echo "JWT Token: ${JWT_TOKEN:0:50}..."
else
    print_result 1 "User creation failed - HTTP $HTTP_CODE"
    echo "Response: $(cat /tmp/create_user_response)"
fi
echo

# Test 3: Login with the registered user
echo -e "${YELLOW}3. Testing User Login...${NC}"
LOGIN_RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/login_response \
    -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
        "username": "testuser",
        "password": "password123"
    }')
HTTP_CODE=${LOGIN_RESPONSE: -3}
if [ "$HTTP_CODE" = "200" ]; then
    print_result 0 "User login passed"
    JWT_TOKEN=$(extract_token "$(cat /tmp/login_response)")
    echo "JWT Token: ${JWT_TOKEN:0:50}..."
else
    print_result 1 "User login failed - HTTP $HTTP_CODE"
    echo "Response: $(cat /tmp/login_response)"
fi
echo

# Test 4: Login as Super Admin
echo -e "${YELLOW}4. Testing Super Admin Login...${NC}"
SUPER_ADMIN_RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/super_admin_response \
    -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
        "username": "superadmin",
        "password": "superadmin123"
    }')
HTTP_CODE=${SUPER_ADMIN_RESPONSE: -3}
if [ "$HTTP_CODE" = "200" ]; then
    print_result 0 "Super admin login passed"
    SUPER_ADMIN_TOKEN=$(extract_token "$(cat /tmp/super_admin_response)")
    echo "Super Admin JWT Token: ${SUPER_ADMIN_TOKEN:0:50}..."
else
    print_result 1 "Super admin login failed - HTTP $HTTP_CODE"
    echo "Response: $(cat /tmp/super_admin_response)"
fi
echo

# Test 5: Test protected endpoint (should fail without token)
echo -e "${YELLOW}5. Testing Protected Endpoint (No Token)...${NC}"
PROTECTED_RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/protected_response \
    "$BASE_URL/api/test/authenticated")
HTTP_CODE=${PROTECTED_RESPONSE: -3}
if [ "$HTTP_CODE" = "401" ]; then
    print_result 0 "Protected endpoint correctly rejected unauthorized access"
else
    print_result 1 "Protected endpoint should have returned 401, got $HTTP_CODE"
fi
echo

# Test 6: Test protected endpoint (with token)
echo -e "${YELLOW}6. Testing Protected Endpoint (With Token)...${NC}"
PROTECTED_AUTH_RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/protected_auth_response \
    -H "Authorization: Bearer $JWT_TOKEN" \
    "$BASE_URL/api/test/authenticated")
HTTP_CODE=${PROTECTED_AUTH_RESPONSE: -3}
if [ "$HTTP_CODE" = "200" ]; then
    print_result 0 "Protected endpoint accessible with valid token"
    echo "Response: $(cat /tmp/protected_auth_response)"
else
    print_result 1 "Protected endpoint failed with token - HTTP $HTTP_CODE"
    echo "Response: $(cat /tmp/protected_auth_response)"
fi
echo

# Test 7: Test public endpoint
echo -e "${YELLOW}7. Testing Public Endpoint...${NC}"
PUBLIC_RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/public_response \
    "$BASE_URL/api/test/public")
HTTP_CODE=${PUBLIC_RESPONSE: -3}
if [ "$HTTP_CODE" = "200" ]; then
    print_result 0 "Public endpoint accessible"
    echo "Response: $(cat /tmp/public_response)"
else
    print_result 1 "Public endpoint failed - HTTP $HTTP_CODE"
fi
echo

# Test 8: Create a new permission (Super Admin only)
echo -e "${YELLOW}8. Testing Permission Creation (Super Admin)...${NC}"
PERMISSION_RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/permission_response \
    -X POST "$BASE_URL/api/admin/permissions" \
    -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "name": "TEST_PERMISSION",
        "description": "Test permission for API testing",
        "resourceName": "TEST",
        "actionName": "READ"
    }')
HTTP_CODE=${PERMISSION_RESPONSE: -3}
if [ "$HTTP_CODE" = "200" ]; then
    print_result 0 "Permission creation passed"
    echo "Response: $(cat /tmp/permission_response)"
else
    print_result 1 "Permission creation failed - HTTP $HTTP_CODE"
    echo "Response: $(cat /tmp/permission_response)"
fi
echo

# Test 9: List all permissions (Super Admin only)
echo -e "${YELLOW}9. Testing Permission Listing (Super Admin)...${NC}"
PERMISSIONS_LIST_RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/permissions_list_response \
    -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" \
    "$BASE_URL/api/admin/permissions")
HTTP_CODE=${PERMISSIONS_LIST_RESPONSE: -3}
if [ "$HTTP_CODE" = "200" ]; then
    print_result 0 "Permission listing passed"
    echo "Found $(echo "$(cat /tmp/permissions_list_response)" | grep -o '"id"' | wc -l) permissions"
else
    print_result 1 "Permission listing failed - HTTP $HTTP_CODE"
    echo "Response: $(cat /tmp/permissions_list_response)"
fi
echo

# Test 10: Create a new role (Super Admin only)
echo -e "${YELLOW}10. Testing Role Creation (Super Admin)...${NC}"
ROLE_RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/role_response \
    -X POST "$BASE_URL/api/admin/roles" \
    -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "name": "TEST_ROLE",
        "description": "Test role for API testing",
        "permissionIds": [1, 2]
    }')
HTTP_CODE=${ROLE_RESPONSE: -3}
if [ "$HTTP_CODE" = "200" ]; then
    print_result 0 "Role creation passed"
    echo "Response: $(cat /tmp/role_response)"
else
    print_result 1 "Role creation failed - HTTP $HTTP_CODE"
    echo "Response: $(cat /tmp/role_response)"
fi
echo

# Test 11: List all roles (Super Admin only)
echo -e "${YELLOW}11. Testing Role Listing (Super Admin)...${NC}"
ROLES_LIST_RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/roles_list_response \
    -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" \
    "$BASE_URL/api/admin/roles")
HTTP_CODE=${ROLES_LIST_RESPONSE: -3}
if [ "$HTTP_CODE" = "200" ]; then
    print_result 0 "Role listing passed"
    echo "Found $(echo "$(cat /tmp/roles_list_response)" | grep -o '"id"' | wc -l) roles"
else
    print_result 1 "Role listing failed - HTTP $HTTP_CODE"
    echo "Response: $(cat /tmp/roles_list_response)"
fi
echo

# Test 12: Test unauthorized access to admin endpoints
echo -e "${YELLOW}12. Testing Unauthorized Admin Access...${NC}"
UNAUTHORIZED_RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/unauthorized_response \
    -H "Authorization: Bearer $JWT_TOKEN" \
    "$BASE_URL/api/admin/permissions")
HTTP_CODE=${UNAUTHORIZED_RESPONSE: -3}
if [ "$HTTP_CODE" = "403" ]; then
    print_result 0 "Unauthorized access correctly rejected"
else
    print_result 1 "Unauthorized access should have returned 403, got $HTTP_CODE"
fi
echo

# Cleanup
rm -f /tmp/*_response

echo -e "${BLUE}=== API Testing Complete ===${NC}"
echo -e "${GREEN}✅ All tests completed!${NC}" 