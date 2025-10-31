package com.rossumtechsystems.eyesante_backend.util;

import com.rossumtechsystems.eyesante_backend.entity.Role;
import com.rossumtechsystems.eyesante_backend.entity.User;
import com.rossumtechsystems.eyesante_backend.repository.RoleRepository;
import com.rossumtechsystems.eyesante_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

@Component
public class SuperAdminCreator {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${spring.profiles.active:dev}")
    private String activeProfile;

    public void createSuperAdminIfNotExists() {
        try {
            // Skip in development for faster startup if super admin already exists
            if ("dev".equals(activeProfile)) {
                if (userRepository.existsByUsername("superadmin")) {
                    System.out.println("Super admin user already exists");
                    return;
                }
            }

            // Check if super admin already exists
            if (userRepository.existsByUsername("superadmin")) {
                System.out.println("Super admin user already exists");
                return;
            }

            // Create SUPER_ADMIN role if it doesn't exist
            Role superAdminRole = roleRepository.findByName("SUPER_ADMIN")
                    .orElseGet(() -> {
                        Role role = new Role();
                        role.setName("SUPER_ADMIN");
                        role.setDescription("Super administrator role with full permissions");
                        role.setEnabled(true);
                        return roleRepository.save(role);
                    });

            // Create super admin user
            User superAdmin = new User();
            superAdmin.setUsername("superadmin");
            superAdmin.setEmail("superadmin@eyesante.com");
            superAdmin.setPassword(passwordEncoder.encode("superadmin123"));
            superAdmin.setFirstName("Super");
            superAdmin.setLastName("Admin");
            superAdmin.setEnabled(true);
            superAdmin.setPasswordChangeRequired(true);

            // Assign SUPER_ADMIN role
            Set<Role> roles = new HashSet<>();
            roles.add(superAdminRole);
            superAdmin.setRoles(roles);

            userRepository.save(superAdmin);
            System.out.println("✅ Super admin user created successfully!");
            System.out.println("Username: superadmin");
            System.out.println("Password: superadmin123");
            
        } catch (Exception e) {
            System.err.println("❌ Error creating super admin: " + e.getMessage());
            e.printStackTrace();
        }
    }
} 