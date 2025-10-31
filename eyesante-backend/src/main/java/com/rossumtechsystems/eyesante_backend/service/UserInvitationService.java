package com.rossumtechsystems.eyesante_backend.service;

import com.rossumtechsystems.eyesante_backend.dto.InviteUserRequest;
import com.rossumtechsystems.eyesante_backend.dto.InviteUserResponse;
import com.rossumtechsystems.eyesante_backend.entity.Department;
import com.rossumtechsystems.eyesante_backend.entity.UserInvitation;
import com.rossumtechsystems.eyesante_backend.repository.DepartmentRepository;
import com.rossumtechsystems.eyesante_backend.repository.UserInvitationRepository;
import com.rossumtechsystems.eyesante_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class UserInvitationService {

    @Autowired
    private UserInvitationRepository invitationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private EmailService emailService;

    public InviteUserResponse sendInvitation(InviteUserRequest request) {
        // Check if user already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("A user with this email already exists");
        }

        // Check if there's already a pending invitation for this email
        if (invitationRepository.existsByEmailAndStatus(request.getEmail(), UserInvitation.InvitationStatus.PENDING)) {
            throw new RuntimeException("An invitation has already been sent to this email address");
        }

        // Get current user
        Authentication currentAuth = SecurityContextHolder.getContext().getAuthentication();
        String invitedBy = currentAuth.getName();

        // Create invitation
        UserInvitation invitation = new UserInvitation();
        invitation.setEmail(request.getEmail());
        invitation.setFirstName(request.getFirstName());
        invitation.setLastName(request.getLastName());
        invitation.setRoles(request.getRoles());
        invitation.setInvitedBy(invitedBy);
        invitation.setCustomMessage(request.getCustomMessage());

        // Set department if provided
        if (request.getDepartmentId() != null) {
            Department department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new RuntimeException("Department not found"));
            invitation.setDepartment(department);
        }

        // Set expiry time (24 hours from now)
        invitation.setExpiresAt(LocalDateTime.now().plusHours(24));

        invitationRepository.save(invitation);

        // Send invitation email
        boolean emailSent = false;
        String emailStatus = "Not sent";

        try {
            emailService.sendUserInvitationEmail(
                invitation.getEmail(),
                invitation.getFirstName(),
                invitation.getLastName(),
                invitation.getInvitationToken(),
                invitation.getCustomMessage()
            );
            emailSent = true;
            emailStatus = "Sent successfully";
        } catch (Exception e) {
            emailStatus = "Failed to send: " + e.getMessage();
        }

        // Create response
        InviteUserResponse response = new InviteUserResponse();
        response.setMessage("Invitation sent successfully");
        response.setInvitationId(invitation.getInvitationToken());
        response.setEmail(invitation.getEmail());
        response.setExpiresAt(invitation.getExpiresAt());
        response.setEmailSent(emailSent);
        response.setEmailStatus(emailStatus);

        return response;
    }

    public UserInvitation getInvitationByToken(String token) {
        return invitationRepository.findByInvitationToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired invitation token"));
    }

    public boolean isInvitationValid(String token) {
        try {
            UserInvitation invitation = getInvitationByToken(token);
            return invitation.isValid();
        } catch (Exception e) {
            return false;
        }
    }

    public void markInvitationAsAccepted(String token) {
        UserInvitation invitation = getInvitationByToken(token);
        invitation.setStatus(UserInvitation.InvitationStatus.ACCEPTED);
        invitation.setAcceptedAt(LocalDateTime.now());
        invitationRepository.save(invitation);
    }

    public List<UserInvitation> getPendingInvitations() {
        return invitationRepository.findByStatus(UserInvitation.InvitationStatus.PENDING);
    }

    public List<UserInvitation> getInvitationsByUser(String invitedBy) {
        return invitationRepository.findByInvitedBy(invitedBy);
    }

    public void cleanupExpiredInvitations() {
        List<UserInvitation> expiredInvitations = invitationRepository.findExpiredInvitations(LocalDateTime.now());
        for (UserInvitation invitation : expiredInvitations) {
            invitation.setStatus(UserInvitation.InvitationStatus.EXPIRED);
        }
        invitationRepository.saveAll(expiredInvitations);
    }
}
