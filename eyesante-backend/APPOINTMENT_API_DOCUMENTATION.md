# Appointment API Documentation

## Overview
The Appointment API provides comprehensive functionality for managing eye clinic appointments, including creation, scheduling, status management, and conflict checking.

## Base URL
```
http://localhost:5025/api/appointments
```

## Authentication
All endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Data Types

### Appointment Types
- `ROUTINE_EXAMINATION` - Regular eye examination
- `FOLLOW_UP` - Follow-up examination
- `EMERGENCY` - Urgent eye care
- `SURGERY_CONSULTATION` - Surgical consultation
- `PRESCRIPTION_RENEWAL` - Prescription updates
- `DIAGNOSTIC_TEST` - Diagnostic testing
- `PRE_OPERATIVE_ASSESSMENT` - Pre-surgery assessment
- `POST_OPERATIVE_FOLLOW_UP` - Post-surgery follow-up
- `VISION_THERAPY` - Vision therapy sessions
- `CONTACT_LENS_FITTING` - Contact lens fitting
- `GLASSES_FITTING` - Glasses fitting
- `GLAUCOMA_SCREENING` - Glaucoma screening
- `CATARACT_EVALUATION` - Cataract assessment
- `RETINAL_EXAMINATION` - Retinal examination
- `PEDIATRIC_EXAMINATION` - Children's eye examination

### Appointment Priorities
- `LOW` - Low priority
- `NORMAL` - Normal priority (default)
- `HIGH` - High priority
- `URGENT` - Urgent priority
- `EMERGENCY` - Emergency priority

### Appointment Statuses
- `SCHEDULED` - Appointment scheduled
- `CONFIRMED` - Appointment confirmed
- `CHECKED_IN` - Patient checked in
- `IN_PROGRESS` - Appointment in progress
- `COMPLETED` - Appointment completed
- `CANCELLED` - Appointment cancelled
- `NO_SHOW` - Patient didn't show up
- `RESCHEDULED` - Appointment rescheduled
- `WAITING` - Patient waiting
- `READY` - Patient ready for appointment

### Payment Statuses
- `PENDING` - Payment pending (default)
- `PAID` - Payment completed
- `PARTIAL` - Partial payment
- `REFUNDED` - Payment refunded

### Payment Methods
- `CASH` - Cash payment
- `MOBILE_MONEY` - Mobile money
- `BANK_TRANSFER` - Bank transfer
- `CARD` - Card payment
- `INSURANCE` - Insurance payment

## Endpoints

### 1. Create Appointment
**POST** `/api/appointments`

Creates a new appointment with validation for doctor availability and scheduling conflicts.

**Required Roles:** `RECEPTIONIST`, `DOCTOR`, `SUPER_ADMIN`

**Request Body:**
```json
{
  "patientId": 1,
  "patientName": "John Doe",
  "patientPhone": "1234567890",
  "patientEmail": "john.doe@example.com",
  "doctorId": 1,
  "doctorName": "Dr. Smith",
  "doctorSpecialty": "Optometry",
  "appointmentDate": "2025-08-05",
  "appointmentTime": "10:00",
  "duration": 30,
  "appointmentType": "ROUTINE_EXAMINATION",
  "reason": "Annual eye checkup",
  "priority": "NORMAL",
  "notes": "Patient prefers morning appointments",
  "followUpRequired": false,
  "followUpDate": null,
  "insuranceProvider": "Blue Cross",
  "insuranceNumber": "BC123456789",
  "cost": 50000.00,
  "paymentMethod": "CASH"
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "patientId": 1,
  "patientName": "John Doe",
  "patientPhone": "1234567890",
  "patientEmail": "john.doe@example.com",
  "doctorId": 1,
  "doctorName": "Dr. Smith",
  "doctorSpecialty": "Optometry",
  "appointmentDate": "2025-08-05",
  "appointmentTime": "10:00",
  "endTime": "10:30",
  "duration": 30,
  "appointmentType": "ROUTINE_EXAMINATION",
  "reason": "Annual eye checkup",
  "priority": "NORMAL",
  "notes": "Patient prefers morning appointments",
  "status": "SCHEDULED",
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
  "insuranceProvider": "Blue Cross",
  "insuranceNumber": "BC123456789",
  "cost": 50000.00,
  "paymentStatus": "PENDING",
  "paymentMethod": "CASH",
  "createdAt": "2025-08-02T15:30:00",
  "updatedAt": "2025-08-02T15:30:00",
  "createdBy": "receptionist",
  "updatedBy": "receptionist"
}
```

