package com.ctse.auth_service.service;

import com.ctse.auth_service.dto.AuthResponse;
import com.ctse.auth_service.dto.LoginRequest;
import com.ctse.auth_service.dto.RegisterRequest;
import com.ctse.auth_service.dto.TokenValidationResponse;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    TokenValidationResponse validateToken(String token);
}
