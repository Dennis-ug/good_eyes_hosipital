# Doctor Schedule API Documentation

## Overview
The Doctor Schedule API manages doctor working schedules, availability, and time slots for the Eye Clinic Management System. This API allows creating, updating, and querying doctor schedules with proper validation and access control.

## Base URL
```
http://localhost:5025/api/doctor-schedules
```

## Authentication
All endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Data Models

### DoctorSchedule Entity
```json
{
  "id": 1,
  "doctor": {
    "id": 12,
    "username": "dr.kaisli",
    "firstName": "Dr",
    "lastName": "Kaisli"
  },
  "doctorName": "Dr Kaisli",
  "dayOfWeek": 1,
  "startTime": "09:00:00",
  "endTime": "17:00:00",
  "breakStart": "12:00:00",
  "breakEnd": "13:00:00",
  "isAvailable": true,
  "createdAt": "2025-08-02T10:00:00",
  "updatedAt": "2025-08-02T10:00:00",
  "createdBy": "superadmin",
  "updatedBy": "superadmin"
}
```

### Day of Week Mapping
- `1` = Monday
- `2` = Tuesday
- `3` = Wednesday
- `4` = Thursday
- `5` = Friday
- `6` = Saturday
- `7` = Sunday

## Endpoints

### 1. Create Doctor Schedule
**POST** `/api/doctor-schedules`

Creates a new doctor schedule for a specific day.

**Authorization:** `SUPER_ADMIN`, `DOCTOR`

