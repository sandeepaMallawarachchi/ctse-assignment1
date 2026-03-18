package com.example.auth_service.controller;

import com.example.auth_service.dto.ApiResponse;
import com.example.auth_service.dto.AuthResponse;
import com.example.auth_service.dto.LoginRequest;
import com.example.auth_service.dto.RegisterRequest;
import com.example.auth_service.dto.UpdateAddressRequest;
import com.example.auth_service.dto.UpdateProfileRequest;
import com.example.auth_service.dto.UserResponse;
import com.example.auth_service.exception.UnauthorizedException;
import com.example.auth_service.security.AuthUserPrincipal;
import com.example.auth_service.security.JwtCookieService;
import com.example.auth_service.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Auth", description = "Authentication and user APIs")
public class AuthController {

    private final AuthService authService;
    private final JwtCookieService jwtCookieService;

    @PostMapping("/register")
    @Operation(summary = "Register with email and password")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request,
                                                              HttpServletRequest httpRequest) {
        AuthResponse authResponse = authService.register(request);
        return withCookie(HttpStatus.CREATED, "Registration successful", httpRequest.getRequestURI(), authResponse);
    }

    @PostMapping("/login")
    @Operation(summary = "Login with email and password")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request,
                                                           HttpServletRequest httpRequest) {
        AuthResponse authResponse = authService.login(request);
        return withCookie(HttpStatus.OK, "Login successful", httpRequest.getRequestURI(), authResponse);
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout and clear auth cookie")
    public ResponseEntity<ApiResponse<Void>> logout(HttpServletRequest httpRequest) {
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, jwtCookieService.clearAuthCookie().toString())
                .body(body(HttpStatus.OK, "Logout successful", httpRequest.getRequestURI(), null));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user")
    public ResponseEntity<ApiResponse<UserResponse>> me(Authentication authentication,
                                                        HttpServletRequest httpRequest) {
        UserResponse user = authService.getCurrentUser(resolveAuthenticatedEmail(authentication));
        return ResponseEntity.ok(body(HttpStatus.OK, "Current user fetched successfully", httpRequest.getRequestURI(), user));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update current authenticated user's profile details")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(Authentication authentication,
                                                                   @Valid @RequestBody UpdateProfileRequest request,
                                                                   HttpServletRequest httpRequest) {
        UserResponse user = authService.updateProfile(resolveAuthenticatedEmail(authentication), request);
        return ResponseEntity.ok(body(HttpStatus.OK, "Profile updated successfully", httpRequest.getRequestURI(), user));
    }

    @PutMapping("/address")
    @Operation(summary = "Update current authenticated user's saved address")
    public ResponseEntity<ApiResponse<UserResponse>> updateAddress(Authentication authentication,
                                                                   @Valid @RequestBody UpdateAddressRequest request,
                                                                   HttpServletRequest httpRequest) {
        UserResponse user = authService.updateAddress(resolveAuthenticatedEmail(authentication), request);
        return ResponseEntity.ok(body(HttpStatus.OK, "Address updated successfully", httpRequest.getRequestURI(), user));
    }

    @GetMapping("/token")
    @Operation(summary = "Get JWT token for the current authenticated user")
    public ResponseEntity<ApiResponse<AuthResponse>> token(Authentication authentication,
                                                           HttpServletRequest httpRequest) {
        AuthResponse authResponse = authService.issueTokenForUser(resolveAuthenticatedEmail(authentication));
        return withCookie(HttpStatus.OK, "Token issued successfully", httpRequest.getRequestURI(), authResponse);
    }

    @GetMapping("/google")
    @Operation(summary = "Start Google login flow")
    public ResponseEntity<Void> googleLogin() {
        return ResponseEntity.status(HttpStatus.FOUND)
                .header(HttpHeaders.LOCATION, "/oauth2/authorization/google")
                .build();
    }

    private ResponseEntity<ApiResponse<AuthResponse>> withCookie(HttpStatus status,
                                                                 String message,
                                                                 String path,
                                                                 AuthResponse authResponse) {
        return ResponseEntity.status(status)
                .header(HttpHeaders.SET_COOKIE, jwtCookieService.buildAuthCookie(authResponse.getToken()).toString())
                .body(body(status, message, path, authResponse));
    }

    private <T> ApiResponse<T> body(HttpStatus status, String message, String path, T data) {
        return ApiResponse.<T>builder()
                .timestamp(Instant.now())
                .status(status.value())
                .message(message)
                .path(path)
                .data(data)
                .build();
    }

    private String resolveAuthenticatedEmail(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UnauthorizedException("Unauthorized");
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof AuthUserPrincipal authUserPrincipal) {
            return authUserPrincipal.getUsername();
        }
        if (principal instanceof OAuth2User oauth2User) {
            String email = oauth2User.getAttribute("email");
            if (email != null && !email.isBlank()) {
                return email;
            }
        }
        if (principal instanceof UserDetails userDetails) {
            return userDetails.getUsername();
        }

        String name = authentication.getName();
        if (name != null && name.contains("@")) {
            return name;
        }

        throw new UnauthorizedException("Authenticated user email could not be resolved");
    }
}
