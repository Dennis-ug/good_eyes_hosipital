package com.rossumtechsystems.eyesante_backend.service;

import com.rossumtechsystems.eyesante_backend.dto.ChangePasswordRequest;
import com.rossumtechsystems.eyesante_backend.dto.ChangePasswordResponse;
import com.rossumtechsystems.eyesante_backend.dto.CreateUserRequest;
import com.rossumtechsystems.eyesante_backend.dto.JwtAuthResponse;
import com.rossumtechsystems.eyesante_backend.dto.LoginRequest;
import com.rossumtechsystems.eyesante_backend.dto.UserCreationResponse;
import com.rossumtechsystems.eyesante_backend.entity.Department;
import com.rossumtechsystems.eyesante_backend.entity.Role;
import com.rossumtechsystems.eyesante_backend.entity.User;
import com.rossumtechsystems.eyesante_backend.repository.DepartmentRepository;
import com.rossumtechsystems.eyesante_backend.repository.RoleRepository;
import com.rossumtechsystems.eyesante_backend.repository.UserRepository;
import com.rossumtechsystems.eyesante_backend.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private EmailService emailService;

    @Autowired
    private DepartmentRepository departmentRepository;
    
    @Autowired
    private PasswordResetService passwordResetService;
        

    public JwtAuthResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        
        User user = userRepository.findByUsername(loginRequest.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        JwtTokenProvider.TokenInfo accessTokenInfo = tokenProvider.generateAccessToken(authentication);
        JwtTokenProvider.TokenInfo refreshTokenInfo = tokenProvider.generateRefreshToken(authentication);

        // Extract user roles
        Set<String> userRoles = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toSet());

        JwtAuthResponse response = new JwtAuthResponse(
                accessTokenInfo.getToken(), 
                refreshTokenInfo.getToken(), 
                "Bearer", 
                user.getUsername(), 
                user.getEmail(), 
                user.getFirstName(), 
                user.getLastName(), 
                user.isPasswordChangeRequired(),
                userRoles
        );
        
        response.setAccessTokenExpiresAt(accessTokenInfo.getExpiresAt());
        response.setRefreshTokenExpiresAt(refreshTokenInfo.getExpiresAt());
        
        return response;
    }

    public UserCreationResponse createUser(CreateUserRequest createUserRequest) {
        // Check if current user is a super admin
        Authentication currentAuth = SecurityContextHolder.getContext().getAuthentication();
        if (currentAuth == null || !currentAuth.isAuthenticated() || 
            currentAuth.getAuthorities().stream()
                .noneMatch(authority -> authority.getAuthority().equals("ROLE_SUPER_ADMIN"))) {
            throw new AccessDeniedException("Only SUPER_ADMIN users can create new users");
        }

        if (userRepository.existsByUsername(createUserRequest.getUsername())) {
            throw new RuntimeException("Username is already taken!");
        }

        if (userRepository.existsByEmail(createUserRequest.getEmail())) {
            throw new RuntimeException("Email is already registered!");
        }

        User user = new User();
        user.setUsername(createUserRequest.getUsername());
        user.setEmail(createUserRequest.getEmail());
        
        // Set password if provided, otherwise generate a temporary password for initial setup
        String password = createUserRequest.getPassword();
        if (password == null || password.trim().isEmpty()) {
            // Generate a temporary password that will be replaced when user sets up their account
            password = generateTemporaryPassword();
            user.setPasswordChangeRequired(true);
        } else {
            user.setPasswordChangeRequired(false);
        }
        
        user.setPassword(passwordEncoder.encode(password));
        user.setFirstName(createUserRequest.getFirstName());
        user.setLastName(createUserRequest.getLastName());
        
        // Assign roles if specified
        Set<Role> userRoles = new HashSet<>();
        if (createUserRequest.getRoles() != null && !createUserRequest.getRoles().isEmpty()) {
            for (String roleName : createUserRequest.getRoles()) {
                Role role = roleRepository.findByName(roleName)
                        .orElseThrow(() -> new RuntimeException("Role not found: " + roleName));
                userRoles.add(role);
            }
        } else {
            // Default to USER role if no roles specified
            Role userRole = roleRepository.findByName("USER")
                    .orElseGet(() -> createDefaultUserRole());
            userRoles.add(userRole);
        }
        user.setRoles(userRoles);

        // Assign department if specified
        if (createUserRequest.getDepartmentId() != null) {
            Department department = departmentRepository.findById(createUserRequest.getDepartmentId())
                    .orElseThrow(() -> new RuntimeException("Department not found"));
            user.setDepartment(department);
        }

        User savedUser = userRepository.save(user);

        // Send email notifications
        boolean emailSent = false;
        String emailStatus = "Not sent";
        
        try {
            if (createUserRequest.isSendEmailNotification()) {
                // Send password setup link instead of temporary password
                boolean setupLinkSent = passwordResetService.generatePasswordSetupLink(savedUser.getEmail());
                if (setupLinkSent) {
                    emailSent = true;
                    emailStatus = "Password setup link sent successfully";
                } else {
                    emailStatus = "Failed to send password setup link";
                }
            }
        } catch (Exception e) {
            emailStatus = "Failed to send: " + e.getMessage();
        }

        // Send confirmation email to admin
        try {
            String adminEmail = currentAuth.getName() + "@eyesante.com"; // You might want to get actual admin email
            String rolesString = userRoles.stream().map(Role::getName).collect(Collectors.joining(", "));
            String departmentName = user.getDepartment() != null ? user.getDepartment().getName() : "Not assigned";
            
            emailService.sendAdminConfirmationEmail(
                adminEmail,
                savedUser.getUsername(),
                savedUser.getEmail(),
                rolesString,
                departmentName
            );
        } catch (Exception e) {
            // Log admin email failure but don't fail the user creation
            System.err.println("Failed to send admin confirmation email: " + e.getMessage());
        }

        // Create response
        UserCreationResponse response = new UserCreationResponse();
        response.setMessage("User created successfully. Password setup link sent to user's email.");
        response.setUsername(savedUser.getUsername());
        response.setEmail(savedUser.getEmail());
        response.setTemporaryPassword(null); // No temporary password shown, user will set their own
        response.setEmailSent(emailSent);
        response.setEmailStatus(emailStatus);
        response.setAssignedRoles(userRoles.stream().map(Role::getName).collect(Collectors.toSet()));
        response.setDepartmentName(user.getDepartment() != null ? user.getDepartment().getName() : "Not assigned");

        return response;
    }

    public JwtAuthResponse refreshToken(String refreshToken) {
        try {
            if (!tokenProvider.validateRefreshToken(refreshToken)) {
                throw new RuntimeException("Invalid refresh token");
            }

            String username = tokenProvider.getUsernameFromJWT(refreshToken);
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Create authentication object
            Authentication authentication = new UsernamePasswordAuthenticationToken(
                    user.getUsername(), null, user.getAuthorities());

            JwtTokenProvider.TokenInfo accessTokenInfo = tokenProvider.generateAccessToken(authentication);
            JwtTokenProvider.TokenInfo refreshTokenInfo = tokenProvider.generateRefreshToken(authentication);

            // Extract user roles
            Set<String> userRoles = user.getRoles().stream()
                    .map(Role::getName)
                    .collect(Collectors.toSet());

            JwtAuthResponse response = new JwtAuthResponse(
                    accessTokenInfo.getToken(), 
                    refreshTokenInfo.getToken(), 
                    "Bearer", 
                    user.getUsername(), 
                    user.getEmail(), 
                    user.getFirstName(), 
                    user.getLastName(), 
                    user.isPasswordChangeRequired(),
                    userRoles
            );
            
            response.setAccessTokenExpiresAt(accessTokenInfo.getExpiresAt());
            response.setRefreshTokenExpiresAt(refreshTokenInfo.getExpiresAt());
            
            return response;
        } catch (io.jsonwebtoken.ExpiredJwtException ex) {
            throw new RuntimeException("Refresh token has expired. Please login again.");
        } catch (io.jsonwebtoken.MalformedJwtException ex) {
            throw new RuntimeException("Invalid refresh token format.");
        } catch (io.jsonwebtoken.UnsupportedJwtException ex) {
            throw new RuntimeException("Unsupported refresh token format.");
        } catch (io.jsonwebtoken.security.SignatureException ex) {
            throw new RuntimeException("Invalid refresh token signature.");
        } catch (IllegalArgumentException ex) {
            throw new RuntimeException("Invalid refresh token.");
        } catch (RuntimeException ex) {
            // Re-throw existing RuntimeException
            throw ex;
        } catch (Exception ex) {
            throw new RuntimeException("Error processing refresh token: " + ex.getMessage());
        }
    }

    public ChangePasswordResponse changePassword(String username, ChangePasswordRequest changePasswordRequest) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Verify current password
        if (!passwordEncoder.matches(changePasswordRequest.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        // Verify new password matches confirmation
        if (!changePasswordRequest.getNewPassword().equals(changePasswordRequest.getConfirmPassword())) {
            throw new RuntimeException("New password and confirmation password do not match");
        }

        // Update password and mark as changed
        user.setPassword(passwordEncoder.encode(changePasswordRequest.getNewPassword()));
        user.setPasswordChangeRequired(false);
        User savedUser = userRepository.save(user);

        // Create response
        return new ChangePasswordResponse(
            "Password changed successfully",
            savedUser.getUsername(),
            savedUser.isPasswordChangeRequired(),
            LocalDateTime.now(),
            "SUCCESS"
        );
    }

    private String generateTemporaryPassword() {
        // Generate a random 8-character temporary password
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 8; i++) {
            sb.append(chars.charAt((int) (Math.random() * chars.length())));
        }
        return sb.toString();
    }

    private Role createDefaultUserRole() {
        Role userRole = new Role();
        userRole.setName("USER");
        userRole.setDescription("Default user role");
        userRole.setEnabled(true);
        return roleRepository.save(userRole);
    }

    // Temporarily disabled CommandLineRunner to avoid transaction issues
    // @Override
    // public void run(String... args) throws Exception {
    //     // Initialize default roles and super admin user
    //     initializeDefaultRoles();
    //     initializeSuperAdmin();
    // }

} 