**Request Body:**
```json
{
  "doctor": {
    "id": 12
  },
  "dayOfWeek": 1,
  "startTime": "09:00:00",
  "endTime": "17:00:00",
  "breakStart": "12:00:00",
  "breakEnd": "13:00:00",
  "isAvailable": true
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "doctor": {
    "id": 12,
    "username": "dr.kaisli",
    "firstName": "Dr",
    "lastName": "Kaisli"
  },
  "doctorName": "Dr Kaisli",
  "dayOfWeek": 1,
  "startTime": "09:00:00",
  "endTime": "17:00:00",
  "breakStart": "12:00:00",
  "breakEnd": "13:00:00",
  "isAvailable": true,
  "createdAt": "2025-08-02T10:00:00",
  "updatedAt": "2025-08-02T10:00:00",
  "createdBy": "superadmin",
  "updatedBy": "superadmin"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid schedule data
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Doctor not found
- `409 Conflict`: Schedule already exists for this doctor on this day

### 2. Update Doctor Schedule
**PUT** `/api/doctor-schedules/{id}`

Updates an existing doctor schedule.

**Authorization:** `SUPER_ADMIN`, `DOCTOR`

**Path Parameters:**
- `id` (Long): Schedule ID

**Request Body:**
```json
{
  "startTime": "08:00:00",
  "endTime": "16:00:00",
  "breakStart": "12:00:00",
  "breakEnd": "13:00:00",
  "isAvailable": true
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "doctor": {
    "id": 12,
    "username": "dr.kaisli",
    "firstName": "Dr",
    "lastName": "Kaisli"
  },
  "doctorName": "Dr Kaisli",
  "dayOfWeek": 1,
  "startTime": "08:00:00",
  "endTime": "16:00:00",
  "breakStart": "12:00:00",
  "breakEnd": "13:00:00",
  "isAvailable": true,
  "createdAt": "2025-08-02T10:00:00",
  "updatedAt": "2025-08-02T10:30:00",
  "createdBy": "superadmin",
  "updatedBy": "dr.kaisli"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid schedule data
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Schedule not found

### 3. Delete Doctor Schedule
**DELETE** `/api/doctor-schedules/{id}`

Deletes a doctor schedule.

**Authorization:** `SUPER_ADMIN`, `DOCTOR`

**Path Parameters:**
- `id` (Long): Schedule ID

**Response (200 OK):**
```json
"Schedule deleted successfully"
```

**Error Responses:**
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Schedule not found

### 4. Get Schedule by ID
**GET** `/api/doctor-schedules/{id}`

Retrieves a specific doctor schedule by ID.

**Authorization:** `RECEPTIONIST`, `DOCTOR`, `SUPER_ADMIN`

**Path Parameters:**
- `id` (Long): Schedule ID

**Response (200 OK):**
```json
{
  "id": 1,
  "doctor": {
    "id": 12,
    "username": "dr.kaisli",
    "firstName": "Dr",
    "lastName": "Kaisli"
  },
  "doctorName": "Dr Kaisli",
  "dayOfWeek": 1,
  "startTime": "09:00:00",
  "endTime": "17:00:00",
  "breakStart": "12:00:00",
  "breakEnd": "13:00:00",
  "isAvailable": true,
  "createdAt": "2025-08-02T10:00:00",
  "updatedAt": "2025-08-02T10:00:00",
  "createdBy": "superadmin",
  "updatedBy": "superadmin"
}
```

**Error Responses:**
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Schedule not found

### 5. Get All Schedules for a Doctor
**GET** `/api/doctor-schedules/doctor/{doctorId}`

Retrieves all schedules for a specific doctor.

**Authorization:** `RECEPTIONIST`, `DOCTOR`, `SUPER_ADMIN`

**Path Parameters:**
- `doctorId` (Long): Doctor's user ID

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "doctor": {
      "id": 12,
      "username": "dr.kaisli",
      "firstName": "Dr",
      "lastName": "Kaisli"
    },
    "doctorName": "Dr Kaisli",
    "dayOfWeek": 1,
    "startTime": "09:00:00",
    "endTime": "17:00:00",
    "breakStart": "12:00:00",
    "breakEnd": "13:00:00",
    "isAvailable": true
  },
  {
    "id": 2,
    "doctor": {
      "id": 12,
      "username": "dr.kaisli",
      "firstName": "Dr",
      "lastName": "Kaisli"
    },
    "doctorName": "Dr Kaisli",
    "dayOfWeek": 2,
    "startTime": "09:00:00",
    "endTime": "17:00:00",
    "breakStart": "12:00:00",
    "breakEnd": "13:00:00",
    "isAvailable": true
  }
]
```

**Error Responses:**
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Doctor not found

### 6. Get Available Schedules for a Doctor
**GET** `/api/doctor-schedules/doctor/{doctorId}/available`

Retrieves only available schedules for a specific doctor.

**Authorization:** `RECEPTIONIST`, `DOCTOR`, `SUPER_ADMIN`

**Path Parameters:**
- `doctorId` (Long): Doctor's user ID

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "doctor": {
      "id": 12,
      "username": "dr.kaisli",
      "firstName": "Dr",
      "lastName": "Kaisli"
    },
    "doctorName": "Dr Kaisli",
    "dayOfWeek": 1,
    "startTime": "09:00:00",
    "endTime": "17:00:00",
    "breakStart": "12:00:00",
    "breakEnd": "13:00:00",
    "isAvailable": true
  }
]
```

### 7. Get All Available Schedules
**GET** `/api/doctor-schedules/available`

Retrieves all available schedules across all doctors.

**Authorization:** `RECEPTIONIST`, `DOCTOR`, `SUPER_ADMIN`

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "doctor": {
      "id": 12,
      "username": "dr.kaisli",
      "firstName": "Dr",
      "lastName": "Kaisli"
    },
    "doctorName": "Dr Kaisli",
    "dayOfWeek": 1,
    "startTime": "09:00:00",
    "endTime": "17:00:00",
    "breakStart": "12:00:00",
    "breakEnd": "13:00:00",
    "isAvailable": true
  },
  {
    "id": 3,
    "doctor": {
      "id": 15,
      "username": "dr.smith",
      "firstName": "Dr",
      "lastName": "Smith"
    },
    "doctorName": "Dr Smith",
    "dayOfWeek": 2,
    "startTime": "08:00:00",
    "endTime": "16:00:00",
    "breakStart": "12:00:00",
    "breakEnd": "13:00:00",
    "isAvailable": true
  }
]
```

### 8. Get Schedules by Day of Week
**GET** `/api/doctor-schedules/day/{dayOfWeek}`

Retrieves all available schedules for a specific day of the week.

**Authorization:** `RECEPTIONIST`, `DOCTOR`, `SUPER_ADMIN`

**Path Parameters:**
- `dayOfWeek` (Integer): Day of week (1-7)

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "doctor": {
      "id": 12,
      "username": "dr.kaisli",
      "firstName": "Dr",
      "lastName": "Kaisli"
    },
    "doctorName": "Dr Kaisli",
    "dayOfWeek": 1,
    "startTime": "09:00:00",
    "endTime": "17:00:00",
    "breakStart": "12:00:00",
    "breakEnd": "13:00:00",
    "isAvailable": true
  }
]
```

