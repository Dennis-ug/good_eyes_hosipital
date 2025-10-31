package com.rossumtechsystems.eyesante_backend.config;

import com.rossumtechsystems.eyesante_backend.util.SuperAdminCreator;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
public class StartupInitializers {

    @Value("${spring.profiles.active:dev}")
    private String activeProfile;

    @Bean
    @Profile("!dev") // Only run in non-development profiles
    public ApplicationRunner superAdminInitializer(SuperAdminCreator creator) {
        return args -> creator.createSuperAdminIfNotExists();
    }

    @Bean
    @Profile("dev") // Run in development but with optimization
    public ApplicationRunner superAdminInitializerDev(SuperAdminCreator creator) {
        return args -> creator.createSuperAdminIfNotExists();
    }
}


