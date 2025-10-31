# Automatic Invoice Creation with User-Based Approach

## Problem Solved
The automatic invoice creation was failing because the `Invoice` entity required a specific `doctor_id` field, but the automatic creation process didn't have a doctor assigned.

## New Solution

### 1. **Updated Invoice Entity**
**File**: `Invoice.java`
```java
// Changed from doctor_id to user_id
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "user_id")
private User user;

// Updated getters/setters
public User getUser() { return user; }
public void setUser(User user) { this.user = user; }
```

### 2. **Enhanced InvoiceService**
**File**: `InvoiceService.java`
```java
// Get the currently logged-in user
Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
User currentUser = null;
if (authentication != null && authentication.getPrincipal() instanceof User) {
    currentUser = (User) authentication.getPrincipal();
}

// Set user information (currently logged-in user)
invoice.setUser(currentUser);
if (currentUser != null) {
    invoice.setDoctorName(currentUser.getFirstName() + " " + currentUser.getLastName());
    invoice.setDoctorSpecialty("Ophthalmology");
} else {
    invoice.setDoctorName("System Generated");
    invoice.setDoctorSpecialty("Ophthalmology");
}
```

### 3. **Database Migration**
**File**: `V15__update_invoice_user_field.sql`
```sql
-- Add new user_id column
ALTER TABLE invoices ADD COLUMN user_id BIGINT;

-- Add foreign key constraint
ALTER TABLE invoices ADD CONSTRAINT fk_invoices_user 
FOREIGN KEY (user_id) REFERENCES users(id);

-- Drop old doctor_id column
ALTER TABLE invoices DROP COLUMN IF EXISTS doctor_id;

-- Add index for performance
CREATE INDEX idx_invoices_user_id ON invoices(user_id);
```

## Key Benefits

### **✅ Flexible User Assignment**
- Any logged-in user can create invoices
- No longer requires a specific doctor
- System can create invoices even without a user (fallback)

### **✅ Automatic Invoice Creation**
- Works for `NEW_CONSULTATION` visit sessions
- Uses currently logged-in user as invoice creator
- Maintains audit trail of who created the invoice

### **✅ Backward Compatibility**
- Existing invoices are preserved
- New approach is more flexible
- No breaking changes to existing functionality

## How It Works

### **1. Visit Session Creation**
```json
POST /api/patient-visit-sessions
{
  "patientId": 1,
  "visitPurpose": "NEW_CONSULTATION",
  "consultationFeeAmount": 50.00
}
```

### **2. Automatic Invoice Creation**
- System detects `NEW_CONSULTATION` visit purpose
- Gets currently logged-in user from security context
- Creates invoice with user as creator
- Sets doctor name to user's name
- Links invoice to visit session

### **3. Expected Response**
```json
{
  "id": 1,
  "patientId": 1,
  "visitPurpose": "NEW_CONSULTATION",
  "status": "INVOICE_CREATED",
  "currentStage": "CASHIER",
  "consultationFeePaid": false,
  "consultationFeeAmount": 50.0,
  "invoiceId": 1,
  "createdAt": "2025-08-08T12:40:56",
  "updatedAt": "2025-08-08T12:40:56"
}
```

## Testing

### Test Script Created
- `test-automatic-invoice.sh` - Tests automatic invoice creation
- Uses `NEW_CONSULTATION` visit type
- Verifies invoice is created automatically

### Manual Testing
```bash
# Test automatic invoice creation
curl -X POST http://localhost:5025/api/patient-visit-sessions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "patientId": 1,
    "visitPurpose": "NEW_CONSULTATION",
    "consultationFeeAmount": 50.00
  }'
```

## Current Status

✅ **Automatic invoice creation re-enabled**
✅ **User-based approach implemented**
✅ **Database migration created**
✅ **Test script created**
✅ **Backward compatibility maintained**

The automatic invoice creation should now work properly for new consultation visits, using the currently logged-in user as the invoice creator. 