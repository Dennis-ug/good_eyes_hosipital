package com.rossumtechsystems.eyesante_backend.repository;

import com.rossumtechsystems.eyesante_backend.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.Set;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(String name);
    Set<Role> findByEnabled(boolean enabled);
    boolean existsByName(String name);
} 