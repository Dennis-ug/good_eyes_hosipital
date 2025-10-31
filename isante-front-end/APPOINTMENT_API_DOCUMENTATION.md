# Appointment API Documentation

**Base URL:** `http://localhost:5025/api`  
**Auth:** `Authorization: Bearer <jwt-token>`

---

## Appointment Endpoints

### Create Appointment
**POST** `/appointments`  
**Auth:** RECEPTIONIST, DOCTOR, SUPER_ADMIN

**Request:**
```typescript
{
  "patientId": 1,
  "patientName": "John Doe",
  "patientPhone": "+1234567890",
  "patientEmail": "john@example.com",
  "doctorId": 2,
  "doctorName": "Dr. Smith",
  "doctorSpecialty": "Ophthalmology",
  "appointmentDate": "2024-01-15",
  "appointmentTime": "09:00",
  "duration": 30,
  "appointmentType": "ROUTINE_EXAMINATION",
  "reason": "Annual checkup",
  "priority": "NORMAL",
  "notes": "Patient prefers morning appointments",
  "followUpRequired": false,
  "followUpDate": "2024-02-15",
  "insuranceProvider": "Blue Cross",
  "insuranceNumber": "BC123456",
  "cost": 150.00,
  "paymentMethod": "CARD"
}
```

**Response:**
```typescript
{
  "id": 1,
  "patientId": 1,
  "patientName": "John Doe",
  "patientPhone": "+1234567890",
  "patientEmail": "john@example.com",
  "doctorId": 2,
  "doctorName": "Dr. Smith",
  "doctorSpecialty": "Ophthalmology",
  "appointmentDate": "2024-01-15",
  "appointmentTime": "09:00",
  "endTime": "09:30",
  "duration": 30,
  "appointmentType": "ROUTINE_EXAMINATION",
  "reason": "Annual checkup",
  "priority": "NORMAL",
  "notes": "Patient prefers morning appointments",
  "status": "SCHEDULED",
  "reminderSent": false,
  "followUpRequired": false,
  "followUpDate": "2024-02-15",
  "insuranceProvider": "Blue Cross",
  "insuranceNumber": "BC123456",
  "cost": 150.00,
  "paymentStatus": "PENDING",
  "paymentMethod": "CARD",
  "createdAt": "2024-01-10T10:30:00",
  "updatedAt": "2024-01-10T10:30:00",
  "createdBy": "receptionist1",
  "updatedBy": "receptionist1"
}
```

**Validations:**
- `patientId`: Required, positive integer
- `patientName`: Required, non-empty string
- `doctorId`: Required, positive integer
- `appointmentDate`: Required, format "YYYY-MM-DD", future date
- `appointmentTime`: Required, format "HH:mm", 24-hour format
- `duration`: Optional, 1-480 minutes
- `appointmentType`: Required, valid enum value
- `priority`: Optional, defaults to "NORMAL"
- `patientEmail`: Optional, valid email format
- `cost`: Optional, positive number

### Get Appointments
**GET** `/appointments?page=0&size=10&sort=appointmentDate,desc`  
**GET** `/appointments/doctor/{doctorId}?page=0&size=10`  
**GET** `/appointments/patient/{patientId}?page=0&size=10`  
**GET** `/appointments/status/{status}?page=0&size=10`  
**GET** `/appointments/date-range?startDate=2024-01-01&endDate=2024-01-31&page=0&size=10`  
**GET** `/appointments/today`  
**GET** `/appointments/{id}`

**Auth:** RECEPTIONIST, DOCTOR, SUPER_ADMIN

**Response:**
```typescript
{
  "content": [
    {
      "id": 1,
      "patientId": 1,
      "patientName": "John Doe",
      "doctorId": 2,
      "doctorName": "Dr. Smith",
      "appointmentDate": "2024-01-15",
      "appointmentTime": "09:00",
      "endTime": "09:30",
      "duration": 30,
      "appointmentType": "ROUTINE_EXAMINATION",
      "status": "SCHEDULED",
      "priority": "NORMAL",
      "cost": 150.00,
      "paymentStatus": "PENDING"
    }
  ],
  "totalElements": 1,
  "totalPages": 1,
  "size": 10,
  "number": 0
}
```

