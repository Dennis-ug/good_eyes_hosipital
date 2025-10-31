# Eye Clinic Management System - Project Documentation

## Project Overview
The Eye Clinic Management System is a comprehensive Spring Boot application designed for managing eye clinic operations including patient management, appointments, eye examinations, doctor schedules, inventory, and financial operations.

## Technology Stack
- **Framework**: Spring Boot 3.5.4
- **Language**: Java 17
- **Database**: PostgreSQL
- **Security**: JWT Authentication with Spring Security
- **Build Tool**: Maven
- **Auditing**: JPA Auditing with custom auditor configuration
- **Email**: Spring Mail with Gmail SMTP

## Core Features Implemented

### 1. Authentication & Authorization System
- **JWT-based authentication** with access and refresh tokens
- **Role-based access control** with the following roles:
  - SUPER_ADMIN: Full system access
  - ADMIN: Administrative access
  - USER: Basic access
  - RECEPTIONIST: Patient registration and reception duties
  - OPTOMETRIST: Eye examinations and optometry services
  - OPHTHALMOLOGIST: Medical eye care and ophthalmology services
- **Password change functionality** with email notifications
- **Token refresh mechanism** for extended sessions

### 2. User Management
- **User creation** with role assignment
- **Email notifications** for new user accounts
- **Department-based user organization**
- **User profile management**

### 3. Patient Management
- **Patient registration** and profile management
- **Patient search** and retrieval
- **Patient data validation** and storage
- **Medical history tracking**

### 4. Appointment System
- **Appointment scheduling** with conflict checking
- **Appointment types** management (Consultation, Eye Examination, Follow-up, Surgery)
- **Doctor schedule integration**
- **Appointment status tracking**
- **Conflict detection** for overlapping appointments

### 5. Doctor Schedule Management
- **Schedule creation** and management
- **Time slot management** (30-minute intervals)
- **Schedule conflict detection**
- **Schedule deletion** with validation
- **Department-based scheduling**

### 6. Eye Examination System
- **Comprehensive eye examination** tracking
- **Examination results** storage
- **Patient examination history**
- **Optometry-specific features**

### 7. Department Management
- **Department creation** and management
- **Department assignment** to users
- **Department-based access control**

### 8. Role and Permission System
- **Role management** with hierarchical permissions
- **Permission-based access control**
- **Dynamic permission assignment**

### 9. Inventory Management
- **Inventory categories** management
- **Inventory items** tracking
- **Stock management**
- **Category-based organization**

### 10. Financial Management
- **Invoice generation** and management
- **Invoice items** with inventory integration
- **Payment tracking**
- **Financial reporting**
- **Invoice status management**

### 11. Reception Services
- **Patient check-in/check-out**
- **Reception workflow** management
- **Patient queue management**

## Database Schema

### Core Entities
- **User**: System users with roles and departments
- **Patient**: Patient information and medical records
- **Appointment**: Scheduled appointments with doctors
- **AppointmentType**: Different types of appointments
- **DoctorSchedule**: Doctor availability schedules
- **Department**: Organizational departments
- **Role**: User roles and permissions
- **Permission**: System permissions
- **EyeExamination**: Eye examination records
- **InventoryCategory**: Product categories
- **InventoryItem**: Stock items
- **Invoice**: Financial invoices
- **InvoiceItem**: Invoice line items

### Audit Features
- **BaseAuditEntity**: Automatic audit trail for all entities
- **Created/Updated timestamps**
- **User tracking** for all changes
- **Audit configuration** with Spring Security integration

## API Endpoints

### Authentication APIs
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh-token` - Token refresh
- `POST /api/auth/change-password` - Password change
- `POST /api/auth/create-user` - User creation (SUPER_ADMIN)

### Patient Management
- `GET /api/patients` - Get all patients
- `GET /api/patients/{id}` - Get patient by ID
- `POST /api/patients` - Create patient
- `PUT /api/patients/{id}` - Update patient

### Appointment Management
- `GET /api/appointments` - Get all appointments
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/{id}` - Update appointment
- `DELETE /api/appointments/{id}` - Delete appointment
- `GET /api/appointments/conflicts` - Check for conflicts

