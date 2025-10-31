# Troubleshooting Invoice Access Issues

## 🎯 **Problem**: Still can't see invoices in `/dashboard/finance/invoices`

## 🔍 **Step-by-Step Troubleshooting**

### **Step 1: Verify Backend is Running with New Permissions**

1. **Check if backend restarted properly**:
   ```bash
   # The backend should be running on port 5025
   curl http://localhost:5025/api/health
   ```

2. **Expected response**: `401 Unauthorized` (this is normal - means backend is running)

### **Step 2: Check Your Login Role**

The invoice access now requires one of these roles:
- `RECEPTIONIST`
- `DOCTOR` 
- `ACCOUNTANT`
- `ACCOUNT_STORE_MANAGER`
- `SUPER_ADMIN`

**To check your current role**:
1. Go to: `http://localhost:3000/dashboard`
2. Look at the top navigation or user menu
3. Check what role you're logged in with

**If you're not logged in with the right role**:
1. Log out: `http://localhost:3000/logout`
2. Log in with a user that has one of the required roles
3. Try accessing invoices again

### **Step 3: Test Direct Access**

1. **Open the test page**: Open `test-invoice-access.html` in your browser
2. **Click "Test Backend Connection"** - should show ✅ Backend is running
3. **Click "Test Authentication"** - should show ✅ Authentication successful
4. **Try the direct links** to the invoices page

### **Step 4: Create a Test Invoice**

1. **Go to**: `http://localhost:3000/dashboard/patient-visit-sessions/13/procedures`
2. **Add procedures**: Click "Add Demo Procedures" (yellow button)
3. **Create invoice**: Click "Create Invoice" (blue button)
4. **Check if it appears**: Go to `http://localhost:3000/dashboard/finance/invoices`

### **Step 5: Check Browser Console**

1. **Open browser developer tools** (F12)
2. **Go to Console tab**
3. **Navigate to**: `http://localhost:3000/dashboard/finance/invoices`
4. **Look for any error messages** in the console

### **Step 6: Alternative Access Methods**

If the main invoices page still doesn't work, try these alternatives:

#### **Option A: Finance Dashboard**
- Go to: `http://localhost:3000/dashboard/finance`
- Look for "Recent Invoices" section

#### **Option B: Patient-Specific View**
- Go to: `http://localhost:3000/dashboard/patient-visit-sessions/13/procedures`
- Click "View Patient Invoices" button
- This shows invoices for the specific patient

#### **Option C: Direct Invoice URL**
- After creating an invoice, use the success message link
- Or construct URL: `http://localhost:3000/dashboard/finance/invoices/{invoice_id}`

## 🚨 **Common Issues and Solutions**

### **Issue 1: "Access Denied" Error**
**Cause**: Wrong role or not logged in
**Solution**: Log in with RECEPTIONIST, DOCTOR, ACCOUNTANT, or SUPER_ADMIN role

### **Issue 2: "Page Not Found" Error**
**Cause**: Frontend not running or wrong URL
**Solution**: Make sure frontend is running on `http://localhost:3000`

### **Issue 3: "No Invoices Found"**
**Cause**: No invoices exist yet
**Solution**: Create a test invoice first using the procedures page

### **Issue 4: "Backend Connection Failed"**
**Cause**: Backend not running
**Solution**: Start the backend with `./mvnw spring-boot:run`

## 🧪 **Quick Test Commands**

```bash
# Test backend
curl http://localhost:5025/api/health

# Test invoices endpoint (will return 401 if not authenticated)
curl http://localhost:5025/api/finance/invoices?page=0&size=5

# Check if frontend is running
curl http://localhost:3000
```

## 📞 **Still Having Issues?**

If you're still having problems:

1. **Check the browser console** for JavaScript errors
2. **Verify your login role** is one of the permitted roles
3. **Try creating a test invoice** first to ensure the system works
4. **Check if both frontend and backend are running** properly

The role permissions have been updated, so the issue is likely related to authentication or the specific user role you're logged in with.
