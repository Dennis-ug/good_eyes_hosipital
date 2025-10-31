package com.rossumtechsystems.eyesante_backend.controller;

import com.rossumtechsystems.eyesante_backend.dto.ChangePasswordRequest;
import com.rossumtechsystems.eyesante_backend.dto.ChangePasswordResponse;
import com.rossumtechsystems.eyesante_backend.dto.CreateUserRequest;
import com.rossumtechsystems.eyesante_backend.dto.JwtAuthResponse;
import com.rossumtechsystems.eyesante_backend.dto.LoginRequest;
import com.rossumtechsystems.eyesante_backend.dto.RefreshTokenRequest;
import com.rossumtechsystems.eyesante_backend.dto.UserCreationResponse;
import com.rossumtechsystems.eyesante_backend.dto.PasswordResetTokenRequest;
import java.util.Map;
import com.rossumtechsystems.eyesante_backend.service.AuthService;
import com.rossumtechsystems.eyesante_backend.service.PasswordResetService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthService authService;
    
    @Autowired
    private PasswordResetService passwordResetService;

    @PostMapping("/login")
    public ResponseEntity<JwtAuthResponse> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        JwtAuthResponse response = authService.authenticateUser(loginRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/create-user")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<UserCreationResponse> createUser(@Valid @RequestBody CreateUserRequest createUserRequest) {
        UserCreationResponse response = authService.createUser(createUserRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<JwtAuthResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest refreshTokenRequest) {
        JwtAuthResponse response = authService.refreshToken(refreshTokenRequest.getRefreshToken());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/change-password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ChangePasswordResponse> changePassword(@Valid @RequestBody ChangePasswordRequest changePasswordRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        ChangePasswordResponse response = authService.changePassword(username, changePasswordRequest);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Authentication service is working");
    }

    @GetMapping("/debug-auth")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> debugAuth() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        StringBuilder debug = new StringBuilder();
        debug.append("Username: ").append(authentication.getName()).append("\n");
        debug.append("Authorities: ").append(authentication.getAuthorities()).append("\n");
        debug.append("Principal: ").append(authentication.getPrincipal()).append("\n");
        debug.append("Credentials: ").append(authentication.getCredentials()).append("\n");
        debug.append("Details: ").append(authentication.getDetails()).append("\n");
        return ResponseEntity.ok(debug.toString());
    }
    
    @PostMapping("/setup-password")
    public ResponseEntity<Map<String, String>> setupPassword(@Valid @RequestBody PasswordResetTokenRequest request) {
        boolean success = passwordResetService.setupPasswordWithToken(request.getResetToken(), request.getNewPassword());
        
        if (success) {
            return ResponseEntity.ok(Map.of("message", "Password setup successful"));
        } else {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid or expired setup token"));
        }
    }
    
    @GetMapping("/validate-setup-token")
    public ResponseEntity<Map<String, String>> validateSetupToken(@RequestParam String token) {
        boolean isValid = passwordResetService.validateResetToken(token);
        
        if (isValid) {
            return ResponseEntity.ok(Map.of("valid", "true", "message", "Setup token is valid"));
        } else {
            return ResponseEntity.ok(Map.of("valid", "false", "message", "Invalid or expired setup token"));
        }
    }
} 