package com.ctse.product_catelog_service.controller;

import com.ctse.product_catelog_service.dto.ApiResponse;
import com.ctse.product_catelog_service.dto.ImageUploadResponse;
import com.ctse.product_catelog_service.dto.ProductCreateRequest;
import com.ctse.product_catelog_service.dto.ProductResponse;
import com.ctse.product_catelog_service.dto.ProductUpdateRequest;
import com.ctse.product_catelog_service.dto.StockUpdateRequest;
import com.ctse.product_catelog_service.service.ProductService;
import com.ctse.product_catelog_service.storage.ImageStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Tag(name = "Products", description = "Product Catalog Service APIs")
public class ProductController {

    private final ProductService productService;
    private final ImageStorageService imageStorageService;

    @PostMapping
    @Operation(summary = "Create product (Admin)")
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(
            @Valid @RequestBody ProductCreateRequest request,
            HttpServletRequest httpRequest) {

        ProductResponse product = productService.createProduct(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(response(HttpStatus.CREATED, "Product created successfully", httpRequest.getRequestURI(), product));
    }

    @PutMapping("/{productId}")
    @Operation(summary = "Update product (Admin)")
    public ResponseEntity<ApiResponse<ProductResponse>> updateProduct(
            @PathVariable String productId,
            @Valid @RequestBody ProductUpdateRequest request,
            HttpServletRequest httpRequest) {

        ProductResponse product = productService.updateProduct(productId, request);
        return ResponseEntity.ok(response(HttpStatus.OK, "Product updated successfully", httpRequest.getRequestURI(), product));
    }

    @DeleteMapping("/{productId}")
    @Operation(summary = "Delete product (Admin)")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(
            @PathVariable String productId,
            HttpServletRequest httpRequest) {

        productService.deleteProduct(productId);
        return ResponseEntity.ok(response(HttpStatus.OK, "Product deleted successfully", httpRequest.getRequestURI(), null));
    }

    @GetMapping("/{productId}")
    @Operation(summary = "Get product by ID")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductById(
            @PathVariable String productId,
            HttpServletRequest httpRequest) {

        ProductResponse product = productService.getProductById(productId);
        return ResponseEntity.ok(response(HttpStatus.OK, "Product fetched successfully", httpRequest.getRequestURI(), product));
    }

    @GetMapping("/slug/{slug}")
    @Operation(summary = "Get product by slug")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductBySlug(
            @PathVariable String slug,
            HttpServletRequest httpRequest) {

        ProductResponse product = productService.getProductBySlug(slug);
        return ResponseEntity.ok(response(HttpStatus.OK, "Product fetched successfully", httpRequest.getRequestURI(), product));
    }

    @GetMapping
    @Operation(summary = "Get all products")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getAllProducts(HttpServletRequest httpRequest) {
        List<ProductResponse> products = productService.getAllProducts();
        return ResponseEntity.ok(response(HttpStatus.OK, "Products fetched successfully", httpRequest.getRequestURI(), products));
    }

    @GetMapping("/admin/all")
    @Operation(summary = "Get all products for admin")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getAllProductsForAdmin(HttpServletRequest httpRequest) {
        List<ProductResponse> products = productService.getAllProductsForAdmin();
        return ResponseEntity.ok(response(HttpStatus.OK, "Products fetched successfully", httpRequest.getRequestURI(), products));
    }

    @GetMapping("/category/{category}")
    @Operation(summary = "Get products by category")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getProductsByCategory(
            @PathVariable String category,
            HttpServletRequest httpRequest) {

        List<ProductResponse> products = productService.getProductsByCategory(category);
        return ResponseEntity.ok(response(HttpStatus.OK, "Products fetched successfully", httpRequest.getRequestURI(), products));
    }

    @PatchMapping("/{productId}/stock")
    @Operation(summary = "Update stock (Admin)")
    public ResponseEntity<ApiResponse<ProductResponse>> updateStock(
            @PathVariable String productId,
            @Valid @RequestBody StockUpdateRequest request,
            HttpServletRequest httpRequest) {

        ProductResponse product = productService.updateStock(productId, request.getStockQuantity());
        return ResponseEntity.ok(response(HttpStatus.OK, "Stock updated successfully", httpRequest.getRequestURI(), product));
    }

    @PostMapping(value = "/images", consumes = "multipart/form-data")
    @Operation(summary = "Upload product image to S3 (Admin)")
    public ResponseEntity<ApiResponse<ImageUploadResponse>> uploadProductImage(
            @RequestPart("file") MultipartFile file,
            HttpServletRequest httpRequest) {

        ImageUploadResponse upload = imageStorageService.uploadProductImage(file);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(response(HttpStatus.CREATED, "Image uploaded successfully", httpRequest.getRequestURI(), upload));
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