### Doctor Schedule Management
- `GET /api/doctor-schedules` - Get schedules
- `POST /api/doctor-schedules` - Create schedule
- `DELETE /api/doctor-schedules/{id}` - Delete schedule
- `GET /api/doctor-schedules/conflicts` - Check conflicts

### Eye Examination
- `GET /api/eye-examinations` - Get examinations
- `POST /api/eye-examinations` - Create examination
- `GET /api/eye-examinations/{id}` - Get examination by ID

### Inventory Management
- `GET /api/inventory-categories` - Get categories
- `POST /api/inventory-categories` - Create category
- `GET /api/inventory-items` - Get items
- `POST /api/inventory-items` - Create item

### Financial Management
- `GET /api/invoices` - Get invoices
- `POST /api/invoices` - Create invoice
- `GET /api/invoices/{id}` - Get invoice by ID

### User Management
- `GET /api/users` - Get users
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

## Database Migrations

### Migration History
1. **V1**: Populate audit fields for existing entities
2. **V2**: Create finance tables (Invoice, InvoiceItem)
3. **V3**: Add doctor role to existing doctors
4. **V4**: Create inventory tables (InventoryCategory, InventoryItem)
5. **V5**: Add inventory integration to invoice items

## Security Features

### JWT Implementation
- **Access tokens** with configurable expiration
- **Refresh tokens** for extended sessions
- **Token validation** and verification
- **Secure token storage**

### Spring Security Configuration
- **Stateless authentication**
- **CORS configuration**
- **Request filtering**
- **Role-based endpoint protection**

## Email Integration

### Email Service
- **Gmail SMTP** configuration
- **User notification** emails
- **Password reset** functionality
- **Account creation** notifications

## Configuration

### Application Properties
- **Database connection** to PostgreSQL
- **JWT secret** and expiration settings
- **Email configuration** for notifications
- **Server port** configuration (5025)
- **Logging levels** for different components

### Environment Variables
- `SPRING_DATASOURCE_URL`: Database connection URL
- `SPRING_DATASOURCE_USERNAME`: Database username
- `SPRING_DATASOURCE_PASSWORD`: Database password

## Testing and Documentation

### API Testing
- **Postman collection** available
- **Comprehensive test scripts** for all endpoints
- **Role-based testing** scenarios
- **Integration testing** scripts

### Documentation Files
- **API Documentation**: Detailed endpoint documentation
- **Testing Guides**: Step-by-step testing instructions
- **Quick Start Guide**: Setup and deployment instructions
- **Security Documentation**: JWT and security implementation details

## Deployment and Operations

### Application Startup
- **Maven-based** build system
- **Spring Boot** auto-configuration
- **Database initialization** with data.sql
- **Audit field population** on startup

### Monitoring and Logging
- **Structured logging** configuration
- **SQL query logging** (configurable)
- **Security event logging**
- **Application performance** monitoring

## Key Features Summary

✅ **Complete Authentication System** with JWT and role-based access  
✅ **Comprehensive Patient Management** with medical records  
✅ **Advanced Appointment System** with conflict detection  
✅ **Doctor Schedule Management** with time slot handling  
✅ **Eye Examination Tracking** for optometry services  
✅ **Inventory Management** with categories and items  
✅ **Financial Management** with invoice generation  
✅ **User Management** with email notifications  
✅ **Department and Role Management**  
✅ **Audit Trail** for all data changes  
✅ **Email Integration** for notifications  
✅ **Database Migrations** for schema evolution  
✅ **Comprehensive API Documentation**  
✅ **Testing Suite** with role-based scenarios  

## Next Steps and Recommendations

1. **Frontend Integration**: Develop React/Vue.js frontend
2. **Advanced Reporting**: Implement financial and medical reports
3. **Mobile App**: Develop mobile application for field work
4. **Advanced Analytics**: Add data analytics and insights
5. **Integration**: Connect with external medical systems
6. **Backup and Recovery**: Implement automated backup systems
7. **Performance Optimization**: Add caching and optimization
8. **Advanced Security**: Implement additional security measures

This system provides a solid foundation for a comprehensive eye clinic management solution with all core functionalities implemented and ready for production use. 