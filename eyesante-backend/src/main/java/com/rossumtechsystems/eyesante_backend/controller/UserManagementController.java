package com.rossumtechsystems.eyesante_backend.controller;

import com.rossumtechsystems.eyesante_backend.dto.AssignDepartmentRequest;
import com.rossumtechsystems.eyesante_backend.dto.CreateUserRequest;
import com.rossumtechsystems.eyesante_backend.dto.UserDto;
import com.rossumtechsystems.eyesante_backend.dto.UpdateUserRequest;
import com.rossumtechsystems.eyesante_backend.dto.UserCreationResponse;
import com.rossumtechsystems.eyesante_backend.entity.User;
import com.rossumtechsystems.eyesante_backend.service.UserManagementService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user-management")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class UserManagementController {

    @Autowired
    private UserManagementService userManagementService;

    @GetMapping("/users")
    public ResponseEntity<Page<UserDto>> getAllUsers(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "role", required = false) String role,
            @RequestParam(value = "status", required = false) String status,
            Pageable pageable) {
        if ((search != null && !search.isBlank()) ||
            (role != null && !role.isBlank()) ||
            (status != null && !status.isBlank())) {
            return ResponseEntity.ok(userManagementService.searchUsers(search, role, status, pageable));
        }
        return ResponseEntity.ok(userManagementService.getAllUsers(pageable));
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return userManagementService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/users/department/{departmentId}")
    public ResponseEntity<Page<User>> getUsersByDepartment(@PathVariable String departmentId, Pageable pageable) {
        Page<User> users = userManagementService.getUsersByDepartment(departmentId, pageable);
        return ResponseEntity.ok(users);
    }

    @PostMapping("/assign-department")
    public ResponseEntity<String> assignDepartmentToUser(@Valid @RequestBody AssignDepartmentRequest request) {
        userManagementService.assignDepartmentToUser(request);
        return ResponseEntity.ok("Department assigned successfully");
    }

    @PostMapping("/users")
    public ResponseEntity<UserCreationResponse> createUser(@Valid @RequestBody CreateUserRequest request) {
        UserCreationResponse response = userManagementService.createUser(request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userManagementService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody UpdateUserRequest request) {
        return ResponseEntity.ok(userManagementService.updateUser(id, request));
    }

    @PutMapping("/users/{id}/roles")
    public ResponseEntity<Void> updateUserRoles(@PathVariable Long id, @RequestBody java.util.Set<String> roleNames) {
        userManagementService.updateUserRoles(id, roleNames);
        return ResponseEntity.noContent().build();
    }
}