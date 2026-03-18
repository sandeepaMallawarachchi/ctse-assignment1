package com.example.auth_service.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AddressResponse {
    private String fullName;
    private String phoneNumber;
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String state;
    private String postalCode;
    private String country;
}
