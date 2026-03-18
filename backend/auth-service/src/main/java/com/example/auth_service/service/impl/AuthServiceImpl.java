package com.example.auth_service.service.impl;

import com.example.auth_service.dto.AddressResponse;
import com.example.auth_service.dto.AuthResponse;
import com.example.auth_service.dto.LoginRequest;
import com.example.auth_service.dto.RegisterRequest;
import com.example.auth_service.dto.UpdateAddressRequest;
import com.example.auth_service.dto.UpdateProfileRequest;
import com.example.auth_service.dto.UserResponse;
import com.example.auth_service.model.Address;
import com.example.auth_service.exception.BadRequestException;
import com.example.auth_service.exception.ResourceNotFoundException;
import com.example.auth_service.exception.UnauthorizedException;
import com.example.auth_service.model.AuthProvider;
import com.example.auth_service.model.Role;
import com.example.auth_service.model.User;
import com.example.auth_service.security.AppSecurityProperties;
import com.example.auth_service.security.JwtService;
import com.example.auth_service.service.AuthService;
import com.example.auth_service.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AppSecurityProperties securityProperties;

    @Override
    public AuthResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.getEmail());
        if (userService.findByEmail(email).isPresent()) {
            throw new BadRequestException("Email is already registered");
        }

        User user = User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName().trim())
                .lastName(request.getLastName().trim())
                .provider(AuthProvider.LOCAL)
                .roles(resolveRoles(email))
                .emailVerified(false)
                .lastLoginAt(Instant.now())
                .build();

        User saved = userService.save(user);
        return buildAuthResponse(saved);
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        String email = normalizeEmail(request.getEmail());
        User user = userService.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (user.getProvider() != AuthProvider.LOCAL || user.getPasswordHash() == null) {
            throw new UnauthorizedException("This account must use Google sign-in");
        }
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        user.setLastLoginAt(Instant.now());
        user.setRoles(resolveRoles(email));
        User saved = userService.save(user);
        return buildAuthResponse(saved);
    }

    @Override
    public AuthResponse issueTokenForUser(String email) {
        User user = userService.findByEmail(normalizeEmail(email))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setRoles(resolveRoles(user.getEmail()));
        user.setLastLoginAt(Instant.now());
        User saved = userService.save(user);
        return buildAuthResponse(saved);
    }

    @Override
    public UserResponse getCurrentUser(String email) {
        User user = userService.findByEmail(normalizeEmail(email))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return toUserResponse(user);
    }

    @Override
    public UserResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = userService.findByEmail(normalizeEmail(email))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName().trim());
        user.setPhoneNumber(normalizeOptional(request.getPhoneNumber()));

        return toUserResponse(userService.save(user));
    }

    @Override
    public UserResponse updateAddress(String email, UpdateAddressRequest request) {
        User user = userService.findByEmail(normalizeEmail(email))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setAddress(Address.builder()
                .fullName(request.getFullName().trim())
                .phoneNumber(request.getPhoneNumber().trim())
                .addressLine1(request.getAddressLine1().trim())
                .addressLine2(normalizeOptional(request.getAddressLine2()))
                .city(request.getCity().trim())
                .state(request.getState().trim())
                .postalCode(request.getPostalCode().trim())
                .country(request.getCountry().trim())
                .build());

        return toUserResponse(userService.save(user));
    }

    @Override
    public User processGoogleUser(String email, String firstName, String lastName, String pictureUrl) {
        String normalizedEmail = normalizeEmail(email);
        User user = userService.findByEmail(normalizedEmail).orElseGet(() -> User.builder()
                .email(normalizedEmail)
                .provider(AuthProvider.GOOGLE)
                .build());

        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setPictureUrl(pictureUrl);
        user.setProvider(AuthProvider.GOOGLE);
        user.setEmailVerified(true);
        user.setActive(true);
        user.setRoles(resolveRoles(normalizedEmail));
        user.setLastLoginAt(Instant.now());

        return userService.save(user);
    }

    @Override
    public List<UserResponse> getAllUsers() {
        return userService.findAll().stream()
                .map(this::toUserResponse)
                .toList();
    }

    private AuthResponse buildAuthResponse(User user) {
        return AuthResponse.builder()
                .token(jwtService.generateToken(user))
                .tokenType("Bearer")
                .user(toUserResponse(user))
                .build();
    }

    private UserResponse toUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .pictureUrl(user.getPictureUrl())
                .phoneNumber(user.getPhoneNumber())
                .address(toAddressResponse(user.getAddress()))
                .provider(user.getProvider())
                .roles(user.getRoles())
                .emailVerified(user.isEmailVerified())
                .lastLoginAt(user.getLastLoginAt())
                .createdAt(user.getCreatedAt())
                .build();
    }

    private AddressResponse toAddressResponse(Address address) {
        if (address == null) {
            return null;
        }

        return AddressResponse.builder()
                .fullName(address.getFullName())
                .phoneNumber(address.getPhoneNumber())
                .addressLine1(address.getAddressLine1())
                .addressLine2(address.getAddressLine2())
                .city(address.getCity())
                .state(address.getState())
                .postalCode(address.getPostalCode())
                .country(address.getCountry())
                .build();
    }

    private Set<Role> resolveRoles(String email) {
        Set<Role> roles = new HashSet<>();
        roles.add(Role.ROLE_USER);
        if (securityProperties.adminEmailSet().contains(email.toLowerCase(Locale.ROOT))) {
            roles.add(Role.ROLE_ADMIN);
        }
        return roles;
    }

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizeOptional(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
