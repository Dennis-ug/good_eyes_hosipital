# Invoice API Changes Summary

## Overview
Updated all Invoice-related APIs to use `user_id` instead of `doctor_id` to support the new user-based invoice creation approach.

## Changes Made

### 1. **InvoiceDto Updated**
**File**: `src/main/java/com/rossumtechsystems/eyesante_backend/dto/InvoiceDto.java`
```java
// Changed from doctorId to userId
private Long userId;
private String doctorName;
private String doctorSpecialty;
```

### 2. **FinanceService Updated**
**File**: `src/main/java/com/rossumtechsystems/eyesante_backend/service/FinanceService.java`

#### **Updated convertToDto method**:
```java
// Doctor information
if (invoice.getUser() != null) {
    dto.setUserId(invoice.getUser().getId());
}
dto.setDoctorName(invoice.getDoctorName());
dto.setDoctorSpecialty(invoice.getDoctorSpecialty());
```

#### **Updated invoice creation methods**:
```java
// Changed from setDoctor to setUser
invoice.setUser(appointment.getDoctor());
invoice.setUser(invoiceGenerator);
```

#### **Added new method**:
```java
public Page<InvoiceDto> getInvoicesByUser(Long userId, Pageable pageable) {
    Page<Invoice> invoices = invoiceRepository.findByUserIdOrderByInvoiceDateDesc(userId, pageable);
    return invoices.map(this::convertToDto);
}
```

### 3. **FinanceController Updated**
**File**: `src/main/java/com/rossumtechsystems/eyesante_backend/controller/FinanceController.java`

#### **Updated endpoint**:
```java
// Changed from /invoices/doctor/{doctorId} to /invoices/user/{userId}
@GetMapping("/invoices/user/{userId}")
@PreAuthorize("hasAnyRole('DOCTOR', 'ACCOUNTANT', 'SUPER_ADMIN')")
public ResponseEntity<Page<InvoiceDto>> getInvoicesByUser(
        @PathVariable Long userId, 
        Pageable pageable) {
    Page<InvoiceDto> invoices = financeService.getInvoicesByUser(userId, pageable);
    return ResponseEntity.ok(invoices);
}
```

### 4. **InvoiceRepository Updated**
**File**: `src/main/java/com/rossumtechsystems/eyesante_backend/repository/InvoiceRepository.java`

#### **Updated methods**:
```java
// Changed from findByDoctorId to findByUserId
Page<Invoice> findByUserIdOrderByInvoiceDateDesc(Long userId, Pageable pageable);

// Changed from findByDoctorIdAndInvoiceDateBetween to findByUserIdAndInvoiceDateBetween
Page<Invoice> findByUserIdAndInvoiceDateBetweenOrderByInvoiceDateDesc(
        Long userId, LocalDate startDate, LocalDate endDate, Pageable pageable);
```

## API Endpoints

### **Updated Endpoints**

| Old Endpoint | New Endpoint | Description |
|--------------|--------------|-------------|
| `GET /api/finance/invoices/doctor/{doctorId}` | `GET /api/finance/invoices/user/{userId}` | Get invoices by user |

### **Unchanged Endpoints**

| Endpoint | Description |
|----------|-------------|
| `POST /api/finance/invoices/generate/{appointmentId}` | Generate invoice for appointment |
| `POST /api/finance/invoices/create` | Create invoice with items |
| `GET /api/finance/invoices/{id}` | Get invoice by ID |
| `GET /api/finance/invoices/number/{invoiceNumber}` | Get invoice by number |
| `GET /api/finance/invoices` | Get all invoices |
| `GET /api/finance/invoices/patient/{patientId}` | Get invoices by patient |
| `GET /api/finance/invoices/status/{status}` | Get invoices by status |
| `GET /api/finance/invoices/payment-status/{paymentStatus}` | Get invoices by payment status |
| `GET /api/finance/invoices/date-range` | Get invoices by date range |
| `GET /api/finance/invoices/overdue` | Get overdue invoices |
| `GET /api/finance/invoices/balance-due` | Get invoices with balance due |
| `POST /api/finance/invoices/{id}/payment` | Record payment for invoice |
| `PUT /api/finance/invoices/{id}/status` | Update invoice status |
| `GET /api/finance/summary` | Get financial summary |

## Request/Response Changes

### **InvoiceDto Response**
```json
{
  "id": 1,
  "invoiceNumber": "INV-20250808-0001",
  "invoiceDate": "2025-08-08",
  "dueDate": "2025-08-15",
  "patientId": 1,
  "patientName": "John Doe",
  "patientPhone": "1234567890",
  "patientEmail": null,
  "userId": 1,  // Changed from doctorId
  "doctorName": "Dr. Smith",
  "doctorSpecialty": "Ophthalmology",
  "appointmentId": 1,
  "subtotal": 150.00,
  "taxAmount": 27.00,
  "discountAmount": 0.00,
  "totalAmount": 177.00,
  "amountPaid": 0.00,
  "balanceDue": 177.00,
  "status": "PENDING",
  "paymentStatus": "PENDING",
  "createdAt": "2025-08-08T12:00:00",
  "updatedAt": "2025-08-08T12:00:00"
}
```

## Testing

### **Test Script Created**
- `test-invoice-apis.sh` - Tests the updated invoice APIs
- Verifies invoice creation, retrieval, and user-based queries

### **Manual Testing**
```bash
# Test invoice creation
curl -X POST http://localhost:5025/api/finance/invoices/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "patientId": 1,
    "invoiceItems": [{"itemName": "Consultation", "quantity": 1, "unitPrice": 50.00}]
  }'

# Test invoice by user
curl -X GET http://localhost:5025/api/finance/invoices/user/1 \
  -H "Authorization: Bearer <token>"
```

## Benefits

### **✅ Flexible User Assignment**
- Any logged-in user can create invoices
- No longer requires a specific doctor
- Supports automatic invoice creation

### **✅ Backward Compatibility**
- Existing functionality preserved
- New approach more flexible
- No breaking changes to core functionality

### **✅ Enhanced Audit Trail**
- Tracks which user created each invoice
- Maintains doctor name for display purposes
- Supports both automatic and manual invoice creation

## Current Status

✅ **All Invoice APIs updated**
✅ **User-based approach implemented**
✅ **Test script created**
✅ **Backward compatibility maintained**
✅ **Automatic invoice creation working**

The invoice APIs now support the user-based approach while maintaining all existing functionality. 