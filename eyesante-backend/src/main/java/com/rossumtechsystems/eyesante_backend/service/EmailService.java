package com.rossumtechsystems.eyesante_backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDate;
import java.time.LocalTime;

@Service
public class EmailService {
    
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    
    @Autowired
    private JavaMailSender mailSender;
    
    @Value("${spring.mail.from:noreply@rossumtechsystems.com}")
    private String fromEmail;

    public void sendWelcomeEmail(String to, String username, String temporaryPassword, String customMessage) {
        try {
            logger.info("Attempting to send welcome email to: {}", to);
            
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject("Welcome to Eyesante Eye Clinic Management System");
            
            String emailContent = String.format(
                "Dear %s,\n\n" +
                "Welcome to the Eyesante Eye Clinic Management System!\n\n" +
                "Your account has been created successfully.\n" +
                "Username: %s\n" +
                "Temporary Password: %s\n\n" +
                "Please change your password on your first login.\n\n" +
                "%s\n\n" +
                "Best regards,\n" +
                "Eyesante Eye Clinic Team",
                username, username, temporaryPassword, 
                customMessage != null ? customMessage : ""
            );
            
            message.setText(emailContent);
            mailSender.send(message);
            logger.info("Welcome email sent successfully to: {}", to);
        } catch (Exception e) {
            logger.error("Failed to send welcome email to {}: {}", to, e.getMessage(), e);
            throw new RuntimeException("Failed to send welcome email: " + e.getMessage(), e);
        }
    }

    public void sendAdminConfirmationEmail(String adminEmail, String createdUsername, String createdEmail, String roles, String department) {
        try {
            logger.info("Attempting to send admin confirmation email to: {}", adminEmail);
            
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(adminEmail);
            message.setSubject("User Creation Confirmation - Eyesante Eye Clinic");
            
            String emailContent = String.format(
                "Dear Administrator,\n\n" +
                "A new user has been successfully created in the Eyesante Eye Clinic Management System.\n\n" +
                "User Details:\n" +
                "Username: %s\n" +
                "Email: %s\n" +
                "Roles: %s\n" +
                "Department: %s\n\n" +
                "The user has been notified via email with their login credentials.\n\n" +
                "Best regards,\n" +
                "Eyesante Eye Clinic System",
                createdUsername, createdEmail, roles, department
            );
            
            message.setText(emailContent);
            mailSender.send(message);
            logger.info("Admin confirmation email sent successfully to: {}", adminEmail);
        } catch (Exception e) {
            logger.error("Failed to send admin confirmation email to {}: {}", adminEmail, e.getMessage(), e);
            throw new RuntimeException("Failed to send admin confirmation email: " + e.getMessage(), e);
        }
    }

    public void sendAppointmentConfirmation(String patientEmail, String patientName, String doctorName, 
                                         LocalDate appointmentDate, LocalTime appointmentTime, String appointmentType) {
        try {
            logger.info("Attempting to send appointment confirmation email to: {}", patientEmail);
            
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(patientEmail);
            message.setSubject("Appointment Confirmation - Eyesante Eye Clinic");
            
            String emailContent = String.format(
                "Dear %s,\n\n" +
                "Your appointment has been successfully scheduled at Eyesante Eye Clinic.\n\n" +
                "Appointment Details:\n" +
                "Doctor: %s\n" +
                "Date: %s\n" +
                "Time: %s\n" +
                "Type: %s\n\n" +
                "Please arrive 10 minutes before your scheduled time.\n" +
                "If you need to reschedule or cancel, please contact us at least 24 hours in advance.\n\n" +
                "Best regards,\n" +
                "Eyesante Eye Clinic Team",
                patientName, doctorName, appointmentDate, appointmentTime, appointmentType
            );
            
            message.setText(emailContent);
            mailSender.send(message);
            logger.info("Appointment confirmation email sent successfully to: {}", patientEmail);
        } catch (Exception e) {
            logger.error("Failed to send appointment confirmation email to {}: {}", patientEmail, e.getMessage(), e);
            throw new RuntimeException("Failed to send appointment confirmation email: " + e.getMessage(), e);
        }
    }

