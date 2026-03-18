package com.ctse.product_catelog_service.controller;

import com.ctse.product_catelog_service.dto.ApiResponse;
import com.ctse.product_catelog_service.dto.CategoryCreateRequest;
import com.ctse.product_catelog_service.dto.CategoryResponse;
import com.ctse.product_catelog_service.dto.SubCategoryCreateRequest;
import com.ctse.product_catelog_service.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@Tag(name = "Categories", description = "Product category management APIs")
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    @Operation(summary = "Get all categories")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAllCategories(HttpServletRequest httpRequest) {
        List<CategoryResponse> categories = categoryService.getAllCategories();
        return ResponseEntity.ok(response(HttpStatus.OK, "Categories fetched successfully", httpRequest.getRequestURI(), categories));
    }

    @PostMapping
    @Operation(summary = "Create category (Admin)")
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(
            @Valid @RequestBody CategoryCreateRequest request,
            HttpServletRequest httpRequest) {

        CategoryResponse category = categoryService.createCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(response(HttpStatus.CREATED, "Category created successfully", httpRequest.getRequestURI(), category));
    }

    @PostMapping("/{categoryId}/subcategories")
    @Operation(summary = "Create subcategory (Admin)")
    public ResponseEntity<ApiResponse<CategoryResponse>> addSubCategory(
            @PathVariable String categoryId,
            @Valid @RequestBody SubCategoryCreateRequest request,
            HttpServletRequest httpRequest) {

        CategoryResponse category = categoryService.addSubCategory(categoryId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(response(HttpStatus.CREATED, "Subcategory created successfully", httpRequest.getRequestURI(), category));
    }

    private <T> ApiResponse<T> response(HttpStatus status, String message, String path, T data) {
        return ApiResponse.<T>builder()
                .timestamp(Instant.now())
                .status(status.value())
                .message(message)
                .path(path)
                .data(data)
                .build();
    }
}
