package com.ctse.product_catelog_service.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Getter
@Builder
public class ProductResponse {
    private String id;
    private String name;
    private String slug;
    private String description;
    private String category;
    private BigDecimal price;
    private boolean inStock;
    private Integer stockQuantity;
    private String imageUrl;
    private Double rating;
    private Integer reviewCount;
    private List<String> gallery;
    private List<String> colorOptions;
    private List<String> sizes;
    private boolean active;
    private Instant createdAt;
    private Instant updatedAt;
}