### Update Appointment Status
**PUT** `/appointments/{id}/status?status=CHECKED_IN`  
**Auth:** RECEPTIONIST, DOCTOR, SUPER_ADMIN

**Valid Status Values:** SCHEDULED, CONFIRMED, CHECKED_IN, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW, RESCHEDULED, WAITING, READY

**Response:**
```typescript
{
  "id": 1,
  "status": "CHECKED_IN",
  "checkInTime": "2024-01-15T09:00:00",
  "updatedAt": "2024-01-15T09:00:00",
  "updatedBy": "doctor1"
}
```

### Cancel Appointment
**PUT** `/appointments/{id}/cancel?cancellationReason=Patient requested cancellation`  
**Auth:** RECEPTIONIST, DOCTOR, SUPER_ADMIN

**Response:**
```typescript
{
  "id": 1,
  "status": "CANCELLED",
  "cancelledAt": "2024-01-15T08:30:00",
  "cancelledBy": "receptionist1",
  "cancellationReason": "Patient requested cancellation"
}
```

### Reschedule Appointment
**PUT** `/appointments/{id}/reschedule?newDate=2024-01-20&newTime=10:00`  
**Auth:** RECEPTIONIST, DOCTOR, SUPER_ADMIN

**Validations:**
- `newDate`: Required, format "YYYY-MM-DD", future date
- `newTime`: Required, format "HH:mm", 24-hour format

**Response:**
```typescript
{
  "id": 1,
  "appointmentDate": "2024-01-20",
  "appointmentTime": "10:00",
  "endTime": "10:30",
  "status": "RESCHEDULED",
  "updatedAt": "2024-01-15T08:30:00",
  "updatedBy": "receptionist1"
}
```

### Check Doctor Availability
**GET** `/appointments/doctor/{doctorId}/availability?date=2024-01-15&startTime=09:00&endTime=09:30`  
**Auth:** RECEPTIONIST, DOCTOR, SUPER_ADMIN

**Response:**
```typescript
{
  "available": true,
  "conflictingAppointments": []
}
```

### Check for Conflicts
**GET** `/appointments/conflicts/check?doctorId=2&date=2024-01-15&startTime=09:00&endTime=09:30`  
**Auth:** RECEPTIONIST, DOCTOR, SUPER_ADMIN

**Response:**
```typescript
{
  "hasConflict": false,
  "conflictingAppointments": []
}
```

---

## Enums

```typescript
enum AppointmentType {
  ROUTINE_EXAMINATION, FOLLOW_UP, EMERGENCY, SURGERY_CONSULTATION,
  PRESCRIPTION_RENEWAL, DIAGNOSTIC_TEST, PRE_OPERATIVE_ASSESSMENT,
  POST_OPERATIVE_FOLLOW_UP, VISION_THERAPY, CONTACT_LENS_FITTING,
  GLASSES_FITTING, GLAUCOMA_SCREENING, CATARACT_EVALUATION,
  RETINAL_EXAMINATION, PEDIATRIC_EXAMINATION
}

enum AppointmentStatus {
  SCHEDULED, CONFIRMED, CHECKED_IN, IN_PROGRESS, COMPLETED,
  CANCELLED, NO_SHOW, RESCHEDULED, WAITING, READY
}

enum AppointmentPriority { LOW, NORMAL, HIGH, URGENT, EMERGENCY }
enum PaymentStatus { PENDING, PAID, PARTIAL, REFUNDED }
enum PaymentMethod { CASH, MOBILE_MONEY, BANK_TRANSFER, CARD, INSURANCE }
```

---

## Error Responses

```typescript
{
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/appointments",
  "timestamp": "2024-01-10T10:30:00"
}
```

**Common Error Messages:**
- "Patient not found"
- "Doctor not found"
- "Appointment time conflict detected"
- "Doctor not available at specified time"
- "Invalid appointment status transition"
- "Appointment not found"
- "Cannot cancel completed appointment" 