package com.example.auth_service.service;

import com.example.auth_service.dto.AuthResponse;
import com.example.auth_service.dto.LoginRequest;
import com.example.auth_service.dto.RegisterRequest;
import com.example.auth_service.dto.UpdateAddressRequest;
import com.example.auth_service.dto.UpdateProfileRequest;
import com.example.auth_service.dto.UserResponse;
import com.example.auth_service.model.User;

import java.util.List;

public interface AuthService {
    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    AuthResponse issueTokenForUser(String email);

    UserResponse getCurrentUser(String email);

    UserResponse updateProfile(String email, UpdateProfileRequest request);

    UserResponse updateAddress(String email, UpdateAddressRequest request);

    User processGoogleUser(String email, String firstName, String lastName, String pictureUrl);

    List<UserResponse> getAllUsers();
}
