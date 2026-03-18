package com.ctse.product_catelog_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CategoryCreateRequest {
    @NotBlank(message = "Category name is required")
    @Size(max = 80, message = "Category name must be less than 80 characters")
    private String name;

    @NotBlank(message = "Icon key is required")
    @Size(max = 80, message = "Icon key must be less than 80 characters")
    private String iconKey;
}
