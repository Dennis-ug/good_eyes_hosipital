package com.rossumtechsystems.eyesante_backend.service;

import com.rossumtechsystems.eyesante_backend.dto.PermissionDto;
import com.rossumtechsystems.eyesante_backend.dto.RoleDto;
import com.rossumtechsystems.eyesante_backend.entity.Permission;
import com.rossumtechsystems.eyesante_backend.entity.Role;
import com.rossumtechsystems.eyesante_backend.entity.User;
import com.rossumtechsystems.eyesante_backend.repository.PermissionRepository;
import com.rossumtechsystems.eyesante_backend.repository.RoleRepository;
import com.rossumtechsystems.eyesante_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class RolePermissionService {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PermissionRepository permissionRepository;

    @Autowired
    private UserRepository userRepository;

    private boolean isSuperUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }
        
        User user = userRepository.findByUsername(authentication.getName())
                .orElse(null);
        
        if (user == null) {
            return false;
        }
        
        return user.getRoles().stream()
                .anyMatch(role -> "SUPER_ADMIN".equals(role.getName()));
    }

    // Permission Management
    public PermissionDto createPermission(PermissionDto permissionDto) {
        if (!isSuperUser()) {
            throw new AccessDeniedException("Only super users can create permissions");
        }

        if (permissionRepository.existsByName(permissionDto.getName())) {
            throw new RuntimeException("Permission with this name already exists");
        }

        Permission permission = new Permission();
        permission.setName(permissionDto.getName());
        permission.setDescription(permissionDto.getDescription());
        permission.setResourceName(permissionDto.getResourceName());
        permission.setActionName(permissionDto.getActionName());
        permission.setEnabled(permissionDto.isEnabled());

        Permission savedPermission = permissionRepository.save(permission);
        return convertToDto(savedPermission);
    }

    @Transactional(readOnly = true)
    public PermissionDto updatePermission(Long id, PermissionDto permissionDto) {
        if (!isSuperUser()) {
            throw new AccessDeniedException("Only super users can update permissions");
        }

        Permission permission = permissionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Permission not found"));

        permission.setName(permissionDto.getName());
        permission.setDescription(permissionDto.getDescription());
        permission.setResourceName(permissionDto.getResourceName());
        permission.setActionName(permissionDto.getActionName());
        permission.setEnabled(permissionDto.isEnabled());

        Permission savedPermission = permissionRepository.save(permission);
        return convertToDto(savedPermission);
    }

    public void deletePermission(Long id) {
        if (!isSuperUser()) {
            throw new AccessDeniedException("Only super users can delete permissions");
        }

        Permission permission = permissionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Permission not found"));

        // Check if permission is used by any role
        List<Role> rolesUsingPermission = roleRepository.findAll().stream()
                .filter(role -> role.getPermissions().contains(permission))
                .collect(Collectors.toList());

        if (!rolesUsingPermission.isEmpty()) {
            throw new RuntimeException("Cannot delete permission as it is used by roles: " +
                    rolesUsingPermission.stream().map(Role::getName).collect(Collectors.joining(", ")));
        }

        permissionRepository.delete(permission);
    }

    @Transactional(readOnly = true)
    public Page<PermissionDto> getAllPermissions(Pageable pageable) {
        return permissionRepository.findAll(pageable).map(this::convertToDto);
    }

    @Transactional(readOnly = true)
    public PermissionDto getPermissionById(Long id) {
        Permission permission = permissionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Permission not found"));
        return convertToDto(permission);
    }

    // Role Management
    public RoleDto createRole(RoleDto roleDto) {
        if (!isSuperUser()) {
            throw new AccessDeniedException("Only super users can create roles");
        }

        if (roleRepository.existsByName(roleDto.getName())) {
            throw new RuntimeException("Role with this name already exists");
        }

        Role role = new Role();
        role.setName(roleDto.getName());
        role.setDescription(roleDto.getDescription());
        role.setEnabled(roleDto.isEnabled());

        // Set permissions
        if (roleDto.getPermissionIds() != null && !roleDto.getPermissionIds().isEmpty()) {
            Set<Permission> permissions = permissionRepository.findAllById(roleDto.getPermissionIds())
                    .stream().collect(Collectors.toSet());
            role.setPermissions(permissions);
        }

        Role savedRole = roleRepository.save(role);
        return convertToDto(savedRole);
    }

    @Transactional(readOnly = true)
    public RoleDto updateRole(Long id, RoleDto roleDto) {
        if (!isSuperUser()) {
            throw new AccessDeniedException("Only super users can update roles");
        }

        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found"));

        role.setName(roleDto.getName());
        role.setDescription(roleDto.getDescription());
        role.setEnabled(roleDto.isEnabled());

        // Update permissions
        if (roleDto.getPermissionIds() != null) {
            Set<Permission> permissions = permissionRepository.findAllById(roleDto.getPermissionIds())
                    .stream().collect(Collectors.toSet());
            role.setPermissions(permissions);
        }

        Role savedRole = roleRepository.save(role);
        return convertToDto(savedRole);
    }

    public void deleteRole(Long id) {
        if (!isSuperUser()) {
            throw new AccessDeniedException("Only super users can delete roles");
        }

        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found with ID: " + id));

        // Check if role is assigned to any user using a more robust approach
        List<User> usersWithRole = userRepository.findAll().stream()
                .filter(user -> user.getRoles().contains(role))
                .collect(Collectors.toList());
        
        if (!usersWithRole.isEmpty()) {
            String userNames = usersWithRole.stream()
                    .map(User::getUsername)
                    .collect(Collectors.joining(", "));
            throw new RuntimeException("Cannot delete role '" + role.getName() + "' as it is assigned to " + 
                    usersWithRole.size() + " user(s): " + userNames);
        }

        // Check if this is a system role that shouldn't be deleted
        if ("SUPER_ADMIN".equals(role.getName()) || "ADMIN".equals(role.getName()) || 
            "USER".equals(role.getName()) || "DOCTOR".equals(role.getName()) ||
            "OPTOMETRIST".equals(role.getName()) || "OPHTHALMOLOGIST".equals(role.getName()) ||
            "RECEPTIONIST".equals(role.getName()) || "Accountant".equals(role.getName())) {
            throw new RuntimeException("Cannot delete system role '" + role.getName() + "'. This role is required for system functionality.");
        }

        roleRepository.delete(role);
    }

    @Transactional(readOnly = true)
    public Page<RoleDto> getAllRoles(Pageable pageable) {
        return roleRepository.findAll(pageable).map(this::convertToDto);
    }

    @Transactional(readOnly = true)
    public RoleDto getRoleById(Long id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found"));
        return convertToDto(role);
    }

    // Helper methods
    private PermissionDto convertToDto(Permission permission) {
        PermissionDto dto = new PermissionDto();
        dto.setId(permission.getId());
        dto.setName(permission.getName());
        dto.setDescription(permission.getDescription());
        dto.setResourceName(permission.getResourceName());
        dto.setActionName(permission.getActionName());
        dto.setEnabled(permission.isEnabled());
        return dto;
    }

    private RoleDto convertToDto(Role role) {
        RoleDto dto = new RoleDto();
        dto.setId(role.getId());
        dto.setName(role.getName());
        dto.setDescription(role.getDescription());
        dto.setEnabled(role.isEnabled());
        dto.setPermissionIds(role.getPermissions().stream()
                .map(Permission::getId)
                .collect(Collectors.toSet()));
        return dto;
    }
} 