**Error Responses:**
- `400 Bad Request` - Validation errors or scheduling conflicts
- `404 Not Found` - Patient or doctor not found
- `500 Internal Server Error` - Server error

### 2. Get Appointment by ID
**GET** `/api/appointments/{id}`

Retrieves a specific appointment by its ID.

**Required Roles:** `RECEPTIONIST`, `DOCTOR`, `SUPER_ADMIN`

**Response (200 OK):**
```json
{
  "id": 1,
  "patientId": 1,
  "patientName": "John Doe",
  "patientPhone": "1234567890",
  "patientEmail": "john.doe@example.com",
  "doctorId": 1,
  "doctorName": "Dr. Smith",
  "doctorSpecialty": "Optometry",
  "appointmentDate": "2025-08-05",
  "appointmentTime": "10:00",
  "endTime": "10:30",
  "duration": 30,
  "appointmentType": "ROUTINE_EXAMINATION",
  "reason": "Annual eye checkup",
  "priority": "NORMAL",
  "notes": "Patient prefers morning appointments",
  "status": "SCHEDULED",
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
  "insuranceProvider": "Blue Cross",
  "insuranceNumber": "BC123456789",
  "cost": 50000.00,
  "paymentStatus": "PENDING",
  "paymentMethod": "CASH",
  "createdAt": "2025-08-02T15:30:00",
  "updatedAt": "2025-08-02T15:30:00",
  "createdBy": "receptionist",
  "updatedBy": "receptionist"
}
```

**Error Responses:**
- `404 Not Found` - Appointment not found
- `500 Internal Server Error` - Server error

### 3. Get All Appointments (Paginated)
**GET** `/api/appointments?page=0&size=10&sort=appointmentDate,desc`

Retrieves all appointments with pagination and sorting.

**Required Roles:** `RECEPTIONIST`, `DOCTOR`, `SUPER_ADMIN`

**Query Parameters:**
- `page` - Page number (default: 0)
- `size` - Page size (default: 20)
- `sort` - Sort field and direction (e.g., `appointmentDate,desc`)

**Response (200 OK):**
```json
{
  "content": [
    {
      "id": 1,
      "patientId": 1,
      "patientName": "John Doe",
      "patientPhone": "1234567890",
      "patientEmail": "john.doe@example.com",
      "doctorId": 1,
      "doctorName": "Dr. Smith",
      "doctorSpecialty": "Optometry",
      "appointmentDate": "2025-08-05",
      "appointmentTime": "10:00",
      "endTime": "10:30",
      "duration": 30,
      "appointmentType": "ROUTINE_EXAMINATION",
      "reason": "Annual eye checkup",
      "priority": "NORMAL",
      "notes": "Patient prefers morning appointments",
      "status": "SCHEDULED",
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
      "insuranceProvider": "Blue Cross",
      "insuranceNumber": "BC123456789",
      "cost": 50000.00,
      "paymentStatus": "PENDING",
      "paymentMethod": "CASH",
      "createdAt": "2025-08-02T15:30:00",
      "updatedAt": "2025-08-02T15:30:00",
      "createdBy": "receptionist",
      "updatedBy": "receptionist"
    }
  ],
  "pageable": {
    "sort": {
      "sorted": true,
      "unsorted": false
    },
    "pageNumber": 0,
    "pageSize": 10,
    "offset": 0,
    "paged": true,
    "unpaged": false
  },
  "totalElements": 1,
  "totalPages": 1,
  "last": true,
  "first": true,
  "sort": {
    "sorted": true,
    "unsorted": false
  },
  "numberOfElements": 1,
  "size": 10,
  "number": 0
}
```

