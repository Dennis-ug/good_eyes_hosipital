# Postman Collection Guide - Eyesante Healthcare Management System

## Overview

This guide provides instructions for using the complete Postman collection for the Eyesante Healthcare Management System API.

## Collection File

**File:** `Eyesante_Complete_API_Collection.json`

## Setup Instructions

### 1. Import the Collection

1. Open Postman
2. Click "Import" button
3. Select the `Eyesante_Complete_API_Collection.json` file
4. The collection will be imported with all endpoints organized by module

### 2. Configure Environment Variables

The collection uses the following variables:

- **`base_url`**: Set to `http://localhost:5025` (or your server URL)
- **`access_token`**: Will be automatically set after login

### 3. Authentication Setup

1. **Login First**: Always start by running the "Login" request in the Authentication folder
2. **Copy Token**: After successful login, copy the `accessToken` from the response
3. **Set Token**: Paste the token into the `access_token` variable in your environment

## Module Overview

### 1. Authentication
- **Login**: Authenticate and get JWT token
- **Create User**: Create new users (Super Admin only)
- **Change Password**: Change user password

### 2. User Management
- **Get All Users**: Retrieve paginated list of users
- **Create User**: Create new user with roles
- **Delete User**: Delete user by ID
- **Update User Roles**: Modify user roles

### 3. Department Management
- **Get All Departments**: List all departments
- **Get Department by ID**: Get specific department
- **Create Department**: Add new department
- **Update Department**: Modify department details
- **Delete Department**: Remove department

### 4. Role & Permission Management
- **Get All Roles**: List all roles with pagination
- **Create Role**: Add new role with permissions
- **Delete Role**: Remove role (if not assigned to users)
- **Get All Permissions**: List all available permissions

### 5. Appointment Management
- **Get All Appointments**: Retrieve paginated appointments
- **Create Appointment**: Schedule new appointment
- **Get Appointment by ID**: Get specific appointment
- **Update Appointment Status**: Change appointment status
- **Check Conflicts**: Verify appointment availability
- **Check Doctor Availability**: Check doctor's schedule

### 6. Doctor Schedule Management
- **Get All Doctor Schedules**: List all schedules
- **Create Doctor Schedule**: Add new schedule
- **Get Schedules by Doctor**: Get doctor's schedules
- **Get Available Schedules**: List available schedules

### 7. Appointment Type Management
- **Get All Appointment Types**: List appointment types
- **Create Appointment Type**: Add new appointment type

### 8. Eye Examination Management
- **Get All Eye Examinations**: List all examinations
- **Create Eye Examination**: Add new examination
- **Get Patient Examinations**: Get patient's exam history
- **Get Latest Patient Examination**: Get most recent exam

### 9. Finance Management
- **Get All Invoices**: List all invoices
- **Generate Invoice**: Create invoice for appointment
- **Get Invoice by ID**: Get specific invoice
- **Record Payment**: Process payment
- **Get Overdue Invoices**: List overdue invoices
- **Get Financial Summary**: Get financial reports

### 10. Patient Management
- **Get All Patients**: List all patients
- **Create Patient**: Add new patient
- **Get Patient by ID**: Get specific patient
- **Update Patient**: Modify patient details
- **Delete Patient**: Remove patient

## Usage Examples

### Example 1: Complete User Creation Workflow

1. **Login as Super Admin**
   ```bash
   POST {{base_url}}/api/auth/login
   {
     "username": "superadmin",
     "password": "superadmin123"
   }
   ```

2. **Create New User**
   ```bash
   POST {{base_url}}/api/user-management/users
   {
     "username": "doctor1",
     "email": "doctor1@eyesante.com",
     "firstName": "John",
     "lastName": "Smith",
     "departmentId": 1,
     "roleIds": [2, 5]
   }
   ```

3. **Verify User Creation**
   ```bash
   GET {{base_url}}/api/user-management/users?page=0&size=10
   ```

### Example 2: Complete Appointment Workflow

