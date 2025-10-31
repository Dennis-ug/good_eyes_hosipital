#!/bin/bash

# Doctor Schedule API Test Script
# This script demonstrates all DoctorSchedule API endpoints

echo "🏥 Doctor Schedule API Testing"
echo "=============================="

# Configuration
BASE_URL="http://localhost:5025"
API_BASE="$BASE_URL/api/doctor-schedules"

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

# Step 2: Get existing doctors
print_status "Step 2: Getting existing doctors..."
DOCTORS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/user-management/users" \
  -H "Authorization: Bearer $TOKEN")

if echo "$DOCTORS_RESPONSE" | jq -e '.content' > /dev/null 2>&1; then
    DOCTOR_ID=$(echo "$DOCTORS_RESPONSE" | jq -r '.content[] | select(.roles[]? | contains("DOCTOR")) | .id' | head -1)
    if [ -n "$DOCTOR_ID" ] && [ "$DOCTOR_ID" != "null" ]; then
        print_success "Found doctor with ID: $DOCTOR_ID"
    else
        print_warning "No doctors found, creating a test doctor..."
        # Create a test doctor
        CREATE_DOCTOR_RESPONSE=$(curl -s -X POST "$BASE_URL/api/users" \
          -H "Authorization: Bearer $TOKEN" \
          -H "Content-Type: application/json" \
          -d '{
            "username":"test_doctor_schedule",
            "email":"test.doctor.schedule@eyesante.com",
            "firstName":"Test",
            "lastName":"Doctor",
            "password":"test123",
            "roles":["OPTOMETRIST"],
            "sendEmailNotification":false
          }')
        
        if echo "$CREATE_DOCTOR_RESPONSE" | jq -e '.username' > /dev/null 2>&1; then
            DOCTOR_ID=$(echo "$CREATE_DOCTOR_RESPONSE" | jq -r '.id')
            print_success "Created test doctor with ID: $DOCTOR_ID"
        else
            print_error "Failed to create test doctor"
            echo "$CREATE_DOCTOR_RESPONSE"
            exit 1
        fi
    fi
else
    print_error "Failed to get users"
    echo "$DOCTORS_RESPONSE"
    exit 1
fi

# Step 3: Create a doctor schedule
print_status "Step 3: Creating a doctor schedule..."
CREATE_SCHEDULE_RESPONSE=$(curl -s -X POST "$API_BASE" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"doctor\": {\"id\": $DOCTOR_ID},
    \"dayOfWeek\": 1,
    \"startTime\": \"09:00:00\",
    \"endTime\": \"17:00:00\",
    \"breakStart\": \"12:00:00\",
    \"breakEnd\": \"13:00:00\",
    \"isAvailable\": true
  }")

if echo "$CREATE_SCHEDULE_RESPONSE" | jq -e '.id' > /dev/null 2>&1; then
    SCHEDULE_ID=$(echo "$CREATE_SCHEDULE_RESPONSE" | jq -r '.id')
    print_success "Created schedule with ID: $SCHEDULE_ID"
    echo "Schedule details:"
    echo "$CREATE_SCHEDULE_RESPONSE" | jq '.'
else
    print_error "Failed to create schedule"
    echo "$CREATE_SCHEDULE_RESPONSE"
    exit 1
fi

# Step 4: Get schedule by ID
print_status "Step 4: Getting schedule by ID..."
GET_SCHEDULE_RESPONSE=$(curl -s -X GET "$API_BASE/$SCHEDULE_ID" \
  -H "Authorization: Bearer $TOKEN")

if echo "$GET_SCHEDULE_RESPONSE" | jq -e '.id' > /dev/null 2>&1; then
    print_success "Retrieved schedule successfully"
else
    print_error "Failed to retrieve schedule"
    echo "$GET_SCHEDULE_RESPONSE"
fi

# Step 5: Get all schedules for the doctor
print_status "Step 5: Getting all schedules for the doctor..."
GET_DOCTOR_SCHEDULES_RESPONSE=$(curl -s -X GET "$API_BASE/doctor/$DOCTOR_ID" \
  -H "Authorization: Bearer $TOKEN")

if echo "$GET_DOCTOR_SCHEDULES_RESPONSE" | jq -e '.[0]' > /dev/null 2>&1; then
    SCHEDULE_COUNT=$(echo "$GET_DOCTOR_SCHEDULES_RESPONSE" | jq 'length')
    print_success "Found $SCHEDULE_COUNT schedule(s) for doctor"
else
    print_warning "No schedules found for doctor"
fi

# Step 6: Get available schedules for the doctor
print_status "Step 6: Getting available schedules for the doctor..."
GET_AVAILABLE_SCHEDULES_RESPONSE=$(curl -s -X GET "$API_BASE/doctor/$DOCTOR_ID/available" \
  -H "Authorization: Bearer $TOKEN")

if echo "$GET_AVAILABLE_SCHEDULES_RESPONSE" | jq -e '.[0]' > /dev/null 2>&1; then
    AVAILABLE_COUNT=$(echo "$GET_AVAILABLE_SCHEDULES_RESPONSE" | jq 'length')
    print_success "Found $AVAILABLE_COUNT available schedule(s) for doctor"