### 4. Get Appointments by Doctor
**GET** `/api/appointments/doctor/{doctorId}?page=0&size=10`

Retrieves appointments for a specific doctor.

**Required Roles:** `RECEPTIONIST`, `DOCTOR`, `SUPER_ADMIN`

**Response (200 OK):**
```json
{
  "content": [
    {
      "id": 1,
      "patientId": 1,
      "patientName": "John Doe",
      "patientPhone": "1234567890",
      "patientEmail": "john.doe@example.com",
      "doctorId": 1,
      "doctorName": "Dr. Smith",
      "doctorSpecialty": "Optometry",
      "appointmentDate": "2025-08-05",
      "appointmentTime": "10:00",
      "endTime": "10:30",
      "duration": 30,
      "appointmentType": "ROUTINE_EXAMINATION",
      "reason": "Annual eye checkup",
      "priority": "NORMAL",
      "notes": "Patient prefers morning appointments",
      "status": "SCHEDULED",
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
      "insuranceProvider": "Blue Cross",
      "insuranceNumber": "BC123456789",
      "cost": 50000.00,
      "paymentStatus": "PENDING",
      "paymentMethod": "CASH",
      "createdAt": "2025-08-02T15:30:00",
      "updatedAt": "2025-08-02T15:30:00",
      "createdBy": "receptionist",
      "updatedBy": "receptionist"
    }
  ],
  "pageable": {
    "sort": {
      "sorted": false,
      "unsorted": true
    },
    "pageNumber": 0,
    "pageSize": 10,
    "offset": 0,
    "paged": true,
    "unpaged": false
  },
  "totalElements": 1,
  "totalPages": 1,
  "last": true,
  "first": true,
  "sort": {
    "sorted": false,
    "unsorted": true
  },
  "numberOfElements": 1,
  "size": 10,
  "number": 0
}
```

### 5. Get Appointments by Patient
**GET** `/api/appointments/patient/{patientId}?page=0&size=10`

Retrieves appointments for a specific patient.

**Required Roles:** `RECEPTIONIST`, `DOCTOR`, `SUPER_ADMIN`

**Response (200 OK):**
```json
{
  "content": [
    {
      "id": 1,
      "patientId": 1,
      "patientName": "John Doe",
      "patientPhone": "1234567890",
      "patientEmail": "john.doe@example.com",
      "doctorId": 1,
      "doctorName": "Dr. Smith",
      "doctorSpecialty": "Optometry",
      "appointmentDate": "2025-08-05",
      "appointmentTime": "10:00",
      "endTime": "10:30",
      "duration": 30,
      "appointmentType": "ROUTINE_EXAMINATION",
      "reason": "Annual eye checkup",
      "priority": "NORMAL",
      "notes": "Patient prefers morning appointments",
      "status": "SCHEDULED",
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
      "insuranceProvider": "Blue Cross",
      "insuranceNumber": "BC123456789",
      "cost": 50000.00,
      "paymentStatus": "PENDING",
      "paymentMethod": "CASH",
      "createdAt": "2025-08-02T15:30:00",
      "updatedAt": "2025-08-02T15:30:00",
      "createdBy": "receptionist",
      "updatedBy": "receptionist"
    }
  ],
  "pageable": {
    "sort": {
      "sorted": false,
      "unsorted": true
    },
    "pageNumber": 0,
    "pageSize": 10,
    "offset": 0,
    "paged": true,
    "unpaged": false
  },
  "totalElements": 1,
  "totalPages": 1,
  "last": true,
  "first": true,
  "sort": {
    "sorted": false,
    "unsorted": true
  },
  "numberOfElements": 1,
  "size": 10,
  "number": 0
}
```

### 6. Get Appointments by Status
**GET** `/api/appointments/status/{status}?page=0&size=10`

Retrieves appointments by their status.

**Required Roles:** `RECEPTIONIST`, `DOCTOR`, `SUPER_ADMIN`

