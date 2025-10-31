package com.rossumtechsystems.eyesante_backend.controller;

import com.rossumtechsystems.eyesante_backend.dto.PasswordResetRequest;
import com.rossumtechsystems.eyesante_backend.dto.PasswordResetTokenRequest;
import com.rossumtechsystems.eyesante_backend.service.PasswordResetService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {
    "https://isante-demo.rossumtechsystems.com",
    "http://localhost:3000",
    "http://localhost:3001"
})
public class PasswordResetController {
    
    @Autowired
    private PasswordResetService passwordResetService;
    
    /**
     * Initiate password reset process
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@Valid @RequestBody PasswordResetRequest request) {
        try {
            boolean success = passwordResetService.initiatePasswordReset(request.getEmail());
            
            Map<String, String> response = new HashMap<>();
            if (success) {
                response.put("message", "If an account with this email exists, a password reset link has been sent.");
                return ResponseEntity.ok(response);
            } else {
                response.put("message", "Failed to process password reset request.");
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "An error occurred while processing your request.");
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    /**
     * Reset password using reset token
     */
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody PasswordResetTokenRequest request) {
        try {
            // Validate passwords match
            if (!request.getNewPassword().equals(request.getConfirmPassword())) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "New password and confirm password do not match.");
                return ResponseEntity.badRequest().body(response);
            }
            
            boolean success = passwordResetService.resetPasswordWithToken(request.getResetToken(), request.getNewPassword());
            
            Map<String, String> response = new HashMap<>();
            if (success) {
                response.put("message", "Password has been successfully reset. You can now log in with your new password.");
                return ResponseEntity.ok(response);
            } else {
                response.put("message", "Invalid or expired reset token.");
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "An error occurred while resetting your password.");
            return ResponseEntity.internalServerError().body(response);
        }
    }
    

    
    /**
     * Generate temporary password (admin only)
     */
    @PostMapping("/generate-temporary-password")
    public ResponseEntity<Map<String, String>> generateTemporaryPassword(@Valid @RequestBody PasswordResetRequest request) {
        try {
            boolean success = passwordResetService.generateTemporaryPassword(request.getEmail());
            
            Map<String, String> response = new HashMap<>();
            if (success) {
                response.put("message", "Temporary password has been generated and sent to the user's email.");
                return ResponseEntity.ok(response);
            } else {
                response.put("message", "User not found with the provided email address.");
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "An error occurred while generating temporary password.");
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    /**
     * Validate reset token
     */
    @GetMapping("/validate-reset-token")
    public ResponseEntity<Map<String, String>> validateResetToken(@RequestParam String token) {
        try {
            boolean isValid = passwordResetService.validateResetToken(token);
            
            Map<String, String> response = new HashMap<>();
            if (isValid) {
                response.put("valid", "true");
                response.put("message", "Reset token is valid.");
                return ResponseEntity.ok(response);
            } else {
                response.put("valid", "false");
                response.put("message", "Invalid or expired reset token.");
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("valid", "false");
            response.put("message", "An error occurred while validating the reset token.");
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