1. **Create Patient**
   ```bash
   POST {{base_url}}/api/patients
   {
     "firstName": "Jane",
     "lastName": "Doe",
     "dateOfBirth": "1990-01-01",
     "gender": "FEMALE",
     "phone": "+1234567890",
     "email": "jane.doe@email.com"
   }
   ```

2. **Check Doctor Availability**
   ```bash
   GET {{base_url}}/api/appointments/check-availability?doctorId=2&appointmentDate=2025-08-15&appointmentTime=09:00:00
   ```

3. **Create Appointment**
   ```bash
   POST {{base_url}}/api/appointments
   {
     "patientId": 1,
     "doctorId": 2,
     "appointmentTypeId": 1,
     "appointmentDate": "2025-08-15",
     "appointmentTime": "09:00:00",
     "reason": "Regular checkup"
   }
   ```

4. **Update Appointment Status**
   ```bash
   PUT {{base_url}}/api/appointments/1/status
   {
     "status": "COMPLETED"
   }
   ```

5. **Generate Invoice**
   ```bash
   POST {{base_url}}/api/finance/invoices/generate/1
   ```

6. **Record Payment**
   ```bash
   POST {{base_url}}/api/finance/invoices/1/payment?amount=165.00&method=CASH&reference=PAY-001
   ```

### Example 3: Financial Reporting

1. **Get Financial Summary**
   ```bash
   GET {{base_url}}/api/finance/summary?startDate=2025-08-01&endDate=2025-08-31
   ```

2. **Get Overdue Invoices**
   ```bash
   GET {{base_url}}/api/finance/invoices/overdue
   ```

3. **Get Invoices by Status**
   ```bash
   GET {{base_url}}/api/finance/invoices/status/PAID?page=0&size=10
   ```

## Common Request Headers

Most requests require these headers:
```
Content-Type: application/json
Authorization: Bearer {{access_token}}
```

## Pagination Parameters

Many endpoints support pagination:
- `page`: Page number (0-based)
- `size`: Number of items per page
- `sort`: Sort field (e.g., "id,desc", "name,asc")

## Error Handling

### Common Error Responses

**401 Unauthorized**
```json
{
  "status": 401,
  "error": "Unauthorized",
  "message": "Access denied. Please provide valid authentication credentials."
}
```

**403 Forbidden**
```json
{
  "status": 403,
  "error": "Forbidden",
  "message": "Access denied. Insufficient privileges."
}
```

**404 Not Found**
```json
{
  "status": 404,
  "error": "Not Found",
  "message": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "status": 500,
  "error": "Internal Server Error",
  "message": "An unexpected error occurred. Please try again later."
}
```

## Testing Tips

1. **Always authenticate first** before testing other endpoints
2. **Use pagination** for large datasets to improve performance
3. **Check response status codes** to understand request results
4. **Use the collection variables** for consistent testing
5. **Test error scenarios** by providing invalid data
6. **Verify data integrity** by checking created resources

## Role-Based Access

Different endpoints require different roles:

- **SUPER_ADMIN**: Full access to all endpoints
- **ADMIN**: Most administrative functions
- **DOCTOR**: Patient care and examination functions
- **OPTOMETRIST**: Eye examination functions
- **OPHTHALMOLOGIST**: Advanced eye care functions
- **RECEPTIONIST**: Appointment and patient management
- **ACCOUNTANT**: Financial management functions
- **USER**: Basic access

## Environment Setup

### Development Environment
```
base_url: http://localhost:5025
```

### Production Environment
```
base_url: https://your-production-domain.com
```

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Verify username/password
   - Check if user account is active
   - Ensure correct role permissions

2. **Connection Refused**
   - Verify server is running
   - Check port configuration
   - Ensure firewall settings

3. **Validation Errors**
   - Check required fields
   - Verify data formats
   - Ensure valid enum values

4. **Permission Denied**
   - Verify user has required role
   - Check endpoint authorization
   - Ensure proper authentication

### Debug Steps

1. Check application logs for detailed error messages
2. Verify database connectivity
3. Test with Postman's console for request/response details
4. Use browser developer tools for network analysis

## Support

For technical support or questions about the API:
- Check the API documentation
- Review error logs
- Contact the development team 