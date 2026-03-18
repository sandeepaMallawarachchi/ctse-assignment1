package com.ctse.product_catelog_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SubCategoryCreateRequest {
    @NotBlank(message = "Subcategory name is required")
    @Size(max = 80, message = "Subcategory name must be less than 80 characters")
    private String name;
}
