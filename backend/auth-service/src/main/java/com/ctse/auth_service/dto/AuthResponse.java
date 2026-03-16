package com.ctse.auth_service.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class AuthResponse {
    private String accessToken;
    private String tokenType;
    private String userId;
    private String email;
    private String fullName;
    private List<String> roles;
}
