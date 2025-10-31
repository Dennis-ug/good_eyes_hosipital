# Invoice Creation from Procedures Feature

## Overview
This feature allows users to create invoices directly from patient procedures after they have been added to a visit session. This streamlines the billing process by automatically generating invoices with all the procedures and their associated costs.

## Features

### 1. **Automatic Invoice Generation**
- Creates invoices from existing patient procedures
- Includes all procedures with their costs and staff fees
- Automatically calculates totals including tax
- Links the invoice to the visit session

### 2. **User Interface Integration**
- "Create Invoice" button appears when procedures are added
- Real-time feedback during invoice creation
- Success message with invoice details
- Direct link to view the created invoice

### 3. **Business Logic**
- Validates that procedures exist before creating invoice
- Prevents duplicate invoices for the same visit session
- Uses authenticated user as invoice creator
- Applies standard tax rate (18% VAT)

## API Endpoints

### Create Invoice from Procedures
```http
POST /api/appointments/visit-sessions/{visitSessionId}/create-invoice-from-procedures
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": 1,
  "invoiceNumber": "INV-20250108-0001",
  "invoiceDate": "2025-01-08",
  "dueDate": "2025-02-07",
  "patientId": 1,
  "patientName": "John Doe",
  "patientPhone": "+256123456789",
  "userId": 1,
  "doctorName": "Dr. Smith",
  "doctorSpecialty": "Ophthalmology",
  "subtotal": 60000.00,
  "taxAmount": 10800.00,
  "discountAmount": 0.00,
  "totalAmount": 70800.00,
  "amountPaid": 0.00,
  "balanceDue": 70800.00,
  "status": "PENDING",
  "paymentStatus": "PENDING",
  "notes": "Invoice generated from procedures for visit session 1",
  "invoiceItems": [
    {
      "id": 1,
      "itemName": "Slit Lamp Examination",
      "itemDescription": "Slit lamp examination of the eye",
      "itemType": "PROCEDURE",
      "quantity": 1,
      "unitPrice": 25000.00,
      "totalPrice": 25000.00,
      "finalPrice": 29500.00,
      "taxPercentage": 18.00,
      "taxAmount": 4500.00,
      "notes": "Slit lamp examination completed"
    },
    {
      "id": 2,
      "itemName": "Fundus Examination",
      "itemDescription": "Fundus examination with ophthalmoscope",
      "itemType": "PROCEDURE",
      "quantity": 1,
      "unitPrice": 35000.00,
      "totalPrice": 35000.00,
      "finalPrice": 41300.00,
      "taxPercentage": 18.00,
      "taxAmount": 6300.00,
      "notes": "Fundus examination completed"
    }
  ]
}
```

## Frontend Integration

### Procedures Page Updates
The procedures page (`/dashboard/patient-visit-sessions/[id]/procedures/page.tsx`) now includes:

1. **Create Invoice Button**
   - Appears only when procedures exist
   - Shows loading state during creation
   - Disabled when no procedures are present

2. **Success Message**
   - Displays after successful invoice creation
   - Shows invoice number and total amount
   - Includes link to view the full invoice

3. **API Integration**
   - Uses `financeApi.createInvoiceFromProcedures()`
   - Handles errors gracefully
   - Updates UI state appropriately

## Backend Implementation

### FinanceService Updates
Added new method `createInvoiceFromProcedures()`:

```java
public InvoiceDto createInvoiceFromProcedures(Long visitSessionId, String authenticatedUsername) {
    // Get authenticated user
    User invoiceGenerator = userRepository.findByUsername(authenticatedUsername)
            .orElseThrow(() -> new RuntimeException("User not found"));
    
    // Get visit session and procedures
    PatientVisitSession visitSession = patientVisitSessionRepository.findById(visitSessionId)
            .orElseThrow(() -> new RuntimeException("Visit session not found"));
    
    List<PatientProcedure> procedures = patientProcedureRepository.findByVisitSessionId(visitSessionId);
    
    // Validate procedures exist
    if (procedures.isEmpty()) {
        throw new RuntimeException("No procedures found for visit session ID: " + visitSessionId);
    }
    
    // Check for existing invoice
    if (visitSession.getInvoice() != null) {
        throw new RuntimeException("Invoice already exists for visit session ID: " + visitSessionId);
    }
    
    // Create invoice with procedures
    Invoice invoice = new Invoice();
    // ... set invoice details
    
    // Create invoice items from procedures
    List<InvoiceItem> invoiceItems = procedures.stream()
            .map(procedure -> createInvoiceItemFromProcedure(invoice, procedure))
            .collect(Collectors.toList());
    
    // Save and link to visit session
    Invoice savedInvoice = invoiceRepository.save(invoice);
    visitSession.setInvoice(savedInvoice);
    patientVisitSessionRepository.save(visitSession);
    
    return convertToDto(savedInvoice);
}
```