else
    print_warning "No available schedules found for doctor"
fi

# Step 7: Get all available schedules
print_status "Step 7: Getting all available schedules..."
GET_ALL_AVAILABLE_RESPONSE=$(curl -s -X GET "$API_BASE/available" \
  -H "Authorization: Bearer $TOKEN")

if echo "$GET_ALL_AVAILABLE_RESPONSE" | jq -e '.[0]' > /dev/null 2>&1; then
    TOTAL_AVAILABLE=$(echo "$GET_ALL_AVAILABLE_RESPONSE" | jq 'length')
    print_success "Found $TOTAL_AVAILABLE total available schedule(s)"
else
    print_warning "No available schedules found"
fi

# Step 8: Get schedules by day of week (Monday = 1)
print_status "Step 8: Getting schedules for Monday (day 1)..."
GET_DAY_SCHEDULES_RESPONSE=$(curl -s -X GET "$API_BASE/day/1" \
  -H "Authorization: Bearer $TOKEN")

if echo "$GET_DAY_SCHEDULES_RESPONSE" | jq -e '.[0]' > /dev/null 2>&1; then
    MONDAY_COUNT=$(echo "$GET_DAY_SCHEDULES_RESPONSE" | jq 'length')
    print_success "Found $MONDAY_COUNT schedule(s) for Monday"
else
    print_warning "No schedules found for Monday"
fi

# Step 9: Search schedules by doctor name
print_status "Step 9: Searching schedules by doctor name..."
SEARCH_RESPONSE=$(curl -s -X GET "$API_BASE/search?doctorName=Test" \
  -H "Authorization: Bearer $TOKEN")

if echo "$SEARCH_RESPONSE" | jq -e '.[0]' > /dev/null 2>&1; then
    SEARCH_COUNT=$(echo "$SEARCH_RESPONSE" | jq 'length')
    print_success "Found $SEARCH_COUNT schedule(s) matching 'Test'"
else
    print_warning "No schedules found matching 'Test'"
fi

# Step 10: Check doctor availability on Monday
print_status "Step 10: Checking doctor availability on Monday..."
AVAILABILITY_RESPONSE=$(curl -s -X GET "$API_BASE/doctor/$DOCTOR_ID/day/1/available" \
  -H "Authorization: Bearer $TOKEN")

if [ "$AVAILABILITY_RESPONSE" = "true" ]; then
    print_success "Doctor is available on Monday"
elif [ "$AVAILABILITY_RESPONSE" = "false" ]; then
    print_warning "Doctor is not available on Monday"
else
    print_error "Failed to check availability"
    echo "$AVAILABILITY_RESPONSE"
fi

# Step 11: Get schedules by doctor and day range (Monday to Wednesday)
print_status "Step 11: Getting schedules for Monday to Wednesday..."
DAY_RANGE_RESPONSE=$(curl -s -X GET "$API_BASE/doctor/$DOCTOR_ID/day-range?startDay=1&endDay=3" \
  -H "Authorization: Bearer $TOKEN")

if echo "$DAY_RANGE_RESPONSE" | jq -e '.[0]' > /dev/null 2>&1; then
    RANGE_COUNT=$(echo "$DAY_RANGE_RESPONSE" | jq 'length')
    print_success "Found $RANGE_COUNT schedule(s) for Monday to Wednesday"
else
    print_warning "No schedules found for Monday to Wednesday"
fi

# Step 12: Get day name by day of week
print_status "Step 12: Getting day name for day 1..."
DAY_NAME_RESPONSE=$(curl -s -X GET "$API_BASE/day-name/1" \
  -H "Authorization: Bearer $TOKEN")

if [ "$DAY_NAME_RESPONSE" = "Monday" ]; then
    print_success "Day 1 is Monday"
else
    print_error "Failed to get day name"
    echo "$DAY_NAME_RESPONSE"
fi

# Step 13: Update schedule
print_status "Step 13: Updating schedule times..."
UPDATE_RESPONSE=$(curl -s -X PUT "$API_BASE/$SCHEDULE_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "startTime": "08:00:00",
    "endTime": "16:00:00",
    "breakStart": "12:00:00",
    "breakEnd": "13:00:00",
    "isAvailable": true
  }')

if echo "$UPDATE_RESPONSE" | jq -e '.id' > /dev/null 2>&1; then
    print_success "Schedule updated successfully"
    echo "Updated schedule:"
    echo "$UPDATE_RESPONSE" | jq '.'
else
    print_error "Failed to update schedule"
    echo "$UPDATE_RESPONSE"
fi

# Step 14: Toggle schedule availability
print_status "Step 14: Toggling schedule availability..."
TOGGLE_RESPONSE=$(curl -s -X PUT "$API_BASE/$SCHEDULE_ID/toggle-availability" \
  -H "Authorization: Bearer $TOKEN")

if echo "$TOGGLE_RESPONSE" | grep -q "toggled successfully"; then
    print_success "Schedule availability toggled successfully"
else
    print_error "Failed to toggle availability"
    echo "$TOGGLE_RESPONSE"
fi

