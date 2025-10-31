# Appointment API Specification

## Overview
This document outlines the complete appointment functionality that the backend should implement for the Eyesante system. The appointment system should handle scheduling, management, and tracking of patient appointments.

## Data Models

### 1. Appointment Entity

```json
{
  "id": 1,
  "patientId": 101,
  "patientName": "John Doe",
  "patientPhone": "+256701234567",
  "patientEmail": "john.doe@email.com",
  "doctorId": 201,
  "doctorName": "Dr. Sarah Smith",
  "doctorSpecialty": "OPTOMETRIST",
  "appointmentDate": "2025-01-28",
  "appointmentTime": "09:00",
  "endTime": "09:30",
  "duration": 30,
  "appointmentType": "ROUTINE_EXAMINATION",
  "reason": "Annual eye checkup",
  "status": "CONFIRMED",
  "priority": "NORMAL",
  "notes": "Patient requested morning appointment",
  "createdBy": "receptionist1",
  "createdAt": "2025-01-27T10:30:00Z",
  "updatedAt": "2025-01-27T10:30:00Z",
  "cancelledAt": null,
  "cancelledBy": null,
  "cancellationReason": null,
  "reminderSent": false,
  "reminderSentAt": null,
  "checkInTime": null,
  "checkOutTime": null,
  "actualDuration": null,
  "followUpRequired": false,
  "followUpDate": null,
  "insuranceProvider": "NHIF",
  "insuranceNumber": "NHIF123456789",
  "cost": 50000,
  "paymentStatus": "PAID",
  "paymentMethod": "CASH"
}
```

### 2. Appointment Type Enum

```json
{
  "appointmentTypes": [
    "ROUTINE_EXAMINATION",
    "FOLLOW_UP",
    "EMERGENCY",
    "SURGERY_CONSULTATION",
    "PRESCRIPTION_RENEWAL",
    "DIAGNOSTIC_TEST",
    "PRE_OPERATIVE_ASSESSMENT",
    "POST_OPERATIVE_FOLLOW_UP",
    "VISION_THERAPY",
    "CONTACT_LENS_FITTING",
    "GLASSES_FITTING",
    "GLAUCOMA_SCREENING",
    "CATARACT_EVALUATION",
    "RETINAL_EXAMINATION",
    "PEDIATRIC_EXAMINATION"
  ]
}
```

### 3. Appointment Status Enum

```json
{
  "appointmentStatuses": [
    "SCHEDULED",
    "CONFIRMED",
    "CHECKED_IN",
    "IN_PROGRESS",
    "COMPLETED",
    "CANCELLED",
    "NO_SHOW",
    "RESCHEDULED",
    "WAITING",
    "READY"
  ]
}
```

### 4. Priority Levels

```json
{
  "priorities": [
    "LOW",
    "NORMAL",
    "HIGH",
    "URGENT",
    "EMERGENCY"
  ]
}
```

## API Endpoints

### 1. Create Appointment

**POST** `/api/appointments`

**Request Body:**
```json
{
  "patientId": 101,
  "doctorId": 201,
  "appointmentDate": "2025-01-28",
  "appointmentTime": "09:00",
  "duration": 30,
  "appointmentType": "ROUTINE_EXAMINATION",
  "reason": "Annual eye checkup",
  "priority": "NORMAL",
  "notes": "Patient requested morning appointment",
  "insuranceProvider": "NHIF",
  "insuranceNumber": "NHIF123456789",
  "cost": 50000
}
```

**Response:**
```json
{
  "id": 1,
  "patientId": 101,
  "patientName": "John Doe",
  "patientPhone": "+256701234567",
  "doctorId": 201,
  "doctorName": "Dr. Sarah Smith",
  "appointmentDate": "2025-01-28",
  "appointmentTime": "09:00",
  "endTime": "09:30",
  "duration": 30,
  "appointmentType": "ROUTINE_EXAMINATION",
  "reason": "Annual eye checkup",
  "status": "SCHEDULED",
  "priority": "NORMAL",
  "notes": "Patient requested morning appointment",
  "createdBy": "receptionist1",
  "createdAt": "2025-01-27T10:30:00Z",
  "updatedAt": "2025-01-27T10:30:00Z"
}
```

