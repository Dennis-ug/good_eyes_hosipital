package com.rossumtechsystems.eyesante_backend.controller;

import com.rossumtechsystems.eyesante_backend.service.PermissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/permissions")
public class PermissionController {

    @Autowired
    private PermissionService permissionService;

    /**
     * Get current user's permissions and roles
     */
    @GetMapping("/current-user")
    public ResponseEntity<Map<String, Object>> getCurrentUserPermissions() {
        Map<String, Object> response = new HashMap<>();
        
        Set<String> permissions = permissionService.getCurrentUserPermissions();
        Set<String> roles = permissionService.getCurrentUserRoles();
        
        response.put("permissions", permissions);
        response.put("roles", roles);
        
        // Add specific permission checks for frontend convenience
        Map<String, Boolean> permissionChecks = new HashMap<>();
        permissionChecks.put("canCreatePatients", permissionService.canCreatePatients());
        permissionChecks.put("canUpdatePatients", permissionService.canUpdatePatients());
        permissionChecks.put("canDeletePatients", permissionService.canDeletePatients());
        permissionChecks.put("canCreateVisitSessions", permissionService.canCreateVisitSessions());
        permissionChecks.put("canUpdateVisitSessions", permissionService.canUpdateVisitSessions());
        permissionChecks.put("canCreateExaminations", permissionService.canCreateExaminations());
        permissionChecks.put("canUpdateExaminations", permissionService.canUpdateExaminations());
        permissionChecks.put("canCreateTriage", permissionService.canCreateTriage());
        permissionChecks.put("canUpdateTriage", permissionService.canUpdateTriage());
        permissionChecks.put("isDoctor", permissionService.isDoctor());
        permissionChecks.put("isReceptionist", permissionService.isReceptionist());
        permissionChecks.put("isAdmin", permissionService.isAdmin());
        
        response.put("permissionChecks", permissionChecks);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Check if current user has a specific permission
     */
    @GetMapping("/check/{permissionName}")
    public ResponseEntity<Map<String, Boolean>> checkPermission(@PathVariable String permissionName) {
        Map<String, Boolean> response = new HashMap<>();
        response.put("hasPermission", permissionService.hasPermission(permissionName));
        return ResponseEntity.ok(response);
    }

    /**
     * Check if current user has a specific role
     */
    @GetMapping("/check-role/{roleName}")
    public ResponseEntity<Map<String, Boolean>> checkRole(@PathVariable String roleName) {
        Map<String, Boolean> response = new HashMap<>();
        response.put("hasRole", permissionService.hasRole(roleName));
        return ResponseEntity.ok(response);
    }
}
