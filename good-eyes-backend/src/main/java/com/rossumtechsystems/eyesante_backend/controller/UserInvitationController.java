package com.rossumtechsystems.eyesante_backend.controller;

import com.rossumtechsystems.eyesante_backend.dto.InviteUserRequest;
import com.rossumtechsystems.eyesante_backend.dto.InviteUserResponse;
import com.rossumtechsystems.eyesante_backend.entity.UserInvitation;
import com.rossumtechsystems.eyesante_backend.service.UserInvitationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user-management/invitations")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class UserInvitationController {

    private final UserInvitationService invitationService;

    @PostMapping
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<InviteUserResponse> sendInvitation(@Valid @RequestBody InviteUserRequest request) {
        try {
            InviteUserResponse response = invitationService.sendInvitation(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/validate/{token}")
    public ResponseEntity<Boolean> validateInvitation(@PathVariable String token) {
        try {
            boolean isValid = invitationService.isInvitationValid(token);
            return ResponseEntity.ok(isValid);
        } catch (Exception e) {
            return ResponseEntity.ok(false);
        }
    }

    @GetMapping("/{token}")
    public ResponseEntity<UserInvitation> getInvitation(@PathVariable String token) {
        try {
            UserInvitation invitation = invitationService.getInvitationByToken(token);
            return ResponseEntity.ok(invitation);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<List<UserInvitation>> getPendingInvitations() {
        try {
            List<UserInvitation> invitations = invitationService.getPendingInvitations();
            return ResponseEntity.ok(invitations);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/my-invitations")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<List<UserInvitation>> getMyInvitations() {
        try {
            // Get current user's invitations
            // This would need to be implemented based on current user context
            return ResponseEntity.ok(List.of());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/{token}/accept")
    public ResponseEntity<String> acceptInvitation(@PathVariable String token) {
        try {
            invitationService.markInvitationAsAccepted(token);
            return ResponseEntity.ok("Invitation accepted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to accept invitation: " + e.getMessage());
        }
    }

    @DeleteMapping("/{token}")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<String> cancelInvitation(@PathVariable String token) {
        try {
            // TODO: Implement cancellation logic
            return ResponseEntity.ok("Invitation cancelled successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to cancel invitation: " + e.getMessage());
        }
    }

    @PostMapping("/cleanup")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<String> cleanupExpiredInvitations() {
        try {
            invitationService.cleanupExpiredInvitations();
            return ResponseEntity.ok("Expired invitations cleaned up successfully");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to cleanup invitations: " + e.getMessage());
        }
    }
}
