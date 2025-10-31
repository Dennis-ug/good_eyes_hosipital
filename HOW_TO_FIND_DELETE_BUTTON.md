# How to Find the Delete Button

## 🔍 **Why You Can't See the Delete Button**

The delete button has specific conditions that must be met to be visible. Let me help you troubleshoot:

## 📋 **Step-by-Step Troubleshooting**

### **1. Check Your User Role**
The delete button only shows for users with these roles:
- ✅ **RECEPTIONIST**
- ✅ **ADMIN** 
- ✅ **SUPER_ADMIN**

**To check your role:**
1. Look at the debug info box (yellow box) on the page
2. Check "Your role" - it should be one of the above

### **2. Check Session Stage**
The delete button only shows for sessions in **RECEPTION** stage:
- ✅ **RECEPTION** stage → Delete button visible
- ❌ **CASHIER** stage → No delete button
- ❌ **TRIAGE** stage → No delete button
- ❌ **DOCTOR_VISIT** stage → No delete button
- ❌ **PHARMACY** stage → No delete button
- ❌ **COMPLETED** stage → No delete button

**To check session stages:**
1. Look at the "Stage" column in the table
2. Look for sessions with "RECEPTION" stage
3. Check debug info: "Sessions in RECEPTION stage"

### **3. Check Permissions**
The delete button requires update permissions:
- ✅ `canUpdateVisitSessions` must be true
- ✅ `isAdmin` must be true (if you're an admin)

**To check permissions:**
1. Look at the debug info box
2. Check "canUpdateVisitSessions" and "isAdmin"

## 🎯 **How to See the Delete Button**

### **Option 1: Find a RECEPTION Stage Session**
1. Go to: `http://localhost:3000/dashboard/patient-visit-sessions`
2. Look for sessions with "RECEPTION" in the Stage column
3. If you have the right role, you'll see a 🗑️ trash icon

### **Option 2: Create a New Session (if you have permission)**
1. Click "Create Visit Session" button
2. Fill in the required fields
3. Create the session
4. The new session will be in RECEPTION stage
5. Look for the 🗑️ trash icon in the Actions column

### **Option 3: Filter to RECEPTION Stage**
1. Use the "Stage" filter dropdown
2. Select "RECEPTION"
3. This will show only RECEPTION stage sessions
4. Look for the 🗑️ trash icon

## 🔧 **If You Still Can't See It**

### **Check the Debug Info**
The yellow debug box shows:
- ✅ **isAdmin**: Should be true if you're an admin
- ✅ **canUpdateVisitSessions**: Should be true if you have permissions
- ✅ **Sessions in RECEPTION stage**: Should be > 0 to see delete buttons
- ✅ **Your role**: Should be RECEPTIONIST, ADMIN, or SUPER_ADMIN

### **Common Issues**
1. **No RECEPTION sessions**: All sessions might be in other stages
2. **Wrong role**: Your user account might not have delete permissions
3. **No permissions**: `canUpdateVisitSessions` might be false

## 🧪 **Test the Delete Functionality**

### **If you can see the delete button:**
1. Click the 🗑️ trash icon
2. A confirmation modal will appear
3. Review the session details
4. Click "Delete Visit Session"
5. Session will be removed from the list

### **If you can't see the delete button:**
1. Check the debug info
2. Verify your role and permissions
3. Look for RECEPTION stage sessions
4. Contact an admin if you need delete permissions

## 🎉 **Summary**

The delete button is there, but it's **conditionally visible** based on:
- ✅ **Your role** (RECEPTIONIST, ADMIN, SUPER_ADMIN)
- ✅ **Session stage** (must be RECEPTION)
- ✅ **Your permissions** (canUpdateVisitSessions)

Check the debug info box to see what's preventing the button from showing!
