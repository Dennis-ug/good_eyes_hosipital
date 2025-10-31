# Visit Session Delete Functionality

## ✅ **Delete Functionality Already Implemented**

The delete functionality for patient visit sessions is **already fully implemented** and working. Here's how it works:

## 🔧 **Backend Implementation**

### **Controller Endpoint**
```java
@DeleteMapping("/{id}")
@PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN', 'SUPER_ADMIN')")
public ResponseEntity<Object> deleteVisitSession(@PathVariable Long id) {
    log.info("Deleting visit session ID: {}", id);
    patientVisitSessionService.deleteVisitSession(id);
    
    return ResponseEntity.ok(Map.of(
        "status", "success",
        "message", "Visit session deleted successfully",
        "deletedId", id
    ));
}
```

### **Service Method**
```java
public void deleteVisitSession(Long id) {
    log.info("Deleting visit session ID: {}", id);
    
    if (!patientVisitSessionRepository.existsById(id)) {
        throw new RuntimeException("Visit session not found with ID: " + id);
    }
    
    patientVisitSessionRepository.deleteById(id);
}
```

## 🎨 **Frontend Implementation**

### **API Call**
```typescript
deleteVisitSession: (id: number): Promise<DeleteVisitSessionResponse> => {
  return apiRequest<DeleteVisitSessionResponse>(`/patient-visit-sessions/${id}`, {
    method: 'DELETE',
  })
}
```

### **Delete Handler**
```typescript
const handleDeleteVisitSession = async () => {
  if (!deletingId || isDeleting) return

  try {
    setIsDeleting(true)
    
    const deleteResponse = await patientVisitSessionApi.deleteVisitSession(deletingId)
    
    if (deleteResponse.status === 'success') {
      alert(`Visit session deleted successfully! (ID: ${deleteResponse.deletedId})`)
      
      // Remove from list and refetch
      setVisitSessions(prev => {
        if (!prev) return prev
        const newContent = prev.content.filter(session => session.id !== deletingId)
        return {
          ...prev,
          content: newContent,
          totalElements: prev.totalElements - 1
        }
      })
    }
    
    setDeletingId(null)
  } catch (error) {
    console.error('Failed to delete visit session:', error)
    alert(`Error: ${error.message}`)
  } finally {
    setIsDeleting(false)
  }
}
```

## 🎯 **How to Use Delete Functionality**

### **1. Access the Delete Button**
- Go to: `http://localhost:3000/dashboard/patient-visit-sessions`
- Find a visit session in the **RECEPTION** stage
- Look for the **🗑️ (Trash)** icon in the Actions column

### **2. Delete Button Visibility**
The delete button is only visible when:
- ✅ User has **RECEPTIONIST**, **ADMIN**, or **SUPER_ADMIN** role
- ✅ Visit session is in **RECEPTION** stage only
- ✅ User has update permissions (`canUpdateVisitSessions`)

### **3. Delete Process**
1. **Click the trash icon** → Opens confirmation modal
2. **Review session details** → Shows patient info, purpose, status
3. **Confirm deletion** → Click "Delete Visit Session" button
4. **Success feedback** → Alert shows successful deletion
5. **List updates** → Session removed from table immediately

## 🔒 **Security & Permissions**

### **Backend Security**
- **Role-based access**: Only `RECEPTIONIST`, `ADMIN`, `SUPER_ADMIN` can delete
- **@PreAuthorize annotation**: Enforces role checks
- **Validation**: Checks if session exists before deletion

### **Frontend Security**
- **Permission checks**: `canUpdateVisitSessions` required
- **Role checks**: Admin role required
- **Stage restrictions**: Only RECEPTION stage sessions can be deleted

## 📋 **Delete Confirmation Modal**

The delete confirmation modal shows:
- ✅ **Warning message**: "This action cannot be undone"
- ✅ **Session details**: Patient name, visit purpose, status, session ID
- ✅ **Cancel button**: To abort the deletion
- ✅ **Delete button**: With loading state during deletion

## 🎨 **UI Features**

### **Delete Button Styling**
```css
text-red-600 dark:text-red-400 
hover:text-red-900 dark:hover:text-red-300 
hover:bg-red-50 dark:hover:bg-red-900/20
```

### **Loading States**
- **Button disabled** during deletion
- **Loading spinner** shows progress
- **Success/error alerts** provide feedback

## 🧪 **Testing the Delete Functionality**

### **1. Create a Test Session**
1. Go to visit sessions page
2. Click "Create Visit Session"
3. Fill in required fields
4. Create the session

### **2. Delete the Session**
1. Find the newly created session (should be in RECEPTION stage)
2. Click the trash icon
3. Confirm deletion in the modal
4. Verify session is removed from the list

### **3. Verify Restrictions**
- ✅ **Other stages**: Delete button not visible for non-RECEPTION stages
- ✅ **Different roles**: Test with different user roles
- ✅ **Non-existent sessions**: Try deleting already deleted session

## 🎉 **Summary**

The delete functionality is **fully implemented and working** with:
- ✅ **Backend API endpoint** with proper security
- ✅ **Frontend UI** with confirmation modal
- ✅ **Role-based permissions** and stage restrictions
- ✅ **Error handling** and user feedback
- ✅ **Real-time list updates** after deletion

**No additional implementation needed** - the delete functionality is ready to use!
