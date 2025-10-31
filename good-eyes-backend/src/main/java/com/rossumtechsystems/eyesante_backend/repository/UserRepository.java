package com.rossumtechsystems.eyesante_backend.repository;

import com.rossumtechsystems.eyesante_backend.entity.User;
import com.rossumtechsystems.eyesante_backend.entity.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Optional<User> findByResetToken(String resetToken);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    
    @Query("SELECT COUNT(u) FROM User u JOIN u.roles r WHERE r = :role")
    long countByRolesContaining(@Param("role") Role role);
    
    @Query("SELECT u FROM User u WHERE u.department.name = :departmentName")
    Page<User> findByDepartmentName(@Param("departmentName") String departmentName, Pageable pageable);
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.department = :department")
    long countByDepartment(@Param("department") com.rossumtechsystems.eyesante_backend.entity.Department department);

    @Query("""
        SELECT DISTINCT u FROM User u
        LEFT JOIN u.roles r
        WHERE (
            :search IS NULL OR :search = '' OR
            LOWER(u.username) LIKE LOWER(CONCAT('%', :search, '%')) OR
            LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) OR
            LOWER(COALESCE(u.firstName, '')) LIKE LOWER(CONCAT('%', :search, '%')) OR
            LOWER(COALESCE(u.lastName, '')) LIKE LOWER(CONCAT('%', :search, '%'))
        )
        AND (
            :roleName IS NULL OR :roleName = '' OR r.name = :roleName
        )
        AND (
            :status IS NULL OR :status = '' OR
            (:status = 'ACTIVE' AND u.enabled = true) OR
            (:status = 'INACTIVE' AND u.enabled = false) OR
            (:status = 'PENDING' AND (u.passwordChangeRequired = true))
        )
        """)
    Page<User> searchUsers(
            @Param("search") String search,
            @Param("roleName") String roleName,
            @Param("status") String status,
            Pageable pageable);
} 