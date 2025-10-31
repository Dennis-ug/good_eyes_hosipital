#!/bin/bash

echo "🧪 Testing Appointment Types"
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
        
        # Test getting all appointment types
        echo "3. Testing appointment types retrieval..."
        appointment_types_response=$(curl -s -X GET http://localhost:5025/api/appointment-types \
            -H "Authorization: Bearer $token")
        
        if echo "$appointment_types_response" | grep -q "CONTACT_LENS_FITTING"; then
            echo "✅ Appointment types are properly initialized!"
            echo "📋 Available appointment types:"
            echo "$appointment_types_response" | jq -r '.[] | "  - \(.name): \(.description)"' 2>/dev/null || echo "$appointment_types_response"
        else
            echo "❌ Appointment types not found or not properly initialized"
            echo "Response: $appointment_types_response"
        fi
        
        # Test creating an appointment with CONTACT_LENS_FITTING
        echo "4. Testing appointment creation with CONTACT_LENS_FITTING..."
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
                "appointmentDate": "2025-08-03",
                "appointmentTime": "10:00:00",
                "duration": 30,
                "appointmentType": "CONTACT_LENS_FITTING",
                "reason": "Contact lens fitting",
                "priority": "NORMAL",
                "notes": "Test appointment"
            }')
        
        if echo "$appointment_response" | grep -q "id"; then
            echo "✅ Appointment created successfully with CONTACT_LENS_FITTING!"
        else
            echo "❌ Failed to create appointment with CONTACT_LENS_FITTING"
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