**Path Parameters:**
- `status` - Appointment status (e.g., `SCHEDULED`, `CONFIRMED`, `COMPLETED`)

**Response (200 OK):**
```json
{
  "content": [
    {
      "id": 1,
      "patientId": 1,
      "patientName": "John Doe",
      "patientPhone": "1234567890",
      "patientEmail": "john.doe@example.com",
      "doctorId": 1,
      "doctorName": "Dr. Smith",
      "doctorSpecialty": "Optometry",
      "appointmentDate": "2025-08-05",
      "appointmentTime": "10:00",
      "endTime": "10:30",
      "duration": 30,
      "appointmentType": "ROUTINE_EXAMINATION",
      "reason": "Annual eye checkup",
      "priority": "NORMAL",
      "notes": "Patient prefers morning appointments",
      "status": "SCHEDULED",
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
      "insuranceProvider": "Blue Cross",
      "insuranceNumber": "BC123456789",
      "cost": 50000.00,
      "paymentStatus": "PENDING",
      "paymentMethod": "CASH",
      "createdAt": "2025-08-02T15:30:00",
      "updatedAt": "2025-08-02T15:30:00",
      "createdBy": "receptionist",
      "updatedBy": "receptionist"
    }
  ],
  "pageable": {
    "sort": {
      "sorted": false,
      "unsorted": true
    },
    "pageNumber": 0,
    "pageSize": 10,
    "offset": 0,
    "paged": true,
    "unpaged": false
  },
  "totalElements": 1,
  "totalPages": 1,
  "last": true,
  "first": true,
  "sort": {
    "sorted": false,
    "unsorted": true
  },
  "numberOfElements": 1,
  "size": 10,
  "number": 0
}
```

### 7. Get Appointments by Date Range
**GET** `/api/appointments/date-range?startDate=2025-08-01&endDate=2025-08-31&page=0&size=10`

Retrieves appointments within a specific date range.

**Required Roles:** `RECEPTIONIST`, `DOCTOR`, `SUPER_ADMIN`

**Query Parameters:**
- `startDate` - Start date (YYYY-MM-DD format)
- `endDate` - End date (YYYY-MM-DD format)

**Response (200 OK):**
```json
{
  "content": [
    {
      "id": 1,
      "patientId": 1,
      "patientName": "John Doe",
      "patientPhone": "1234567890",
      "patientEmail": "john.doe@example.com",
      "doctorId": 1,
      "doctorName": "Dr. Smith",
      "doctorSpecialty": "Optometry",
      "appointmentDate": "2025-08-05",
      "appointmentTime": "10:00",
      "endTime": "10:30",
      "duration": 30,
      "appointmentType": "ROUTINE_EXAMINATION",
      "reason": "Annual eye checkup",
      "priority": "NORMAL",
      "notes": "Patient prefers morning appointments",
      "status": "SCHEDULED",
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
      "insuranceProvider": "Blue Cross",
      "insuranceNumber": "BC123456789",
      "cost": 50000.00,
      "paymentStatus": "PENDING",
      "paymentMethod": "CASH",
      "createdAt": "2025-08-02T15:30:00",
      "updatedAt": "2025-08-02T15:30:00",
      "createdBy": "receptionist",
      "updatedBy": "receptionist"
    }
  ],
  "pageable": {
    "sort": {
      "sorted": false,
      "unsorted": true
    },
    "pageNumber": 0,
    "pageSize": 10,
    "offset": 0,
    "paged": true,
    "unpaged": false
  },
  "totalElements": 1,
  "totalPages": 1,
  "last": true,
  "first": true,
  "sort": {
    "sorted": false,
    "unsorted": true
  },
  "numberOfElements": 1,
  "size": 10,
  "number": 0
}
```

### 8. Get Today's Appointments
**GET** `/api/appointments/today`

Retrieves all appointments scheduled for today.

