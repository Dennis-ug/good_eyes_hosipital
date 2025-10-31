package com.rossumtechsystems.eyesante_backend.service;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.stream.Collectors;

@Service
public class PermissionService {


    /**
     * Check if the current user has a specific permission
     */
    public boolean hasPermission(String permissionName) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        return authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals(permissionName));
    }

    /**
     * Check if the current user has any of the specified permissions
     */
    public boolean hasAnyPermission(String... permissionNames) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        Set<String> userPermissions = authentication.getAuthorities().stream()
                .map(authority -> authority.getAuthority())
                .collect(Collectors.toSet());

        for (String permission : permissionNames) {
            if (userPermissions.contains(permission)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Check if the current user has a specific role
     */
    public boolean hasRole(String roleName) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        return authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_" + roleName));
    }

    /**
     * Get all permissions for the current user
     */
    public Set<String> getCurrentUserPermissions() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return Set.of();
        }

        return authentication.getAuthorities().stream()
                .map(authority -> authority.getAuthority())
                .collect(Collectors.toSet());
    }

    /**
     * Get all roles for the current user
     */
    public Set<String> getCurrentUserRoles() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return Set.of();
        }

        return authentication.getAuthorities().stream()
                .filter(authority -> authority.getAuthority().startsWith("ROLE_"))
                .map(authority -> authority.getAuthority().substring(5)) // Remove "ROLE_" prefix
                .collect(Collectors.toSet());
    }

    /**
     * Check if user can create patients
     */
    public boolean canCreatePatients() {
        return hasPermission("PATIENT_CREATE");
    }

    /**
     * Check if user can update patients
     */
    public boolean canUpdatePatients() {
        return hasPermission("PATIENT_UPDATE");
    }

    /**
     * Check if user can delete patients
     */
    public boolean canDeletePatients() {
        return hasPermission("PATIENT_DELETE");
    }

    /**
     * Check if user can create visit sessions
     */
    public boolean canCreateVisitSessions() {
        return hasPermission("VISIT_SESSION_CREATE");
    }

    /**
     * Check if user can update visit sessions
     */
    public boolean canUpdateVisitSessions() {
        return hasPermission("VISIT_SESSION_UPDATE");
    }

    /**
     * Check if user can create examinations
     */
    public boolean canCreateExaminations() {
        return hasPermission("EXAMINATION_CREATE");
    }

    /**
     * Check if user can update examinations
     */
    public boolean canUpdateExaminations() {
        return hasPermission("EXAMINATION_UPDATE");
    }

    /**
     * Check if user can create triage records
     */
    public boolean canCreateTriage() {
        return hasPermission("TRIAGE_CREATE");
    }

    /**
     * Check if user can update triage records
     */
    public boolean canUpdateTriage() {
        return hasPermission("TRIAGE_UPDATE");
    }

    /**
     * Check if user is a doctor (has clinical access)
     */
    public boolean isDoctor() {
        return hasRole("DOCTOR") || hasRole("OPTOMETRIST") || hasRole("OPHTHALMOLOGIST");
    }

    /**
     * Check if user is a receptionist
     */
    public boolean isReceptionist() {
        return hasRole("RECEPTIONIST");
    }

    /**
     * Check if user is an admin
     */
    public boolean isAdmin() {
        return hasRole("ADMIN") || hasRole("SUPER_ADMIN");
    }
}
