package com.ctse.auth_service.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.Instant;

// Generic API response wrapper used to standardize all HTTP responses.
@Getter
@Builder
public class ApiResponse<T> {
    private Instant timestamp;
    private int status;
    private String message;
    private String path;
    private T data;
}
