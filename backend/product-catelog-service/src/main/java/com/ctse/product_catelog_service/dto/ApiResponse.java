package com.ctse.product_catelog_service.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.Instant;

@Getter
@Builder
public class ApiResponse<T> {
    private Instant timestamp;
    private int status;
    private String message;
    private String path;
    private T data;
}
