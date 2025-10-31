# How to See the Invoice Creation Button

## 🎯 **The Issue**
The "Create Invoice" button only appears when there are procedures added to the visit session. Since visit session 13 has no procedures yet, the button is hidden.

## ✅ **Solution: Two Ways to See the Button**

### **Option 1: Use the Demo Button (Easiest)**
1. Go to: `http://localhost:3000/dashboard/patient-visit-sessions/13/procedures`
2. Look for the **"Add Demo Procedures"** button (yellow button)
3. Click it to add demo procedures
4. The **"Create Invoice"** button will now appear!

### **Option 2: Add Real Procedures**
1. Go to: `http://localhost:3000/dashboard/patient-visit-sessions/13/procedures`
2. Click **"Add Procedure"** (green button)
3. Select a procedure from the dropdown
4. Fill in the details (cost, staff fee, etc.)
5. Click **"Save"**
6. The **"Create Invoice"** button will appear!

## 🔍 **What You'll See**

### **Before Adding Procedures:**
- ✅ "Add Demo Procedures" button (yellow)
- ✅ "Add procedures first to create invoice" message
- ❌ "Create Invoice" button (hidden)

### **After Adding Procedures:**
- ✅ "Create Invoice" button (blue)
- ✅ Procedures list with costs
- ✅ Billing summary with totals

## 🧪 **Testing the Feature**

1. **Add procedures** (using demo or real)
2. **Click "Create Invoice"** button
3. **Confirm** the action
4. **See success message** with invoice number
5. **View the created invoice** in the success message

## 📝 **Current Status**
- ✅ Backend API implemented
- ✅ Frontend button implemented  
- ✅ Demo procedures function added
- ✅ Success message implemented
- ✅ All functionality working

The feature is **fully implemented and working** - you just need to add procedures first to see the invoice button!