**Required Roles:** `RECEPTIONIST`, `DOCTOR`, `SUPER_ADMIN`

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "patientId": 1,
    "patientName": "John Doe",
    "patientPhone": "1234567890",
    "patientEmail": "john.doe@example.com",
    "doctorId": 1,
    "doctorName": "Dr. Smith",
    "doctorSpecialty": "Optometry",
    "appointmentDate": "2025-08-02",
    "appointmentTime": "10:00",
    "endTime": "10:30",
    "duration": 30,
    "appointmentType": "ROUTINE_EXAMINATION",
    "reason": "Annual eye checkup",
    "priority": "NORMAL",
    "notes": "Patient prefers morning appointments",
    "status": "SCHEDULED",
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
    "insuranceProvider": "Blue Cross",
    "insuranceNumber": "BC123456789",
    "cost": 50000.00,
    "paymentStatus": "PENDING",
    "paymentMethod": "CASH",
    "createdAt": "2025-08-02T15:30:00",
    "updatedAt": "2025-08-02T15:30:00",
    "createdBy": "receptionist",
    "updatedBy": "receptionist"
  }
]
```

### 9. Update Appointment Status
**PUT** `/api/appointments/{id}/status?status=CONFIRMED`

Updates the status of an appointment.

**Required Roles:** `RECEPTIONIST`, `DOCTOR`, `SUPER_ADMIN`

**Path Parameters:**
- `id` - Appointment ID

**Query Parameters:**
- `status` - New appointment status

**Response (200 OK):**
```json
{
  "id": 1,
  "patientId": 1,
  "patientName": "John Doe",
  "patientPhone": "1234567890",
  "patientEmail": "john.doe@example.com",
  "doctorId": 1,
  "doctorName": "Dr. Smith",
  "doctorSpecialty": "Optometry",
  "appointmentDate": "2025-08-05",
  "appointmentTime": "10:00",
  "endTime": "10:30",
  "duration": 30,
  "appointmentType": "ROUTINE_EXAMINATION",
  "reason": "Annual eye checkup",
  "priority": "NORMAL",
  "notes": "Patient prefers morning appointments",
  "status": "CONFIRMED",
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
  "insuranceProvider": "Blue Cross",
  "insuranceNumber": "BC123456789",
  "cost": 50000.00,
  "paymentStatus": "PENDING",
  "paymentMethod": "CASH",
  "createdAt": "2025-08-02T15:30:00",
  "updatedAt": "2025-08-02T15:35:00",
  "createdBy": "receptionist",
  "updatedBy": "doctor"
}
```

### 10. Cancel Appointment
**PUT** `/api/appointments/{id}/cancel?cancellationReason=Patient requested cancellation`

Cancels an appointment with a reason.

**Required Roles:** `RECEPTIONIST`, `DOCTOR`, `SUPER_ADMIN`

**Path Parameters:**
- `id` - Appointment ID

**Query Parameters:**
- `cancellationReason` - Reason for cancellation

**Response (200 OK):**
```json
{
  "id": 1,
  "patientId": 1,
  "patientName": "John Doe",
  "patientPhone": "1234567890",
  "patientEmail": "john.doe@example.com",
  "doctorId": 1,
  "doctorName": "Dr. Smith",
  "doctorSpecialty": "Optometry",
  "appointmentDate": "2025-08-05",
  "appointmentTime": "10:00",
  "endTime": "10:30",
  "duration": 30,
  "appointmentType": "ROUTINE_EXAMINATION",
  "reason": "Annual eye checkup",
  "priority": "NORMAL",
  "notes": "Patient prefers morning appointments",
  "status": "CANCELLED",
  "cancelledAt": "2025-08-02T15:40:00",
  "cancelledBy": "receptionist",
  "cancellationReason": "Patient requested cancellation",
  "reminderSent": false,
  "reminderSentAt": null,
  "checkInTime": null,
  "checkOutTime": null,
  "actualDuration": null,
  "followUpRequired": false,
  "followUpDate": null,
  "insuranceProvider": "Blue Cross",
  "insuranceNumber": "BC123456789",
  "cost": 50000.00,
  "paymentStatus": "PENDING",
  "paymentMethod": "CASH",
  "createdAt": "2025-08-02T15:30:00",
  "updatedAt": "2025-08-02T15:40:00",
  "createdBy": "receptionist",
  "updatedBy": "receptionist"
}
```

### 11. Reschedule Appointment
**PUT** `/api/appointments/{id}/reschedule?newDate=2025-08-06&newTime=14:00`

Reschedules an appointment to a new date and time.

**Required Roles:** `RECEPTIONIST`, `DOCTOR`, `SUPER_ADMIN`

**Path Parameters:**
- `id` - Appointment ID

**Query Parameters:**
- `newDate` - New appointment date (YYYY-MM-DD format)
- `newTime` - New appointment time (HH:mm format)

**Response (200 OK):**
```json
{
  "id": 1,
  "patientId": 1,
  "patientName": "John Doe",
  "patientPhone": "1234567890",
  "patientEmail": "john.doe@example.com",
  "doctorId": 1,
  "doctorName": "Dr. Smith",
  "doctorSpecialty": "Optometry",
  "appointmentDate": "2025-08-06",
  "appointmentTime": "14:00",
  "endTime": "14:30",
  "duration": 30,
  "appointmentType": "ROUTINE_EXAMINATION",
  "reason": "Annual eye checkup",
  "priority": "NORMAL",
  "notes": "Patient prefers morning appointments",
  "status": "RESCHEDULED",
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
  "insuranceProvider": "Blue Cross",
  "insuranceNumber": "BC123456789",
  "cost": 50000.00,
  "paymentStatus": "PENDING",
  "paymentMethod": "CASH",
  "createdAt": "2025-08-02T15:30:00",
  "updatedAt": "2025-08-02T15:45:00",
  "createdBy": "receptionist",
  "updatedBy": "receptionist"
}
```

### 12. Check Doctor Availability
**GET** `/api/appointments/doctor/{doctorId}/availability?date=2025-08-05&startTime=10:00&endTime=10:30`

Checks if a doctor is available at a specific time.

**Required Roles:** `RECEPTIONIST`, `DOCTOR`, `SUPER_ADMIN`

**Path Parameters:**
- `doctorId` - Doctor ID

**Query Parameters:**
- `date` - Appointment date (YYYY-MM-DD format)
- `startTime` - Start time (HH:mm:ss format)
- `endTime` - End time (HH:mm:ss format)

**Response (200 OK):**
```json
true
```

**Error Response (200 OK):**
```json
false
```

### 13. Check Appointment Conflicts
**GET** `/api/appointments/conflicts/check?doctorId=1&date=2025-08-05&startTime=10:00&endTime=10:30`

Checks for scheduling conflicts for a specific doctor and time slot.

**Required Roles:** `RECEPTIONIST`, `DOCTOR`, `SUPER_ADMIN`

**Query Parameters:**
- `doctorId` - Doctor ID
- `date` - Appointment date (YYYY-MM-DD format)
- `startTime` - Start time (HH:mm:ss format)
- `endTime` - End time (HH:mm:ss format)

**Response (200 OK):**
```json
false
```

**Response with conflicts (200 OK):**
```json
true
```

### 14. Get Appointments Needing Reminders
**GET** `/api/appointments/reminders/needed`

Retrieves appointments that need reminder notifications.

**Required Roles:** `RECEPTIONIST`, `SUPER_ADMIN`

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "patientId": 1,
    "patientName": "John Doe",
    "patientPhone": "1234567890",
    "patientEmail": "john.doe@example.com",
    "doctorId": 1,
    "doctorName": "Dr. Smith",
    "doctorSpecialty": "Optometry",
    "appointmentDate": "2025-08-03",
    "appointmentTime": "10:00",
    "endTime": "10:30",
    "duration": 30,
    "appointmentType": "ROUTINE_EXAMINATION",
    "reason": "Annual eye checkup",
    "priority": "NORMAL",
    "notes": "Patient prefers morning appointments",
    "status": "SCHEDULED",
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
    "insuranceProvider": "Blue Cross",
    "insuranceNumber": "BC123456789",
    "cost": 50000.00,
    "paymentStatus": "PENDING",
    "paymentMethod": "CASH",
    "createdAt": "2025-08-02T15:30:00",
    "updatedAt": "2025-08-02T15:30:00",
    "createdBy": "receptionist",
    "updatedBy": "receptionist"
  }
]
```

