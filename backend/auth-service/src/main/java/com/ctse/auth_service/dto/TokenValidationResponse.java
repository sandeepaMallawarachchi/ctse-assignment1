package com.ctse.auth_service.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class TokenValidationResponse {
    private boolean valid;
    private String userId;
    private String email;
    private List<String> roles;
}