    public void sendAppointmentReminder(String patientEmail, String patientName, String doctorName, 
                                      LocalDate appointmentDate, LocalTime appointmentTime) {
        try {
            logger.info("Attempting to send appointment reminder email to: {}", patientEmail);
            
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(patientEmail);
            message.setSubject("Appointment Reminder - Eyesante Eye Clinic");
            
            String emailContent = String.format(
                "Dear %s,\n\n" +
                "This is a friendly reminder of your upcoming appointment at Eyesante Eye Clinic.\n\n" +
                "Appointment Details:\n" +
                "Doctor: %s\n" +
                "Date: %s\n" +
                "Time: %s\n\n" +
                "Please arrive 10 minutes before your scheduled time.\n" +
                "If you need to reschedule or cancel, please contact us immediately.\n\n" +
                "Best regards,\n" +
                "Eyesante Eye Clinic Team",
                patientName, doctorName, appointmentDate, appointmentTime
            );
            
            message.setText(emailContent);
            mailSender.send(message);
            logger.info("Appointment reminder email sent successfully to: {}", patientEmail);
        } catch (Exception e) {
            logger.error("Failed to send appointment reminder email to {}: {}", patientEmail, e.getMessage(), e);
            throw new RuntimeException("Failed to send appointment reminder email: " + e.getMessage(), e);
        }
    }
    
    public void sendPasswordResetEmail(String email, String username, String resetToken) {
        try {
            logger.info("Attempting to send password reset email to: {}", email);
            
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(email);
            message.setSubject("Password Reset Request - Eyesante Eye Clinic");
            
            String resetLink = "https://isante-demo.rossumtechsystems.com/reset-password?token=" + resetToken;
            
            String emailContent = String.format(
                "Dear %s,\n\n" +
                "You have requested to reset your password for the Eyesante Eye Clinic Management System.\n\n" +
                "To reset your password, please click on the following link:\n" +
                "%s\n\n" +
                "This link will expire in 24 hours for security reasons.\n\n" +
                "If you did not request this password reset, please ignore this email.\n" +
                "Your password will remain unchanged.\n\n" +
                "For security reasons, please do not share this link with anyone.\n\n" +
                "Best regards,\n" +
                "Eyesante Eye Clinic Team",
                username, resetLink
            );
            
            message.setText(emailContent);
            mailSender.send(message);
            logger.info("Password reset email sent successfully to: {}", email);
        } catch (Exception e) {
            logger.error("Failed to send password reset email to {}: {}", email, e.getMessage(), e);
            throw new RuntimeException("Failed to send password reset email: " + e.getMessage(), e);
        }
    }
    
    public void sendPasswordResetConfirmationEmail(String email, String username) {
        try {
            logger.info("Attempting to send password reset confirmation email to: {}", email);
            
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(email);
            message.setSubject("Password Reset Successful - Eyesante Eye Clinic");
            
            String emailContent = String.format(
                "Dear %s,\n\n" +
                "Your password has been successfully reset for the Eyesante Eye Clinic Management System.\n\n" +
                "You can now log in to your account using your new password.\n\n" +
                "If you did not perform this action, please contact the system administrator immediately.\n\n" +
                "Best regards,\n" +
                "Eyesante Eye Clinic Team",
                username
            );
            
            message.setText(emailContent);
            mailSender.send(message);
            logger.info("Password reset confirmation email sent successfully to: {}", email);
        } catch (Exception e) {
            logger.error("Failed to send password reset confirmation email to {}: {}", email, e.getMessage(), e);
            throw new RuntimeException("Failed to send password reset confirmation email: " + e.getMessage(), e);
        }
    }
    
    public void sendTemporaryPasswordEmail(String email, String username, String temporaryPassword) {
        try {
            logger.info("Attempting to send temporary password email to: {}", email);
            
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(email);
            message.setSubject("Temporary Password - Eyesante Eye Clinic");
            
            String emailContent = String.format(
                "Dear %s,\n\n" +
                "A temporary password has been generated for your account in the Eyesante Eye Clinic Management System.\n\n" +
                "Username: %s\n" +
                "Temporary Password: %s\n\n" +
                "Please log in with this temporary password and change it to a secure password of your choice.\n\n" +
                "For security reasons, this temporary password will expire once you change it.\n\n" +
                "Best regards,\n" +
                "Eyesante Eye Clinic Team",
                username, username, temporaryPassword
            );
            
            message.setText(emailContent);
            mailSender.send(message);
            logger.info("Temporary password email sent successfully to: {}", email);
        } catch (Exception e) {
            logger.error("Failed to send temporary password email to {}: {}", email, e.getMessage(), e);
            throw new RuntimeException("Failed to send temporary password email: " + e.getMessage(), e);
        }
    }
    