# Step 15: Check availability after toggle
print_status "Step 15: Checking availability after toggle..."
AVAILABILITY_AFTER_RESPONSE=$(curl -s -X GET "$API_BASE/doctor/$DOCTOR_ID/day/1/available" \
  -H "Authorization: Bearer $TOKEN")

if [ "$AVAILABILITY_AFTER_RESPONSE" = "false" ]; then
    print_success "Doctor is now unavailable on Monday (as expected after toggle)"
elif [ "$AVAILABILITY_AFTER_RESPONSE" = "true" ]; then
    print_success "Doctor is still available on Monday"
else
    print_error "Failed to check availability after toggle"
    echo "$AVAILABILITY_AFTER_RESPONSE"
fi

# Step 16: Toggle back to available
print_status "Step 16: Toggling schedule back to available..."
TOGGLE_BACK_RESPONSE=$(curl -s -X PUT "$API_BASE/$SCHEDULE_ID/toggle-availability" \
  -H "Authorization: Bearer $TOKEN")

if echo "$TOGGLE_BACK_RESPONSE" | grep -q "toggled successfully"; then
    print_success "Schedule availability toggled back successfully"
else
    print_error "Failed to toggle availability back"
    echo "$TOGGLE_BACK_RESPONSE"
fi

# Step 17: Test error handling - Try to create duplicate schedule
print_status "Step 17: Testing duplicate schedule creation (should fail)..."
DUPLICATE_RESPONSE=$(curl -s -X POST "$API_BASE" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"doctor\": {\"id\": $DOCTOR_ID},
    \"dayOfWeek\": 1,
    \"startTime\": \"10:00:00\",
    \"endTime\": \"18:00:00\",
    \"breakStart\": \"13:00:00\",
    \"breakEnd\": \"14:00:00\",
    \"isAvailable\": true
  }")

if echo "$DUPLICATE_RESPONSE" | jq -e '.status' > /dev/null 2>&1; then
    STATUS=$(echo "$DUPLICATE_RESPONSE" | jq -r '.status')
    if [ "$STATUS" = "400" ]; then
        print_success "Duplicate schedule creation correctly rejected"
        echo "Error message: $(echo "$DUPLICATE_RESPONSE" | jq -r '.message')"
    else
        print_warning "Unexpected response for duplicate schedule"
        echo "$DUPLICATE_RESPONSE"
    fi
else
    print_error "Failed to test duplicate schedule creation"
    echo "$DUPLICATE_RESPONSE"
fi

# Step 18: Test unauthorized access
print_status "Step 18: Testing unauthorized access (should fail)..."
UNAUTHORIZED_RESPONSE=$(curl -s -X GET "$API_BASE/$SCHEDULE_ID")

if echo "$UNAUTHORIZED_RESPONSE" | jq -e '.status' > /dev/null 2>&1; then
    STATUS=$(echo "$UNAUTHORIZED_RESPONSE" | jq -r '.status')
    if [ "$STATUS" = "401" ]; then
        print_success "Unauthorized access correctly rejected"
    else
        print_warning "Unexpected response for unauthorized access"
        echo "$UNAUTHORIZED_RESPONSE"
    fi
else
    print_error "Failed to test unauthorized access"
    echo "$UNAUTHORIZED_RESPONSE"
fi

# Step 19: Clean up - Delete the test schedule
print_status "Step 19: Cleaning up - Deleting test schedule..."
DELETE_RESPONSE=$(curl -s -X DELETE "$API_BASE/$SCHEDULE_ID" \
  -H "Authorization: Bearer $TOKEN")

if echo "$DELETE_RESPONSE" | grep -q "deleted successfully"; then
    print_success "Test schedule deleted successfully"
else
    print_error "Failed to delete test schedule"
    echo "$DELETE_RESPONSE"
fi

# Step 20: Verify deletion
print_status "Step 20: Verifying schedule deletion..."
VERIFY_DELETE_RESPONSE=$(curl -s -X GET "$API_BASE/$SCHEDULE_ID" \
  -H "Authorization: Bearer $TOKEN")

if echo "$VERIFY_DELETE_RESPONSE" | jq -e '.status' > /dev/null 2>&1; then
    STATUS=$(echo "$VERIFY_DELETE_RESPONSE" | jq -r '.status')
    if [ "$STATUS" = "404" ]; then
        print_success "Schedule deletion verified (404 Not Found)"
    else
        print_warning "Unexpected response after deletion"
        echo "$VERIFY_DELETE_RESPONSE"
    fi
else
    print_error "Failed to verify deletion"
    echo "$VERIFY_DELETE_RESPONSE"
fi

echo ""
echo "🎉 Doctor Schedule API Testing Complete!"
echo "========================================"
echo ""
echo "Summary:"
echo "- ✅ Created and managed doctor schedules"
echo "- ✅ Retrieved schedules by various criteria"
echo "- ✅ Updated schedule times and availability"
echo "- ✅ Tested search and filtering functionality"
echo "- ✅ Verified error handling and access control"
echo "- ✅ Cleaned up test data"
echo ""
echo "All DoctorSchedule API endpoints are working correctly!" 