### 2. Get All Appointments (Paginated)

**GET** `/api/appointments?page=0&size=10&sort=appointmentDate,asc&status=CONFIRMED&doctorId=201&date=2025-01-28`

**Query Parameters:**
- `page`: Page number (default: 0)
- `size`: Page size (default: 10)
- `sort`: Sort field and direction (e.g., "appointmentDate,asc")
- `status`: Filter by appointment status
- `doctorId`: Filter by doctor
- `date`: Filter by specific date
- `patientId`: Filter by patient
- `appointmentType`: Filter by appointment type

**Response:**
```json
{
  "content": [
    {
      "id": 1,
      "patientId": 101,
      "patientName": "John Doe",
      "patientPhone": "+256701234567",
      "doctorId": 201,
      "doctorName": "Dr. Sarah Smith",
      "appointmentDate": "2025-01-28",
      "appointmentTime": "09:00",
      "endTime": "09:30",
      "duration": 30,
      "appointmentType": "ROUTINE_EXAMINATION",
      "reason": "Annual eye checkup",
      "status": "CONFIRMED",
      "priority": "NORMAL",
      "notes": "Patient requested morning appointment",
      "createdAt": "2025-01-27T10:30:00Z"
    }
  ],
  "totalElements": 25,
  "totalPages": 3,
  "size": 10,
  "number": 0,
  "first": true,
  "last": false,
  "numberOfElements": 10,
  "empty": false
}
```

### 3. Get Appointment by ID

**GET** `/api/appointments/{id}`

**Response:**
```json
{
  "id": 1,
  "patientId": 101,
  "patientName": "John Doe",
  "patientPhone": "+256701234567",
  "patientEmail": "john.doe@email.com",
  "doctorId": 201,
  "doctorName": "Dr. Sarah Smith",
  "doctorSpecialty": "OPTOMETRIST",
  "appointmentDate": "2025-01-28",
  "appointmentTime": "09:00",
  "endTime": "09:30",
  "duration": 30,
  "appointmentType": "ROUTINE_EXAMINATION",
  "reason": "Annual eye checkup",
  "status": "CONFIRMED",
  "priority": "NORMAL",
  "notes": "Patient requested morning appointment",
  "createdBy": "receptionist1",
  "createdAt": "2025-01-27T10:30:00Z",
  "updatedAt": "2025-01-27T10:30:00Z",
  "checkInTime": null,
  "checkOutTime": null,
  "actualDuration": null,
  "followUpRequired": false,
  "followUpDate": null,
  "insuranceProvider": "NHIF",
  "insuranceNumber": "NHIF123456789",
  "cost": 50000,
  "paymentStatus": "PAID",
  "paymentMethod": "CASH"
}
```

### 4. Update Appointment

**PUT** `/api/appointments/{id}`

**Request Body:**
```json
{
  "appointmentDate": "2025-01-29",
  "appointmentTime": "10:00",
  "duration": 45,
  "reason": "Follow-up examination",
  "notes": "Rescheduled due to doctor availability",
  "status": "RESCHEDULED"
}
```

### 5. Cancel Appointment

**PATCH** `/api/appointments/{id}/cancel`

**Request Body:**
```json
{
  "cancellationReason": "Patient requested cancellation",
  "cancelledBy": "receptionist1"
}
```

### 6. Check In Patient

**PATCH** `/api/appointments/{id}/check-in`

**Request Body:**
```json
{
  "checkedInBy": "receptionist1",
  "checkInTime": "2025-01-28T09:05:00Z"
}
```

### 7. Check Out Patient

**PATCH** `/api/appointments/{id}/check-out`

**Request Body:**
```json
{
  "checkedOutBy": "doctor1",
  "checkOutTime": "2025-01-28T09:35:00Z",
  "actualDuration": 30,
  "followUpRequired": true,
  "followUpDate": "2025-02-15"
}
```

