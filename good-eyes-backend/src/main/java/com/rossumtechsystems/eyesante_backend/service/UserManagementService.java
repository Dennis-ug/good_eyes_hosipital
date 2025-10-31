package com.rossumtechsystems.eyesante_backend.service;

import com.rossumtechsystems.eyesante_backend.dto.AssignDepartmentRequest;
import com.rossumtechsystems.eyesante_backend.dto.CreateUserRequest;
import com.rossumtechsystems.eyesante_backend.dto.UpdateUserRequest;
import com.rossumtechsystems.eyesante_backend.dto.UserDto;
import com.rossumtechsystems.eyesante_backend.dto.RoleDto;
import com.rossumtechsystems.eyesante_backend.dto.UserCreationResponse;
import com.rossumtechsystems.eyesante_backend.entity.Department;
import com.rossumtechsystems.eyesante_backend.entity.User;
import com.rossumtechsystems.eyesante_backend.entity.Role;
import com.rossumtechsystems.eyesante_backend.repository.DepartmentRepository;
import com.rossumtechsystems.eyesante_backend.repository.UserRepository;
import com.rossumtechsystems.eyesante_backend.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserManagementService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    public void assignDepartmentToUser(AssignDepartmentRequest request) {
        // Check if current user is a super admin
        Authentication currentAuth = SecurityContextHolder.getContext().getAuthentication();
        if (currentAuth == null || !currentAuth.isAuthenticated() ||
            currentAuth.getAuthorities().stream()
                .noneMatch(authority -> authority.getAuthority().equals("ROLE_SUPER_ADMIN"))) {
            throw new AccessDeniedException("Only SUPER_ADMIN users can assign departments");
        }

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new RuntimeException("Department not found"));

        user.setDepartment(department);
        userRepository.save(user);
    }

    public Page<UserDto> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable)
                .map(user -> {
                    Set<RoleDto> roleDtos = user.getRoles().stream()
                            .map(role -> {
                                RoleDto roleDto = new RoleDto();
                                roleDto.setId(role.getId());
                                roleDto.setName(role.getName());
                                roleDto.setDescription(role.getDescription());
                                roleDto.setEnabled(role.isEnabled());
                                roleDto.setPermissionIds(role.getPermissions().stream()
                                        .map(permission -> permission.getId())
                                        .collect(java.util.stream.Collectors.toSet()));
                                return roleDto;
                            })
                            .collect(java.util.stream.Collectors.toSet());
                    
                    return new UserDto(
                            user.getId(),
                            user.getUsername(),
                            user.getEmail(),
                            user.getDepartment() != null ? user.getDepartment().getName() : null,
                            roleDtos,
                            user.getCreatedAt(),
                            user.getUpdatedAt(),
                            user.getCreatedBy(),
                            user.getUpdatedBy()
                    );
                });
    }

    public Page<UserDto> searchUsers(String search, String roleName, String status, Pageable pageable) {
        return userRepository.searchUsers(search, roleName, status, pageable)
                .map(user -> {
                    Set<RoleDto> roleDtos = user.getRoles().stream()
                            .map(role -> {
                                RoleDto roleDto = new RoleDto();
                                roleDto.setId(role.getId());
                                roleDto.setName(role.getName());
                                roleDto.setDescription(role.getDescription());
                                roleDto.setEnabled(role.isEnabled());
                                roleDto.setPermissionIds(role.getPermissions().stream()
                                        .map(permission -> permission.getId())
                                        .collect(java.util.stream.Collectors.toSet()));
                                return roleDto;
                            })
                            .collect(java.util.stream.Collectors.toSet());
                    return new UserDto(
                            user.getId(),
                            user.getUsername(),
                            user.getEmail(),
                            user.getDepartment() != null ? user.getDepartment().getName() : null,
                            roleDtos,
                            user.getCreatedAt(),
                            user.getUpdatedAt(),
                            user.getCreatedBy(),
                            user.getUpdatedBy()
                    );
                });
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public Page<User> getUsersByDepartment(String departmentName, Pageable pageable) {
        return userRepository.findByDepartmentName(departmentName, pageable);
    }

    public UserCreationResponse createUser(CreateUserRequest request) {
        // Check if current user is a super admin
        Authentication currentAuth = SecurityContextHolder.getContext().getAuthentication();
        if (currentAuth == null || !currentAuth.isAuthenticated() ||
            currentAuth.getAuthorities().stream()
                .noneMatch(authority -> authority.getAuthority().equals("ROLE_SUPER_ADMIN"))) {
            throw new AccessDeniedException("Only SUPER_ADMIN users can create users");
        }

        // Check if username already exists
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEnabled(true);

        String temporaryPassword = null;
        boolean passwordChangeRequired = true; // Default to true for security

        // Set password if provided, otherwise generate a temporary password
        if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            // Still require password change for security
            passwordChangeRequired = true;
        } else {
            // Generate temporary password
            temporaryPassword = generateTemporaryPassword();
            user.setPassword(passwordEncoder.encode(temporaryPassword));
            passwordChangeRequired = true;
        }

        user.setPasswordChangeRequired(passwordChangeRequired);

        // Assign department if provided
        if (request.getDepartmentId() != null) {
            Department department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new RuntimeException("Department not found"));
            user.setDepartment(department);
        }

        // Assign roles if provided
        if (request.getRoles() != null && !request.getRoles().isEmpty()) {
            Set<Role> roles = request.getRoles().stream()
                    .map(roleName -> roleRepository.findByName(roleName)
                            .orElseThrow(() -> new RuntimeException("Role not found: " + roleName)))
                    .collect(Collectors.toSet());
            
            // Automatically add DOCTOR role if user has OPTOMETRIST or OPHTHALMOLOGIST role
            boolean hasDoctorRole = roles.stream()
                    .anyMatch(role -> "OPTOMETRIST".equals(role.getName()) || "OPHTHALMOLOGIST".equals(role.getName()));
            
            if (hasDoctorRole) {
                Role doctorRole = roleRepository.findByName("DOCTOR")
                        .orElseThrow(() -> new RuntimeException("DOCTOR role not found"));
                roles.add(doctorRole);
            }
            
            user.setRoles(roles);
        }

        User savedUser = userRepository.save(user);

        // Send email notification if requested
        boolean emailSent = false;
        String emailStatus = "Not sent";
        
        if (request.isSendEmailNotification()) {
            try {
                if (temporaryPassword != null) {
                    // Send welcome email with temporary password
                    emailService.sendWelcomeEmail(
                        savedUser.getEmail(), 
                        savedUser.getUsername(), 
                        temporaryPassword, 
                        request.getCustomMessage()
                    );
                }
                emailSent = true;
                emailStatus = "Sent successfully";
            } catch (Exception e) {
                emailStatus = "Failed to send: " + e.getMessage();
            }
        }

        // Prepare response
        UserCreationResponse response = new UserCreationResponse();
        response.setMessage("User created successfully");
        response.setUsername(savedUser.getUsername());
        response.setEmail(savedUser.getEmail());
        response.setTemporaryPassword(temporaryPassword);
        response.setEmailSent(emailSent);
        response.setEmailStatus(emailStatus);
        response.setAssignedRoles(savedUser.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toSet()));
        response.setDepartmentName(savedUser.getDepartment() != null ? savedUser.getDepartment().getName() : null);
        response.setCreatedAt(savedUser.getCreatedAt());
        response.setCreatedBy(savedUser.getCreatedBy());

        return response;
    }

    public void deleteUser(Long userId) {
        // Check if current user is a super admin
        Authentication currentAuth = SecurityContextHolder.getContext().getAuthentication();
        if (currentAuth == null || !currentAuth.isAuthenticated() ||
            currentAuth.getAuthorities().stream()
                .noneMatch(authority -> authority.getAuthority().equals("ROLE_SUPER_ADMIN"))) {
            throw new AccessDeniedException("Only SUPER_ADMIN users can delete users");
        }

        // Check if user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        // Prevent deletion of the current user
        String currentUsername = currentAuth.getName();
        if (user.getUsername().equals(currentUsername)) {
            throw new RuntimeException("Cannot delete your own account");
        }

        // Check if user is a super admin (optional: prevent deletion of other super admins)
        boolean isSuperAdmin = user.getRoles().stream()
                .anyMatch(role -> "SUPER_ADMIN".equals(role.getName()));
        
        if (isSuperAdmin) {
            throw new RuntimeException("Cannot delete super admin users");
        }

        // Delete the user (foreign key constraint violations will be handled by global exception handler)
        userRepository.deleteById(userId);
    }

    public void updateUserRoles(Long userId, java.util.Set<String> roleNames) {
        // Check if current user is a super admin
        Authentication currentAuth = SecurityContextHolder.getContext().getAuthentication();
        if (currentAuth == null || !currentAuth.isAuthenticated() ||
            currentAuth.getAuthorities().stream()
                .noneMatch(authority -> authority.getAuthority().equals("ROLE_SUPER_ADMIN"))) {
            throw new AccessDeniedException("Only SUPER_ADMIN users can update user roles");
        }

        // Check if user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        // Get roles by names
        Set<Role> roles = roleNames.stream()
                .map(roleName -> roleRepository.findByName(roleName)
                        .orElseThrow(() -> new RuntimeException("Role not found: " + roleName)))
                .collect(Collectors.toSet());

        // Automatically add DOCTOR role if user has OPTOMETRIST or OPHTHALMOLOGIST role
        boolean hasDoctorRole = roles.stream()
                .anyMatch(role -> "OPTOMETRIST".equals(role.getName()) || "OPHTHALMOLOGIST".equals(role.getName()));

        if (hasDoctorRole) {
            Role doctorRole = roleRepository.findByName("DOCTOR")
                    .orElseThrow(() -> new RuntimeException("DOCTOR role not found"));
            roles.add(doctorRole);
        }

        // Update user roles
        user.setRoles(roles);
        userRepository.save(user);
    }

    public User updateUser(Long userId, UpdateUserRequest request) {
        // Check if current user is a super admin
        Authentication currentAuth = SecurityContextHolder.getContext().getAuthentication();
        if (currentAuth == null || !currentAuth.isAuthenticated() ||
            currentAuth.getAuthorities().stream()
                .noneMatch(authority -> authority.getAuthority().equals("ROLE_SUPER_ADMIN"))) {
            throw new AccessDeniedException("Only SUPER_ADMIN users can update users");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getUsername() != null && !request.getUsername().isBlank()) {
            user.setUsername(request.getUsername());
        }
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            user.setEmail(request.getEmail());
        }
        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        if (request.getEnabled() != null) {
            user.setEnabled(Boolean.TRUE.equals(request.getEnabled()));
        }
        if (request.getDepartmentId() != null) {
            Department department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new RuntimeException("Department not found"));
            user.setDepartment(department);
        }

        return userRepository.save(user);
    }

    private String generateTemporaryPassword() {
        // Generate a random 8-character password
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 8; i++) {
            sb.append(chars.charAt((int) (Math.random() * chars.length())));
        }
        return sb.toString();
    }
} 