package com.example.auth_service.security;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Getter
@Setter
@ConfigurationProperties(prefix = "app.security")
public class AppSecurityProperties {

    private String adminEmails;

    private String frontendSuccessUrl;

    private String frontendFailureUrl;

    private List<String> allowedOrigins = new ArrayList<>();

    public Set<String> adminEmailSet() {
        if (adminEmails == null || adminEmails.isBlank()) {
            return Set.of();
        }
        return List.of(adminEmails.split(",")).stream()
                .map(String::trim)
                .filter(email -> !email.isBlank())
                .map(String::toLowerCase)
                .collect(Collectors.toSet());
    }
}