### 9. Search Schedules by Doctor Name
**GET** `/api/doctor-schedules/search?doctorName={name}`

Searches for available schedules by doctor name (case-insensitive).

**Authorization:** `RECEPTIONIST`, `DOCTOR`, `SUPER_ADMIN`

**Query Parameters:**
- `doctorName` (String): Doctor name to search for

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "doctor": {
      "id": 12,
      "username": "dr.kaisli",
      "firstName": "Dr",
      "lastName": "Kaisli"
    },
    "doctorName": "Dr Kaisli",
    "dayOfWeek": 1,
    "startTime": "09:00:00",
    "endTime": "17:00:00",
    "breakStart": "12:00:00",
    "breakEnd": "13:00:00",
    "isAvailable": true
  }
]
```

### 10. Check Doctor Availability on Specific Day
**GET** `/api/doctor-schedules/doctor/{doctorId}/day/{dayOfWeek}/available`

Checks if a doctor is available on a specific day.

**Authorization:** `RECEPTIONIST`, `DOCTOR`, `SUPER_ADMIN`

**Path Parameters:**
- `doctorId` (Long): Doctor's user ID
- `dayOfWeek` (Integer): Day of week (1-7)

**Response (200 OK):**
```json
true
```

**Response (200 OK) - Not Available:**
```json
false
```

### 11. Get Schedules by Doctor and Day Range
**GET** `/api/doctor-schedules/doctor/{doctorId}/day-range?startDay={start}&endDay={end}`

Retrieves schedules for a doctor within a specific day range.

**Authorization:** `RECEPTIONIST`, `DOCTOR`, `SUPER_ADMIN`

**Path Parameters:**
- `doctorId` (Long): Doctor's user ID

**Query Parameters:**
- `startDay` (Integer): Start day of week (1-7)
- `endDay` (Integer): End day of week (1-7)

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "doctor": {
      "id": 12,
      "username": "dr.kaisli",
      "firstName": "Dr",
      "lastName": "Kaisli"
    },
    "doctorName": "Dr Kaisli",
    "dayOfWeek": 1,
    "startTime": "09:00:00",
    "endTime": "17:00:00",
    "breakStart": "12:00:00",
    "breakEnd": "13:00:00",
    "isAvailable": true
  },
  {
    "id": 2,
    "doctor": {
      "id": 12,
      "username": "dr.kaisli",
      "firstName": "Dr",
      "lastName": "Kaisli"
    },
    "doctorName": "Dr Kaisli",
    "dayOfWeek": 2,
    "startTime": "09:00:00",
    "endTime": "17:00:00",
    "breakStart": "12:00:00",
    "breakEnd": "13:00:00",
    "isAvailable": true
  }
]
```

### 12. Toggle Schedule Availability
**PUT** `/api/doctor-schedules/{id}/toggle-availability`

Toggles the availability status of a schedule.

**Authorization:** `SUPER_ADMIN`, `DOCTOR`

**Path Parameters:**
- `id` (Long): Schedule ID

**Response (200 OK):**
```json
"Schedule availability toggled successfully"
```

**Error Responses:**
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Schedule not found

### 13. Get Day Name by Day of Week
**GET** `/api/doctor-schedules/day-name/{dayOfWeek}`

Converts a day of week number to its name.