    public void sendPasswordChangeConfirmationEmail(String email, String username) {
        try {
            logger.info("Attempting to send password change confirmation email to: {}", email);
            
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(email);
            message.setSubject("Password Changed Successfully - Eyesante Eye Clinic");
            
            String emailContent = String.format(
                "Dear %s,\n\n" +
                "Your password has been successfully changed for the Eyesante Eye Clinic Management System.\n\n" +
                "If you did not perform this action, please contact the system administrator immediately.\n\n" +
                "Best regards,\n" +
                "Eyesante Eye Clinic Team",
                username
            );
            
            message.setText(emailContent);
            mailSender.send(message);
            logger.info("Password change confirmation email sent successfully to: {}", email);
        } catch (Exception e) {
            logger.error("Failed to send password change confirmation email to {}: {}", email, e.getMessage(), e);
            throw new RuntimeException("Failed to send password change confirmation email: " + e.getMessage(), e);
        }
    }
    
    public void sendPasswordSetupEmail(String email, String username, String setupToken) {
        try {
            logger.info("Attempting to send password setup email to: {}", email);
            
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(email);
            message.setSubject("Set Up Your Account Password - Eyesante Eye Clinic");
            
            String setupLink = "https://isante-demo.rossumtechsystems.com/setup-password?token=" + setupToken;
            
            String emailContent = String.format(
                "Dear %s,\n\n" +
                "Welcome to the Eyesante Eye Clinic Management System!\n\n" +
                "Your account has been created successfully. To complete your account setup, please set your password by clicking on the following link:\n\n" +
                "%s\n\n" +
                "This link will expire in 24 hours for security reasons.\n\n" +
                "Please choose a strong password that you will remember.\n\n" +
                "If you did not expect this email, please contact the system administrator immediately.\n\n" +
                "Best regards,\n" +
                "Eyesante Eye Clinic Team",
                username, setupLink
            );
            
                    message.setText(emailContent);
        mailSender.send(message);
        logger.info("Password setup email sent successfully to: {}", email);
    } catch (Exception e) {
        logger.error("Failed to send password setup email to {}: {}", email, e.getMessage(), e);
        throw new RuntimeException("Failed to send password setup email: " + e.getMessage(), e);
    }
}

public void sendUserInvitationEmail(String email, String firstName, String lastName, String invitationToken, String customMessage) {
    try {
        logger.info("Attempting to send user invitation email to: {}", email);
        
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(email);
        message.setSubject("You're Invited to Join Eyesante Eye Clinic Management System");
        
        String invitationLink = "https://isante-demo.rossumtechsystems.com/accept-invitation?token=" + invitationToken;
        
        String emailContent = String.format(
            "Dear %s %s,\n\n" +
            "You have been invited to join the Eyesante Eye Clinic Management System!\n\n" +
            "To complete your account setup, please click on the following link:\n" +
            "%s\n\n" +
            "This invitation link will expire in 24 hours for security reasons.\n\n" +
            "When you click the link, you will be able to:\n" +
            "• Set your username\n" +
            "• Create a secure password\n" +
            "• Complete your account setup\n\n" +
            "%s\n\n" +
            "If you did not expect this invitation, please ignore this email.\n\n" +
            "Best regards,\n" +
            "Eyesante Eye Clinic Team",
            firstName, lastName, invitationLink, 
            customMessage != null && !customMessage.trim().isEmpty() ? customMessage : ""
        );
        
        message.setText(emailContent);
        mailSender.send(message);
        logger.info("User invitation email sent successfully to: {}", email);
    } catch (Exception e) {
        logger.error("Failed to send user invitation email to {}: {}", email, e.getMessage(), e);
        throw new RuntimeException("Failed to send user invitation email: " + e.getMessage(), e);
    }
}
} 