### Invoice Item Creation
Each procedure is converted to an invoice item:

```java
private InvoiceItem createInvoiceItemFromProcedure(Invoice invoice, PatientProcedure procedure) {
    InvoiceItem item = new InvoiceItem();
    item.setInvoice(invoice);
    item.setItemName(procedure.getProcedure().getName());
    item.setItemDescription(procedure.getProcedure().getDescription());
    item.setItemType("PROCEDURE");
    item.setQuantity(1);
    item.setUnitPrice(procedure.getCost());
    item.setTaxPercentage(new BigDecimal("18.00")); // 18% VAT
    item.calculateTotals();
    return item;
}
```

## Database Relationships

### Visit Session to Invoice
- `PatientVisitSession` has a one-to-one relationship with `Invoice`
- When an invoice is created, the visit session is updated to reference it
- This prevents duplicate invoices for the same visit session

### Procedure to Invoice Item
- Each `PatientProcedure` becomes an `InvoiceItem`
- Procedure costs are used as unit prices
- Staff fees are included in the procedure cost
- Tax is calculated on the total amount

## Testing

### Test Script
A comprehensive test script is provided: `test-create-invoice-from-procedures.sh`

The script tests:
1. Creating a visit session
2. Adding procedures to the visit session
3. Creating an invoice from the procedures
4. Verifying invoice details and item count
5. Confirming visit session is linked to the invoice

### Manual Testing
1. Navigate to a patient visit session
2. Go to the procedures page
3. Add some procedures
4. Click "Create Invoice" button
5. Verify invoice is created with correct details
6. Check that the invoice appears in the finance section

## Error Handling

### Validation Errors
- **No procedures**: "No procedures found for visit session ID: X"
- **Existing invoice**: "Invoice already exists for visit session ID: X"
- **Invalid visit session**: "Visit session not found with ID: X"
- **User not found**: "User not found with username: X"

### Frontend Error Handling
- Shows user-friendly error messages
- Prevents multiple submissions during processing
- Graceful fallback if API calls fail

## Security

### Authorization
- Endpoint requires authentication
- Users must have appropriate roles: `RECEPTIONIST`, `DOCTOR`, `ACCOUNTANT`, `ACCOUNT_STORE_MANAGER`, or `SUPER_ADMIN`
- Invoice creator is tracked for audit purposes

### Data Validation
- Validates visit session exists
- Checks for existing invoices
- Ensures procedures exist before creating invoice
- Validates user permissions

## Future Enhancements

### Potential Improvements
1. **Discount Management**: Allow discounts on procedures
2. **Insurance Integration**: Support for insurance coverage on procedures
3. **Bulk Operations**: Create invoices for multiple visit sessions
4. **Invoice Templates**: Customizable invoice formats
5. **Payment Integration**: Direct payment processing from invoice
6. **Email Integration**: Automatic invoice emailing to patients

### Configuration Options
1. **Tax Rates**: Configurable tax percentages
2. **Due Dates**: Customizable payment terms
3. **Invoice Numbering**: Configurable invoice number formats
4. **Default Values**: Set default costs and fees

## Usage Examples

### Creating an Invoice
```javascript
// Frontend usage
const handleCreateInvoice = async () => {
  try {
    const invoice = await financeApi.createInvoiceFromProcedures(visitSessionId);
    console.log('Invoice created:', invoice.invoiceNumber);
  } catch (error) {
    console.error('Failed to create invoice:', error);
  }
};
```

### API Call
```bash
curl -X POST "http://localhost:5025/api/appointments/visit-sessions/1/create-invoice-from-procedures" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"
```

This feature provides a seamless workflow from procedure addition to invoice generation, improving the efficiency of the billing process in the healthcare system.
