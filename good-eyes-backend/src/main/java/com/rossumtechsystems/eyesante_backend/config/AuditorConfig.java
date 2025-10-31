package com.rossumtechsystems.eyesante_backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.auditing.DateTimeProvider;
import org.springframework.data.domain.AuditorAware;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import com.rossumtechsystems.eyesante_backend.service.TimeService;

import java.util.Optional;

@Configuration
public class AuditorConfig {

    private final TimeService timeService;

    public AuditorConfig(TimeService timeService) {
        this.timeService = timeService;
    }

    @Bean
    public AuditorAware<String> auditorProvider() {
        return () -> {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated() || 
                "anonymousUser".equals(authentication.getName())) {
                return Optional.of("system");
            }
            return Optional.of(authentication.getName());
        };
    }

    @Bean
    public DateTimeProvider dateTimeProvider() {
        return () -> Optional.of(timeService.getCurrentDateTime());
    }
} 