package com.rossumtechsystems.eyesante_backend.repository;

import com.rossumtechsystems.eyesante_backend.entity.UserInvitation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserInvitationRepository extends JpaRepository<UserInvitation, Long> {
    
    Optional<UserInvitation> findByInvitationToken(String invitationToken);
    
    Optional<UserInvitation> findByEmailAndStatus(String email, UserInvitation.InvitationStatus status);
    
    List<UserInvitation> findByStatus(UserInvitation.InvitationStatus status);
    
    List<UserInvitation> findByInvitedBy(String invitedBy);
    
    @Query("SELECT ui FROM UserInvitation ui WHERE ui.expiresAt < :now AND ui.status = 'PENDING'")
    List<UserInvitation> findExpiredInvitations(@Param("now") LocalDateTime now);
    
    boolean existsByEmailAndStatus(String email, UserInvitation.InvitationStatus status);
    
    @Query("SELECT COUNT(ui) FROM UserInvitation ui WHERE ui.email = :email AND ui.status = 'PENDING'")
    long countPendingInvitationsByEmail(@Param("email") String email);
}