### 15. Send Reminders
**POST** `/api/appointments/reminders/send`

Sends reminder notifications for appointments scheduled for tomorrow.

**Required Roles:** `RECEPTIONIST`, `SUPER_ADMIN`

**Response (200 OK):**
```json
"Reminders sent successfully"
```

## Error Handling

### Common Error Responses

**400 Bad Request - Validation Error:**
```json
{
  "status": 400,
  "error": "Runtime Exception",
  "message": "Patient ID is required",
  "path": "/api/appointments",
  "timestamp": "2025-08-02T15:30:00"
}
```

**400 Bad Request - Scheduling Conflict:**
```json
{
  "status": 400,
  "error": "Runtime Exception",
  "message": "Appointment time conflicts with existing appointments",
  "path": "/api/appointments",
  "timestamp": "2025-08-02T15:30:00"
}
```

**400 Bad Request - Doctor Unavailable:**
```json
{
  "status": 400,
  "error": "Runtime Exception",
  "message": "Doctor has no schedule for Monday (2025-08-05)",
  "path": "/api/appointments",
  "timestamp": "2025-08-02T15:30:00"
}
```

**404 Not Found:**
```json
{
  "status": 404,
  "error": "Runtime Exception",
  "message": "Appointment not found",
  "path": "/api/appointments/999",
  "timestamp": "2025-08-02T15:30:00"
}
```

