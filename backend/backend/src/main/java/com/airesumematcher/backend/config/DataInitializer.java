package com.airesumematcher.backend.config;

import com.airesumematcher.backend.user.entity.Role;
import com.airesumematcher.backend.user.entity.RoleName;
import com.airesumematcher.backend.user.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;

    @Override
    public void run(String... args) {

        for (RoleName roleName : RoleName.values()) {

            if (roleRepository.findByName(roleName).isEmpty()) {

                Role role = Role.builder().name(roleName).build();

                roleRepository.save(role);

                System.out.println("Created role: " + roleName);
            }
        }

        System.out.println("Database role initialization completed.");
    }
}