package com.rossumtechsystems.eyesante_backend.controller;

import com.rossumtechsystems.eyesante_backend.util.SuperAdminCreator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private SuperAdminCreator superAdminCreator;

    @PostMapping("/create-super-admin")
    public ResponseEntity<String> createSuperAdmin() {
        try {
            superAdminCreator.createSuperAdminIfNotExists();
            return ResponseEntity.ok("Super admin creation process completed. Check console for details.");
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Error creating super admin: " + e.getMessage());
        }
    }
} 