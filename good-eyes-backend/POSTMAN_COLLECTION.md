# Eyesante Healthcare API - Postman Collection

## Quick Setup

1. **Import Collection**: Import `Eyesante_API_Collection.json` into Postman
2. **Set Variables**: 
   - `base_url`: `http://localhost:5025`
   - `access_token`: (leave empty)
3. **Login First**: Run the Login request to get your token

## Authentication

### Login
```http
POST {{base_url}}/api/auth/login
Content-Type: application/json

{
  "username": "superadmin",
  "password": "superadmin123"
}
```

### Change Password
```http
POST {{base_url}}/api/auth/change-password
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "currentPassword": "superadmin123",
  "newPassword": "newpassword123",
  "confirmPassword": "newpassword123"
}
```

## User Management

### Get All Users
```http
GET {{base_url}}/api/user-management/users?page=0&size=20
Authorization: Bearer {{access_token}}
```

### Create User
```http
POST {{base_url}}/api/user-management/users
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "username": "newdoctor",
  "email": "doctor@eyesante.com",
  "firstName": "John",
  "lastName": "Doe",
  "departmentId": 1,
  "roles": ["OPHTHALMOLOGIST"]
}
```

### Update User Roles
```http
PUT {{base_url}}/api/user-management/users/12/roles
Authorization: Bearer {{access_token}}
Content-Type: application/json

["OPHTHALMOLOGIST", "DOCTOR"]
```

## Department Management

### Get All Departments
```http
GET {{base_url}}/api/departments
Authorization: Bearer {{access_token}}
```

### Create Department
```http
POST {{base_url}}/api/departments
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "name": "Cardiology",
  "description": "Cardiology department"
}
```

## Appointment Management

### Get All Appointments
```http
GET {{base_url}}/api/appointments?page=0&size=20
Authorization: Bearer {{access_token}}
```

### Create Appointment
```http
POST {{base_url}}/api/appointments
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "patientId": 1,
  "doctorId": 12,
  "appointmentDate": "2025-08-03",
  "appointmentTime": "09:00:00",
  "duration": 30,
  "appointmentType": "ROUTINE_EXAMINATION",
  "reason": "Regular eye checkup",
  "priority": "NORMAL"
}
```

### Check Conflicts
```http
POST {{base_url}}/api/appointments/conflicts/check
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "doctorId": 12,
  "appointmentDate": "2025-08-03",
  "startTime": "09:00:00",
  "endTime": "09:30:00"
}
```

## Doctor Schedule Management

### Get All Schedules
```http
GET {{base_url}}/api/doctor-schedules?page=0&size=20
Authorization: Bearer {{access_token}}
```

### Create Schedule
```http
POST {{base_url}}/api/doctor-schedules
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "doctorId": 12,
  "dayOfWeek": 1,
  "startTime": "08:00:00",
  "endTime": "17:00:00",
  "breakStart": "12:00:00",
  "breakEnd": "13:00:00",
  "isAvailable": true
}
```

## Finance Management

### Get All Invoices
```http
GET {{base_url}}/api/finance/invoices?page=0&size=20
Authorization: Bearer {{access_token}}
```

### Generate Invoice
```http
POST {{base_url}}/api/finance/invoices/generate
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "appointmentId": 1
}
```

### Record Payment
```http
POST {{base_url}}/api/finance/payments
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "invoiceId": 1,
  "amount": 50000,
  "paymentMethod": "CASH",
  "paymentDate": "2025-08-02T10:00:00",
  "reference": "PAY-001",
  "notes": "Payment received"
}
```

## Testing Workflow

1. **Login** → Get access token
2. **Create Department** → Get department ID
3. **Create User** → Get user ID
4. **Create Schedule** → Set up doctor availability
5. **Create Appointment** → Book appointment
6. **Generate Invoice** → Create financial record
7. **Record Payment** → Complete transaction

## Common Response Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Environment Variables

Set these in Postman:
- `base_url`: `http://localhost:5025`
- `access_token`: JWT token from login 