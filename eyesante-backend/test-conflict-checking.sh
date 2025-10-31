#!/bin/bash

echo "🧪 Testing Appointment Conflict Checking"
echo "========================================"

# Test if the application is responding
echo "1. Testing application health..."
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5025/api/auth/test)

if [ "$response" = "200" ]; then
    echo "✅ Application is running!"
    
    # Login as super admin
    echo "2. Logging in as super admin..."
    login_response=$(curl -s -X POST http://localhost:5025/api/auth/login \
        -H "Content-Type: application/json" \
        -d '{"username": "superadmin", "password": "superadmin123"}')
    
    if echo "$login_response" | grep -q "accessToken"; then
        echo "✅ Super admin login successful!"
        
        # Extract token
        token=$(echo "$login_response" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
        
        # Get tomorrow's date and ensure it's a weekday
        tomorrow=$(date -v+1d +%Y-%m-%d 2>/dev/null || date -d "tomorrow" +%Y-%m-%d)
        day_of_week=$(date -v+1d +%u 2>/dev/null || date -d "tomorrow" +%u)
        
        # If tomorrow is Sunday (7), use Monday instead
        if [ "$day_of_week" = "7" ]; then
            appointment_date=$(date -v+2d +%Y-%m-%d 2>/dev/null || date -d "tomorrow + 1 day" +%Y-%m-%d)
        else
            appointment_date=$tomorrow
        fi
        
        echo "3. Testing conflict checking for date: $appointment_date"
        
        # Test conflict checking with valid time (should return false - no conflicts)
        echo "4. Testing conflict check with valid time (10:00-10:30)..."
        conflict_response=$(curl -s -X GET "http://localhost:5025/api/appointments/conflicts/check?doctorId=1&date=$appointment_date&startTime=10:00:00&endTime=10:30:00" \
            -H "Authorization: Bearer $token")
        
        if echo "$conflict_response" | grep -q "false"; then
            echo "✅ No conflicts detected for valid time slot"
        else
            echo "❌ Unexpected conflict response for valid time"
            echo "Response: $conflict_response"
        fi
        
        # Test conflict checking with invalid time (should return true - has conflicts)
        echo "5. Testing conflict check with invalid time (07:00-07:30)..."
        conflict_response2=$(curl -s -X GET "http://localhost:5025/api/appointments/conflicts/check?doctorId=1&date=$appointment_date&startTime=07:00:00&endTime=07:30:00" \
            -H "Authorization: Bearer $token")
        
        if echo "$conflict_response2" | grep -q "true"; then
            echo "✅ Conflicts correctly detected for invalid time slot"
        else
            echo "❌ No conflicts detected for invalid time (should have conflicts)"
            echo "Response: $conflict_response2"
        fi
        
        # Test doctor availability endpoint
        echo "6. Testing doctor availability endpoint..."
        availability_response=$(curl -s -X GET "http://localhost:5025/api/appointments/doctor/1/availability?date=$appointment_date&startTime=10:00:00&endTime=10:30:00" \
            -H "Authorization: Bearer $token")
        
        if echo "$availability_response" | grep -q "true"; then
            echo "✅ Doctor availability correctly detected"
        else
            echo "❌ Doctor availability check failed"
            echo "Response: $availability_response"
        fi
        
        echo "🎉 Conflict checking tests completed!"
        
    else
        echo "❌ Super admin login failed"
        echo "Response: $login_response"
    fi
else
    echo "❌ Application not responding (HTTP $response)"
    echo "💡 Try running: ./mvnw spring-boot:run"
fi 