**Authorization:** `RECEPTIONIST`, `DOCTOR`, `SUPER_ADMIN`

**Path Parameters:**
- `dayOfWeek` (Integer): Day of week (1-7)

**Response (200 OK):**
```json
"Monday"
```

**Response (200 OK) - Invalid Day:**
```json
"Unknown"
```

## Data Validations

### Schedule Time Validations
- **Start Time**: Must be before end time
- **End Time**: Must be after start time
- **Break Time**: If provided, must be within start and end times
- **Break Start**: Must be before break end
- **Day of Week**: Must be between 1 and 7
- **Doctor**: Must exist in the system
- **Duplicate Schedule**: Only one schedule per doctor per day

### Business Rules
- Doctors can only have one schedule per day
- Break times are optional
- Schedule availability can be toggled on/off
- All times are in 24-hour format (HH:mm:ss)
- Day of week follows ISO-8601 standard (1=Monday, 7=Sunday)

## Error Handling

### Common Error Responses

**400 Bad Request:**
```json
{
  "status": 400,
  "error": "Runtime Exception",
  "message": "Schedule already exists for this doctor on this day",
  "path": "uri=/api/doctor-schedules",
  "timestamp": "2025-08-02T10:00:00"
}
```

**403 Forbidden:**
```json
{
  "status": 403,
  "error": "Access Denied",
  "message": "You don't have permission to access this resource.",
  "path": "uri=/api/doctor-schedules",
  "timestamp": "2025-08-02T10:00:00"
}
```

**404 Not Found:**
```json
{
  "status": 404,
  "error": "Resource Not Found",
  "message": "Schedule not found",
  "path": "uri=/api/doctor-schedules/999",
  "timestamp": "2025-08-02T10:00:00"
}
```

## Usage Examples

### Creating a Weekly Schedule for a Doctor
```bash
# Monday
curl -X POST http://localhost:5025/api/doctor-schedules \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "doctor": {"id": 12},
    "dayOfWeek": 1,
    "startTime": "09:00:00",
    "endTime": "17:00:00",
    "breakStart": "12:00:00",
    "breakEnd": "13:00:00",
    "isAvailable": true
  }'

# Tuesday
curl -X POST http://localhost:5025/api/doctor-schedules \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "doctor": {"id": 12},
    "dayOfWeek": 2,
    "startTime": "09:00:00",
    "endTime": "17:00:00",
    "breakStart": "12:00:00",
    "breakEnd": "13:00:00",
    "isAvailable": true
  }'
```

### Checking Doctor Availability
```bash
# Check if doctor is available on Monday
curl -X GET http://localhost:5025/api/doctor-schedules/doctor/12/day/1/available \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Finding Available Doctors for a Day
```bash
# Get all available doctors on Monday
curl -X GET http://localhost:5025/api/doctor-schedules/day/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Updating Schedule Times
```bash
curl -X PUT http://localhost:5025/api/doctor-schedules/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "startTime": "08:00:00",
    "endTime": "16:00:00",
    "breakStart": "12:00:00",
    "breakEnd": "13:00:00",
    "isAvailable": true
  }'
```

## Integration Notes

### Appointment System Integration
- Doctor schedules are used by the appointment system to validate booking times
- Only available schedules are considered for appointment booking
- Break times are excluded from available appointment slots

### User Management Integration
- Schedules are linked to users with DOCTOR role
- Doctor names are automatically populated from user data
- Schedule deletion is prevented if doctor has appointments

### Access Control
- **SUPER_ADMIN**: Full access to all endpoints
- **DOCTOR**: Can manage their own schedules
- **RECEPTIONIST**: Can view schedules for appointment booking
- **Other Roles**: No access to schedule management

## Best Practices

1. **Schedule Creation**: Create schedules for the entire week at once
2. **Time Validation**: Always validate appointment times against doctor schedules
3. **Availability Management**: Use toggle availability for temporary unavailability
4. **Break Times**: Include break times to prevent appointments during lunch
5. **Error Handling**: Always handle schedule conflicts gracefully
6. **Caching**: Consider caching frequently accessed schedules for performance 