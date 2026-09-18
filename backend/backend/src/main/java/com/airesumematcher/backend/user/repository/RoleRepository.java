package com.airesumematcher.backend.user.repository;

import com.airesumematcher.backend.user.entity.Role;
import com.airesumematcher.backend.user.entity.RoleName;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {

    Optional<Role> findByName(RoleName name);
}