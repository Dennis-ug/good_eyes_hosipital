package com.rossumtechsystems.eyesante_backend.service;

import com.rossumtechsystems.eyesante_backend.entity.User;
import com.rossumtechsystems.eyesante_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@Transactional
@Slf4j
public class PasswordResetService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private EmailService emailService;
    
    private static final int RESET_TOKEN_LENGTH = 32;
    private static final int RESET_TOKEN_EXPIRY_HOURS = 24;
    
    /**
     * Generate a secure random reset token
     */
    private String generateResetToken() {
        SecureRandom random = new SecureRandom();
        StringBuilder token = new StringBuilder(RESET_TOKEN_LENGTH);
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        
        for (int i = 0; i < RESET_TOKEN_LENGTH; i++) {
            token.append(chars.charAt(random.nextInt(chars.length())));
        }
        
        return token.toString();
    }
    
    /**
     * Generate a secure temporary password
     */
    private String generateTemporaryPassword() {
        SecureRandom random = new SecureRandom();
        StringBuilder password = new StringBuilder(12);
        
        // Ensure at least one of each required character type
        String lowercase = "abcdefghijklmnopqrstuvwxyz";
        String uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        String digits = "0123456789";
        String special = "@$!%*?&";
        
        password.append(lowercase.charAt(random.nextInt(lowercase.length())));
        password.append(uppercase.charAt(random.nextInt(uppercase.length())));
        password.append(digits.charAt(random.nextInt(digits.length())));
        password.append(special.charAt(random.nextInt(special.length())));
        
        // Fill the rest with random characters
        String allChars = lowercase + uppercase + digits + special;
        for (int i = 4; i < 12; i++) {
            password.append(allChars.charAt(random.nextInt(allChars.length())));
        }
        
        // Shuffle the password
        char[] passwordArray = password.toString().toCharArray();
        for (int i = passwordArray.length - 1; i > 0; i--) {
            int j = random.nextInt(i + 1);
            char temp = passwordArray[i];
            passwordArray[i] = passwordArray[j];
            passwordArray[j] = temp;
        }
        
        return new String(passwordArray);
    }
    
    /**
     * Initiate password reset process
     */
    public boolean initiatePasswordReset(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        
        if (userOpt.isEmpty()) {
            // Don't reveal if email exists or not for security
            return true;
        }
        
        User user = userOpt.get();
        
        // Generate reset token
        String resetToken = generateResetToken();
        LocalDateTime tokenExpiry = LocalDateTime.now().plusHours(RESET_TOKEN_EXPIRY_HOURS);
        
        // Update user with reset token
        user.setResetToken(resetToken);
        user.setResetTokenExpiry(tokenExpiry);
        userRepository.save(user);
        
        // Send password reset email (best-effort; do not fail the request if email sending fails)
        try {
            emailService.sendPasswordResetEmail(user.getEmail(), user.getUsername(), resetToken);
        } catch (Exception ex) {
            log.error("Failed to send password reset email to {}: {}", user.getEmail(), ex.getMessage(), ex);
            // Intentionally do not propagate to avoid leaking user existence and causing 500 to client
        }
        
        return true;
    }
    
    /**
     * Reset password using reset token
     */
    public boolean resetPasswordWithToken(String resetToken, String newPassword) {
        Optional<User> userOpt = userRepository.findByResetToken(resetToken);
        
        if (userOpt.isEmpty()) {
            return false;
        }
        
        User user = userOpt.get();
        
        // Check if token is expired
        if (user.getResetTokenExpiry() == null || 
            LocalDateTime.now().isAfter(user.getResetTokenExpiry())) {
            return false;
        }
        
        // Update password and clear reset token
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        user.setPasswordChangeRequired(false);
        userRepository.save(user);
        
        // Send confirmation email
        emailService.sendPasswordResetConfirmationEmail(user.getEmail(), user.getUsername());
        
        return true;
    }
    
    /**
     * Generate and send temporary password
     */
    public boolean generateTemporaryPassword(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        
        if (userOpt.isEmpty()) {
            return false;
        }
        
        User user = userOpt.get();
        
        // Generate temporary password
        String temporaryPassword = generateTemporaryPassword();
        
        // Update user password
        user.setPassword(passwordEncoder.encode(temporaryPassword));
        user.setPasswordChangeRequired(true);
        userRepository.save(user);
        
        // Send temporary password email
        emailService.sendTemporaryPasswordEmail(user.getEmail(), user.getUsername(), temporaryPassword);
        
        return true;
    }
    
    /**
     * Change password for authenticated user
     */
    public boolean changePassword(String username, String currentPassword, String newPassword) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        
        if (userOpt.isEmpty()) {
            return false;
        }
        
        User user = userOpt.get();
        
        // Verify current password
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            return false;
        }
        
        // Update password
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setPasswordChangeRequired(false);
        userRepository.save(user);
        
        // Send password change confirmation email
        emailService.sendPasswordChangeConfirmationEmail(user.getEmail(), user.getUsername());
        
        return true;
    }
    
    /**
     * Validate reset token
     */
    public boolean validateResetToken(String resetToken) {
        Optional<User> userOpt = userRepository.findByResetToken(resetToken);
        
        if (userOpt.isEmpty()) {
            return false;
        }
        
        User user = userOpt.get();
        
        // Check if token is expired
        if (user.getResetTokenExpiry() == null || 
            LocalDateTime.now().isAfter(user.getResetTokenExpiry())) {
            return false;
        }
        
        return true;
    }
    
    /**
     * Generate and send password setup link for new user
     */
    public boolean generatePasswordSetupLink(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        
        if (userOpt.isEmpty()) {
            return false;
        }
        
        User user = userOpt.get();
        
        // Generate setup token
        String setupToken = generateResetToken();
        LocalDateTime tokenExpiry = LocalDateTime.now().plusHours(RESET_TOKEN_EXPIRY_HOURS);
        
        // Update user with setup token
        user.setResetToken(setupToken);
        user.setResetTokenExpiry(tokenExpiry);
        user.setPasswordChangeRequired(true);
        userRepository.save(user);
        
        // Send password setup email
        try {
            emailService.sendPasswordSetupEmail(user.getEmail(), user.getUsername(), setupToken);
            return true;
        } catch (Exception ex) {
            log.error("Failed to send password setup email to {}: {}", user.getEmail(), ex.getMessage(), ex);
            return false;
        }
    }
    
    /**
     * Setup password using setup token (for new users)
     */
    public boolean setupPasswordWithToken(String setupToken, String newPassword) {
        Optional<User> userOpt = userRepository.findByResetToken(setupToken);
        
        if (userOpt.isEmpty()) {
            return false;
        }
        
        User user = userOpt.get();
        
        // Check if token is expired
        if (user.getResetTokenExpiry() == null || 
            LocalDateTime.now().isAfter(user.getResetTokenExpiry())) {
            return false;
        }
        
        // Update password and clear setup token
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        user.setPasswordChangeRequired(false);
        userRepository.save(user);
        
        // Send confirmation email
        emailService.sendPasswordChangeConfirmationEmail(user.getEmail(), user.getUsername());
        
        return true;
    }
}
