package com.ctse.product_catelog_service.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.List;

@Getter
@Builder
public class CategoryResponse {
    private String id;
    private String name;
    private String slug;
    private String iconKey;
    private List<SubCategoryResponse> subCategories;
    private Instant createdAt;
    private Instant updatedAt;
}