### 8. Get Available Time Slots

**GET** `/api/appointments/available-slots?doctorId=201&date=2025-01-28&duration=30`

**Response:**
```json
{
  "availableSlots": [
    {
      "startTime": "08:00",
      "endTime": "08:30",
      "available": true
    },
    {
      "startTime": "08:30",
      "endTime": "09:00",
      "available": true
    },
    {
      "startTime": "09:00",
      "endTime": "09:30",
      "available": false,
      "reason": "Appointment booked"
    },
    {
      "startTime": "09:30",
      "endTime": "10:00",
      "available": true
    }
  ],
  "doctorSchedule": {
    "startTime": "08:00",
    "endTime": "17:00",
    "breakStart": "12:00",
    "breakEnd": "13:00"
  }
}
```

### 9. Get Appointment Statistics

**GET** `/api/appointments/statistics?date=2025-01-28&doctorId=201`

**Response:**
```json
{
  "totalAppointments": 15,
  "confirmedAppointments": 12,
  "completedAppointments": 8,
  "cancelledAppointments": 2,
  "noShows": 1,
  "waitingAppointments": 3,
  "inProgressAppointments": 1,
  "averageWaitTime": 15,
  "averageDuration": 25,
  "revenue": 750000,
  "appointmentsByType": {
    "ROUTINE_EXAMINATION": 8,
    "FOLLOW_UP": 4,
    "EMERGENCY": 2,
    "SURGERY_CONSULTATION": 1
  },
  "appointmentsByStatus": {
    "CONFIRMED": 12,
    "COMPLETED": 8,
    "CANCELLED": 2,
    "NO_SHOW": 1,
    "WAITING": 3,
    "IN_PROGRESS": 1
  }
}
```

### 10. Send Appointment Reminders

**POST** `/api/appointments/{id}/send-reminder`

**Request Body:**
```json
{
  "reminderType": "SMS",
  "message": "Reminder: You have an appointment tomorrow at 09:00 AM"
}
```

### 11. Get Today's Appointments

**GET** `/api/appointments/today?doctorId=201&status=CONFIRMED`

**Response:**
```json
{
  "content": [
    {
      "id": 1,
      "patientName": "John Doe",
      "patientPhone": "+256701234567",
      "appointmentTime": "09:00",
      "endTime": "09:30",
      "appointmentType": "ROUTINE_EXAMINATION",
      "status": "CONFIRMED",
      "checkInTime": null,
      "waitingTime": null
    }
  ],
  "totalElements": 8,
  "statistics": {
    "total": 8,
    "confirmed": 6,
    "checkedIn": 2,
    "waiting": 1,
    "completed": 3
  }
}
```

## Database Schema

### Appointments Table

```sql
CREATE TABLE appointments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    patient_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration INT NOT NULL,
    appointment_type VARCHAR(50) NOT NULL,
    reason TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED',
    priority VARCHAR(20) NOT NULL DEFAULT 'NORMAL',
    notes TEXT,
    created_by VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    cancelled_at TIMESTAMP NULL,
    cancelled_by VARCHAR(100) NULL,
    cancellation_reason TEXT NULL,
    reminder_sent BOOLEAN DEFAULT FALSE,
    reminder_sent_at TIMESTAMP NULL,
    check_in_time TIMESTAMP NULL,
    check_out_time TIMESTAMP NULL,
    actual_duration INT NULL,
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date DATE NULL,
    insurance_provider VARCHAR(100) NULL,
    insurance_number VARCHAR(100) NULL,
    cost DECIMAL(10,2) NULL,
    payment_status VARCHAR(20) DEFAULT 'PENDING',
    payment_method VARCHAR(20) NULL,
    
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (doctor_id) REFERENCES users(id),
    INDEX idx_appointment_date (appointment_date),
    INDEX idx_doctor_date (doctor_id, appointment_date),
    INDEX idx_status (status),
    INDEX idx_patient (patient_id)
);
```

### Doctor Schedules Table

