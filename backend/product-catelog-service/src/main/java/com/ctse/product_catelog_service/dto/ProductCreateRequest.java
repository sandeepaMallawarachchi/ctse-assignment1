package com.ctse.product_catelog_service.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
public class ProductCreateRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 120, message = "Name must be less than 120 characters")
    private String name;

    @NotBlank(message = "Slug is required")
    @Size(max = 160, message = "Slug must be less than 160 characters")
    @Pattern(regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$", message = "Slug must be kebab-case")
    private String slug;

    @NotBlank(message = "Description is required")
    @Size(max = 1000, message = "Description must be less than 1000 characters")
    private String description;

    @NotBlank(message = "Category is required")
    @Size(max = 80, message = "Category must be less than 80 characters")
    private String category;

    @Size(max = 80, message = "Subcategory must be less than 80 characters")
    private String subCategory;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    private BigDecimal price;

    @NotNull(message = "Stock quantity is required")
    @Min(value = 0, message = "Stock quantity cannot be negative")
    private Integer stockQuantity;

    @Pattern(regexp = "^(https?://.*)?$", message = "Image URL must be a valid URL")
    private String imageUrl;

    @DecimalMin(value = "0.0", message = "Rating cannot be negative")
    @DecimalMax(value = "5.0", message = "Rating cannot be greater than 5")
    private Double rating;

    @Min(value = 0, message = "Review count cannot be negative")
    private Integer reviewCount;

    private List<String> gallery;
    private List<String> colorOptions;
    private List<String> sizes;

    private Boolean active;
}
