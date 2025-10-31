package com.rossumtechsystems.eyesante_backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "user_invitations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class UserInvitation {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String invitationToken;
    
    @Column(nullable = false)
    private String email;
    
    @Column(nullable = false)
    private String firstName;
    
    @Column(nullable = false)
    private String lastName;
    
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "invitation_roles", joinColumns = @JoinColumn(name = "invitation_id"))
    @Column(name = "role_name")
    private Set<String> roles;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;
    
    @Column(columnDefinition = "TEXT")
    private String customMessage;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InvitationStatus status = InvitationStatus.PENDING;
    
    @Column(nullable = false)
    private String invitedBy;
    
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime invitedAt;
    
    @Column(nullable = false)
    private LocalDateTime expiresAt;
    
    @Column
    private LocalDateTime acceptedAt;
    
    @PrePersist
    protected void onCreate() {
        if (invitationToken == null) {
            invitationToken = UUID.randomUUID().toString();
        }
        if (invitedAt == null) {
            invitedAt = LocalDateTime.now();
        }
        if (expiresAt == null) {
            expiresAt = LocalDateTime.now().plusHours(24); // 24 hours expiry
        }
    }
    
    public enum InvitationStatus {
        PENDING,
        ACCEPTED,
        EXPIRED
    }
    
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }
    
    public boolean isValid() {
        return status == InvitationStatus.PENDING && !isExpired();
    }
}
