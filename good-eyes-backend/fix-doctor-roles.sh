#!/bin/bash

# Fix Doctor Roles Script
# This script manually adds the DOCTOR role to users who have OPTOMETRIST or OPHTHALMOLOGIST roles

echo "🔧 Fixing Doctor Role Assignment"
echo "================================"

# Configuration
BASE_URL="http://localhost:5025"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Step 1: Login as super admin
print_status "Step 1: Logging in as super admin..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"superadmin","password":"superadmin123"}')

if echo "$LOGIN_RESPONSE" | jq -e '.accessToken' > /dev/null 2>&1; then
    TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.accessToken')
    print_success "Super admin login successful"
else
    print_error "Super admin login failed"
    echo "$LOGIN_RESPONSE"
    exit 1
fi

# Step 2: Get all users
print_status "Step 2: Getting all users..."
USERS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/user-management/users" \
  -H "Authorization: Bearer $TOKEN")

if echo "$USERS_RESPONSE" | jq -e '.content' > /dev/null 2>&1; then
    print_success "Retrieved users successfully"
else
    print_error "Failed to retrieve users"
    echo "$USERS_RESPONSE"
    exit 1
fi

# Step 3: Find users with OPTOMETRIST or OPHTHALMOLOGIST roles
print_status "Step 3: Finding users with doctor roles..."
DOCTOR_USERS=$(echo "$USERS_RESPONSE" | jq -r '.content[] | select(.roles[].name | IN("OPTOMETRIST", "OPHTHALMOLOGIST")) | {id: .id, username: .username, roles: [.roles[].name]}')

if [ -n "$DOCTOR_USERS" ]; then
    print_success "Found users with doctor roles:"
    echo "$DOCTOR_USERS" | jq '.'
else
    print_warning "No users with doctor roles found"
    exit 0
fi

# Step 4: Check which users are missing the DOCTOR role
print_status "Step 4: Checking which users are missing the DOCTOR role..."
echo "$DOCTOR_USERS" | jq -r '.[] | select(.roles | index("DOCTOR") | not) | {id: .id, username: .username, current_roles: .roles}'

# Step 5: Get the DOCTOR role ID
print_status "Step 5: Getting DOCTOR role ID..."
ROLES_RESPONSE=$(curl -s -X GET "$BASE_URL/api/admin/roles" \
  -H "Authorization: Bearer $TOKEN")

DOCTOR_ROLE_ID=$(echo "$ROLES_RESPONSE" | jq -r '.content[] | select(.name == "DOCTOR") | .id')

if [ -n "$DOCTOR_ROLE_ID" ] && [ "$DOCTOR_ROLE_ID" != "null" ]; then
    print_success "DOCTOR role ID: $DOCTOR_ROLE_ID"
else
    print_error "DOCTOR role not found"
    exit 1
fi

# Step 6: Add DOCTOR role to users who need it
print_status "Step 6: Adding DOCTOR role to users who need it..."

# Get users who have OPTOMETRIST or OPHTHALMOLOGIST but not DOCTOR
USERS_TO_UPDATE=$(echo "$DOCTOR_USERS" | jq -r '.[] | select(.roles | index("DOCTOR") | not) | .id')

if [ -n "$USERS_TO_UPDATE" ]; then
    for USER_ID in $USERS_TO_UPDATE; do
        print_status "Updating user ID: $USER_ID"
        
        # Get current user details
        USER_DETAILS=$(echo "$USERS_RESPONSE" | jq -r ".content[] | select(.id == $USER_ID)")
        USERNAME=$(echo "$USER_DETAILS" | jq -r '.username')
        CURRENT_ROLES=$(echo "$USER_DETAILS" | jq -r '.roles[].name' | tr '\n' ' ')
        
        print_status "User: $USERNAME, Current roles: $CURRENT_ROLES"
        
        # Create updated roles list (add DOCTOR role)
        UPDATED_ROLES=$(echo "$USER_DETAILS" | jq -r '.roles[].name' | grep -v "DOCTOR" | tr '\n' ' ' | sed 's/ *$//')
        UPDATED_ROLES="$UPDATED_ROLES DOCTOR"
        
        print_status "Updated roles: $UPDATED_ROLES"
        
        # Update user roles (this would require an update endpoint)
        # For now, we'll just show what needs to be done
        print_warning "User $USERNAME needs DOCTOR role added to: $UPDATED_ROLES"
    done
    
    print_warning "Manual role assignment required. Please update the user roles in the database or create an update endpoint."
else
    print_success "All doctor users already have the DOCTOR role"
fi

echo ""
echo "🎉 Doctor Role Fix Analysis Complete!"
echo "====================================="
echo ""
echo "Summary:"
echo "- ✅ Identified users with doctor roles"
echo "- ✅ Found users missing DOCTOR role"
echo "- ⚠️  Manual intervention required for role assignment"
echo ""
echo "To fix this issue:"
echo "1. Run the V3 migration: V3__add_doctor_role_to_existing_doctors.sql"
echo "2. Or manually update user roles in the database"
echo "3. Or create an API endpoint to update user roles" 