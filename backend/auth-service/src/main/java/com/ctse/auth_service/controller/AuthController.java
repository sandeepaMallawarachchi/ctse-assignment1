package com.ctse.auth_service.controller;

import com.ctse.auth_service.dto.ApiResponse;
import com.ctse.auth_service.dto.AuthResponse;
import com.ctse.auth_service.dto.LoginRequest;
import com.ctse.auth_service.dto.RegisterRequest;
import com.ctse.auth_service.dto.TokenValidationResponse;
import com.ctse.auth_service.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Auth", description = "Authentication Service APIs")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Register a new user")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request,
            HttpServletRequest httpRequest) {

        AuthResponse data = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(response(HttpStatus.CREATED, "User registered successfully", httpRequest.getRequestURI(), data));
    }

    @PostMapping("/login")
    @Operation(summary = "Login and receive a JWT token")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest) {

        AuthResponse data = authService.login(request);
        return ResponseEntity.ok(response(HttpStatus.OK, "Login successful", httpRequest.getRequestURI(), data));
    }

    @GetMapping("/validate")
    @Operation(summary = "Validate a JWT token (used by other microservices)")
    public ResponseEntity<ApiResponse<TokenValidationResponse>> validate(
            @RequestHeader("Authorization") String authHeader,
            HttpServletRequest httpRequest) {

        String token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;
        TokenValidationResponse data = authService.validateToken(token);
        return ResponseEntity.ok(response(HttpStatus.OK, "Token validated", httpRequest.getRequestURI(), data));
    }

    private <T> ApiResponse<T> response(HttpStatus status, String message, String path, T data) {
        return ApiResponse.<T>builder()
                .timestamp(Instant.now())
                .status(status.value())
                .message(message)
                .path(path)
                .data(data)
                .build();
    }
}