```sql
CREATE TABLE doctor_schedules (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    doctor_id BIGINT NOT NULL,
    day_of_week INT NOT NULL, -- 1=Monday, 7=Sunday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    break_start TIME NULL,
    break_end TIME NULL,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (doctor_id) REFERENCES users(id),
    UNIQUE KEY unique_doctor_day (doctor_id, day_of_week)
);
```

### Appointment Reminders Table

```sql
CREATE TABLE appointment_reminders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    appointment_id BIGINT NOT NULL,
    reminder_type VARCHAR(20) NOT NULL, -- SMS, EMAIL, PUSH
    message TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'SENT', -- SENT, FAILED, PENDING
    
    FOREIGN KEY (appointment_id) REFERENCES appointments(id)
);
```

## Business Rules

### 1. Appointment Scheduling Rules
- **Time Slot Validation**: Check for conflicts before scheduling
- **Doctor Availability**: Verify doctor's schedule and existing appointments
- **Duration Limits**: Respect appointment duration constraints
- **Buffer Time**: Add buffer time between appointments (e.g., 15 minutes)
- **Working Hours**: Only schedule during clinic operating hours

### 2. Status Transitions
```
SCHEDULED → CONFIRMED → CHECKED_IN → IN_PROGRESS → COMPLETED
     ↓           ↓           ↓           ↓
  CANCELLED   CANCELLED   CANCELLED   CANCELLED
     ↓           ↓           ↓
  NO_SHOW     NO_SHOW     NO_SHOW
```

### 3. Priority Handling
- **Emergency**: Immediate scheduling, can override existing appointments
- **Urgent**: Schedule within 24 hours
- **High**: Schedule within 3 days
- **Normal**: Standard scheduling
- **Low**: Flexible scheduling

### 4. Reminder System
- **SMS Reminders**: 24 hours before appointment
- **Email Reminders**: 48 hours before appointment
- **Follow-up Reminders**: For missed appointments

### 5. Payment Integration
- **Pre-payment**: Required for certain appointment types
- **Insurance**: Validate insurance coverage
- **Payment Status**: Track payment completion

## Error Handling

### Common Error Responses

```json
{
  "error": "TIME_SLOT_CONFLICT",
  "message": "The requested time slot is not available",
  "details": {
    "conflictingAppointment": {
      "id": 123,
      "patientName": "Jane Smith",
      "appointmentTime": "09:00"
    },
    "availableSlots": [
      "09:30",
      "10:00",
      "10:30"
    ]
  },
  "timestamp": "2025-01-27T10:30:00Z"
}
```

### Error Codes
- `TIME_SLOT_CONFLICT`: Requested time slot is already booked
- `DOCTOR_UNAVAILABLE`: Doctor is not available at requested time
- `PATIENT_NOT_FOUND`: Patient does not exist
- `DOCTOR_NOT_FOUND`: Doctor does not exist
- `INVALID_APPOINTMENT_TYPE`: Invalid appointment type
- `PAST_DATE`: Cannot schedule appointment in the past
- `INVALID_DURATION`: Duration exceeds maximum allowed
- `APPOINTMENT_NOT_FOUND`: Appointment does not exist
- `INVALID_STATUS_TRANSITION`: Invalid status change
- `PAYMENT_REQUIRED`: Payment required before confirmation

## Security Considerations

1. **Authentication**: All endpoints require valid JWT token
2. **Authorization**: Role-based access control
3. **Data Validation**: Input validation and sanitization
4. **Audit Trail**: Log all appointment changes
5. **Rate Limiting**: Prevent API abuse
6. **Data Encryption**: Encrypt sensitive patient data

## Performance Considerations

1. **Database Indexing**: Proper indexes for frequent queries
2. **Caching**: Cache doctor schedules and available slots
3. **Pagination**: Implement proper pagination for large datasets
4. **Async Processing**: Handle reminders and notifications asynchronously
5. **Connection Pooling**: Efficient database connection management

This specification provides a comprehensive foundation for implementing a robust appointment system in the backend. 