package com.example.auth_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateProfileRequest {

    @NotBlank(message = "First name is required")
    @Size(max = 60, message = "First name must be less than 60 characters")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(max = 60, message = "Last name must be less than 60 characters")
    private String lastName;

    @Size(max = 30, message = "Phone number must be less than 30 characters")
    @Pattern(
            regexp = "^$|^[0-9+()\\-\\s]{7,20}$",
            message = "Phone number must be valid"
    )
    private String phoneNumber;
}
