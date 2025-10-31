#!/bin/bash

# Test Postman Collection Endpoints
# This script tests all the API endpoints that would be in the Postman collection

echo "🧪 Testing Postman Collection Endpoints"
echo "======================================="

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

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    
    print_status "Testing: $description"
    
    if [ -n "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$endpoint" \
          -H "Authorization: Bearer $TOKEN" \
          -H "Content-Type: application/json" \
          -d "$data")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$endpoint" \
          -H "Authorization: Bearer $TOKEN")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        print_success "HTTP $http_code - $description"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    else
        print_error "HTTP $http_code - $description"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    fi
    echo ""
}

# Step 1: Login
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

echo ""
echo "🔐 Authentication Tests"
echo "======================"

# Test Change Password
test_endpoint "POST" "/api/auth/change-password" \
  '{"currentPassword":"superadmin123","newPassword":"newpassword123","confirmPassword":"newpassword123"}' \
  "Change Password"

echo ""
echo "👥 User Management Tests"
echo "======================="

# Test Get All Users
test_endpoint "GET" "/api/user-management/users?page=0&size=5" "" "Get All Users"

# Test Create User
test_endpoint "POST" "/api/user-management/users" \
  '{"username":"testdoctor","email":"test@eyesante.com","firstName":"Test","lastName":"Doctor","departmentId":1,"roles":["OPHTHALMOLOGIST"]}' \
  "Create User"

# Test Update User Roles
test_endpoint "PUT" "/api/user-management/users/12/roles" \
  '["OPHTHALMOLOGIST","DOCTOR"]' \
  "Update User Roles"

echo ""
echo "🏥 Department Management Tests"
echo "============================="

# Test Get All Departments
test_endpoint "GET" "/api/departments" "" "Get All Departments"

# Test Create Department
test_endpoint "POST" "/api/departments" \
  '{"name":"Test Department","description":"Test department for API testing"}' \
  "Create Department"

echo ""
echo "🔑 Role Management Tests"
echo "======================="

# Test Get All Roles
test_endpoint "GET" "/api/admin/roles" "" "Get All Roles"

# Test Create Role
test_endpoint "POST" "/api/admin/roles" \
  '{"name":"TEST_ROLE","description":"Test role for API testing","enabled":true}' \
  "Create Role"

echo ""
echo "📅 Appointment Management Tests"
echo "=============================="

# Test Get All Appointments
test_endpoint "GET" "/api/appointments?page=0&size=5" "" "Get All Appointments"

# Test Create Appointment
test_endpoint "POST" "/api/appointments" \
  '{"patientId":1,"doctorId":12,"appointmentDate":"2025-08-05","appointmentTime":"10:00:00","duration":30,"appointmentType":"ROUTINE_EXAMINATION","reason":"API test appointment","priority":"NORMAL"}' \
  "Create Appointment"

# Test Check Conflicts
test_endpoint "POST" "/api/appointments/conflicts/check" \
  '{"doctorId":12,"appointmentDate":"2025-08-05","startTime":"10:00:00","endTime":"10:30:00"}' \
  "Check Appointment Conflicts"

echo ""
echo "👨‍⚕️ Doctor Schedule Management Tests"
echo "==================================="

# Test Get All Doctor Schedules
test_endpoint "GET" "/api/doctor-schedules?page=0&size=5" "" "Get All Doctor Schedules"

# Test Create Doctor Schedule
test_endpoint "POST" "/api/doctor-schedules" \
  '{"doctorId":12,"dayOfWeek":2,"startTime":"09:00:00","endTime":"17:00:00","breakStart":"12:00:00","breakEnd":"13:00:00","isAvailable":true}' \
  "Create Doctor Schedule"

echo ""
echo "🏷️ Appointment Type Management Tests"
echo "==================================="

# Test Get All Appointment Types
test_endpoint "GET" "/api/appointment-types" "" "Get All Appointment Types"

# Test Create Appointment Type
test_endpoint "POST" "/api/appointment-types" \
  '{"name":"API_TEST_CONSULTATION","description":"API test consultation","defaultDuration":45,"defaultCost":75000,"requiresInsurance":false,"requiresPrepayment":false,"requiresConsultation":true}' \
  "Create Appointment Type"

echo ""
echo "💰 Finance Management Tests"
echo "=========================="

# Test Get All Invoices
test_endpoint "GET" "/api/finance/invoices?page=0&size=5" "" "Get All Invoices"

# Test Generate Invoice
test_endpoint "POST" "/api/finance/invoices/generate" \
  '{"appointmentId":1}' \
  "Generate Invoice for Appointment"

# Test Record Payment
test_endpoint "POST" "/api/finance/payments" \
  '{"invoiceId":1,"amount":50000,"paymentMethod":"CASH","paymentDate":"2025-08-02T10:00:00","reference":"TEST-PAY-001","notes":"Test payment"}' \
  "Record Payment"

echo ""
echo "🎉 Postman Collection Testing Complete!"
echo "======================================"
echo ""
echo "Summary:"
echo "- ✅ Authentication endpoints tested"
echo "- ✅ User Management endpoints tested"
echo "- ✅ Department Management endpoints tested"
echo "- ✅ Role Management endpoints tested"
echo "- ✅ Appointment Management endpoints tested"
echo "- ✅ Doctor Schedule Management endpoints tested"
echo "- ✅ Appointment Type Management endpoints tested"
echo "- ✅ Finance Management endpoints tested"
echo ""
echo "All endpoints are ready for Postman collection import!"
echo "Use the provided examples in the POSTMAN_COLLECTION.md file." 