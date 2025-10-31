#!/bin/bash

echo "🧪 Testing Doctor Schedules"
echo "============================"

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
        
        # Test getting doctor schedules
        echo "3. Testing doctor schedules retrieval..."
        schedules_response=$(curl -s -X GET http://localhost:5025/api/doctor-schedules \
            -H "Authorization: Bearer $token")
        
        if echo "$schedules_response" | grep -q "doctorId"; then
            echo "✅ Doctor schedules are available!"
            echo "📋 Available schedules:"
            echo "$schedules_response" | jq -r '.[] | "  - Dr. \(.doctorName): \(.dayName) \(.startTime)-\(.endTime)"' 2>/dev/null || echo "$schedules_response"
        else
            echo "❌ No doctor schedules found"
            echo "Response: $schedules_response"
        fi
        
        # Test creating an appointment with proper timing
        echo "4. Testing appointment creation with proper doctor schedule..."
        
        # Get tomorrow's date and ensure it's a weekday
        tomorrow=$(date -v+1d +%Y-%m-%d 2>/dev/null || date -d "tomorrow" +%Y-%m-%d)
        day_of_week=$(date -v+1d +%u 2>/dev/null || date -d "tomorrow" +%u)
        
        # If tomorrow is Sunday (7), use Monday instead
        if [ "$day_of_week" = "7" ]; then
            appointment_date=$(date -v+2d +%Y-%m-%d 2>/dev/null || date -d "tomorrow + 1 day" +%Y-%m-%d)
        else
            appointment_date=$tomorrow
        fi
        
        appointment_response=$(curl -s -X POST http://localhost:5025/api/appointments \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $token" \
            -d '{
                "patientId": 1,
                "patientName": "Test Patient",
                "patientPhone": "1234567890",
                "patientEmail": "test@example.com",
                "doctorId": 1,
                "doctorName": "Dr. Test",
                "doctorSpecialty": "Optometry",
                "appointmentDate": "'$appointment_date'",
                "appointmentTime": "10:00:00",
                "duration": 30,
                "appointmentType": "CONTACT_LENS_FITTING",
                "reason": "Contact lens fitting",
                "priority": "NORMAL",
                "notes": "Test appointment"
            }')
        
        if echo "$appointment_response" | grep -q "id"; then
            echo "✅ Appointment created successfully!"
            echo "📅 Appointment scheduled for: $appointment_date at 10:00 AM"
        else
            echo "❌ Failed to create appointment"
            echo "Response: $appointment_response"
        fi
        
    else
        echo "❌ Super admin login failed"
        echo "Response: $login_response"
    fi
else
    echo "❌ Application not responding (HTTP $response)"
    echo "💡 Try running: ./mvnw spring-boot:run"
fi 