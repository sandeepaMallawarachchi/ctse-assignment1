package com.example.auth_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateAddressRequest {

    @NotBlank(message = "Full name is required")
    @Size(max = 120, message = "Full name must be less than 120 characters")
    private String fullName;

    @NotBlank(message = "Phone number is required")
    @Size(max = 30, message = "Phone number must be less than 30 characters")
    private String phoneNumber;

    @NotBlank(message = "Address line 1 is required")
    @Size(max = 160, message = "Address line 1 must be less than 160 characters")
    private String addressLine1;

    @Size(max = 160, message = "Address line 2 must be less than 160 characters")
    private String addressLine2;

    @NotBlank(message = "City is required")
    @Size(max = 80, message = "City must be less than 80 characters")
    private String city;

    @NotBlank(message = "State is required")
    @Size(max = 80, message = "State must be less than 80 characters")
    private String state;

    @NotBlank(message = "Postal code is required")
    @Size(max = 30, message = "Postal code must be less than 30 characters")
    private String postalCode;

    @NotBlank(message = "Country is required")
    @Size(max = 80, message = "Country must be less than 80 characters")
    private String country;
}
