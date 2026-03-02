package com.ctse.product_catelog_service.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ImageUploadResponse {
    private String key;
    private String url;
    private String contentType;
    private long size;
}