**500 Internal Server Error:**
```json
{
  "status": 500,
  "error": "Internal Server Error",
  "message": "An unexpected error occurred. Please try again later.",
  "path": "/api/appointments",
  "timestamp": "2025-08-02T15:30:00"
}
```

## Usage Examples

### Creating an Emergency Appointment
```bash
curl -X POST http://localhost:5025/api/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "patientId": 1,
    "patientName": "Jane Smith",
    "patientPhone": "9876543210",
    "patientEmail": "jane.smith@example.com",
    "doctorId": 1,
    "doctorName": "Dr. Johnson",
    "doctorSpecialty": "Ophthalmology",
    "appointmentDate": "2025-08-02",
    "appointmentTime": "15:00",
    "duration": 60,
    "appointmentType": "EMERGENCY",
    "reason": "Severe eye pain and vision loss",
    "priority": "EMERGENCY",
    "notes": "Patient reports sudden vision problems",
    "followUpRequired": true,
    "insuranceProvider": "Medicare",
    "insuranceNumber": "MC123456789",
    "cost": 150000.00,
    "paymentMethod": "INSURANCE"
  }'
```

### Checking Doctor Availability
```bash
curl -X GET "http://localhost:5025/api/appointments/doctor/1/availability?date=2025-08-05&startTime=10:00&endTime=10:30" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Updating Appointment Status
```bash
curl -X PUT "http://localhost:5025/api/appointments/1/status?status=CHECKED_IN" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Cancelling an Appointment
```bash
curl -X PUT "http://localhost:5025/api/appointments/1/cancel?cancellationReason=Patient called to reschedule" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Notes

1. **Time Format**: All times should be in 24-hour format (HH:mm or HH:mm:ss)
2. **Date Format**: All dates should be in ISO format (YYYY-MM-DD)
3. **Duration**: Duration is specified in minutes
4. **Cost**: Cost is specified in Uganda Shillings (UGX)
5. **Pagination**: All list endpoints support pagination with `page`, `size`, and `sort` parameters
6. **Validation**: All required fields are validated before processing
7. **Conflict Checking**: The system automatically checks for scheduling conflicts and doctor availability
8. **Email Notifications**: Confirmation emails are sent automatically when appointments are created
9. **Audit Trail**: All changes are tracked with timestamps and user information 