package com.example.auth_service.dto;

import com.example.auth_service.model.AuthProvider;
import com.example.auth_service.model.Role;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.Set;

@Getter
@Builder
public class UserResponse {
    private String id;
    private String email;
    private String firstName;
    private String lastName;
    private String pictureUrl;
    private String phoneNumber;
    private AddressResponse address;
    private AuthProvider provider;
    private Set<Role> roles;
    private boolean emailVerified;
    private Instant lastLoginAt;
    private Instant createdAt;
}
