package com.ctse.product_catelog_service.service.impl;

import com.ctse.product_catelog_service.dto.ProductCreateRequest;
import com.ctse.product_catelog_service.dto.ProductResponse;
import com.ctse.product_catelog_service.dto.ProductUpdateRequest;
import com.ctse.product_catelog_service.exception.BadRequestException;
import com.ctse.product_catelog_service.exception.ResourceNotFoundException;
import com.ctse.product_catelog_service.model.Product;
import com.ctse.product_catelog_service.repository.ProductRepository;
import com.ctse.product_catelog_service.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;

    @Override
    public ProductResponse createProduct(ProductCreateRequest request) {
        Product product = Product.builder()
                .name(request.getName().trim())
                .slug(request.getSlug().trim())
                .description(request.getDescription().trim())
                .category(request.getCategory().trim())
                .subCategory(request.getSubCategory() == null ? null : request.getSubCategory().trim())
                .price(request.getPrice())
                .stockQuantity(request.getStockQuantity())
                .imageUrl(request.getImageUrl())
                .rating(request.getRating() == null ? 0.0 : request.getRating())
                .reviewCount(request.getReviewCount() == null ? 0 : request.getReviewCount())
                .gallery(normalizeList(request.getGallery()))
                .colorOptions(normalizeList(request.getColorOptions()))
                .sizes(normalizeList(request.getSizes()))
                .active(request.getActive() == null || request.getActive())
                .build();

        return toResponse(productRepository.save(product));
    }

    @Override
    public ProductResponse updateProduct(String productId, ProductUpdateRequest request) {
        Product existing = getProductOrThrow(productId);

        existing.setName(request.getName().trim());
        existing.setSlug(request.getSlug().trim());
        existing.setDescription(request.getDescription().trim());
        existing.setCategory(request.getCategory().trim());
        existing.setSubCategory(request.getSubCategory() == null ? null : request.getSubCategory().trim());
        existing.setPrice(request.getPrice() == null ? existing.getPrice() : request.getPrice());
        existing.setStockQuantity(request.getStockQuantity() == null ? existing.getStockQuantity() : request.getStockQuantity());
        existing.setImageUrl(request.getImageUrl() == null ? existing.getImageUrl() : request.getImageUrl());
        existing.setRating(request.getRating() == null ? existing.getRating() : request.getRating());
        existing.setReviewCount(request.getReviewCount() == null ? existing.getReviewCount() : request.getReviewCount());
        existing.setGallery(normalizeList(request.getGallery()));
        existing.setColorOptions(normalizeList(request.getColorOptions()));
        existing.setSizes(normalizeList(request.getSizes()));
        existing.setActive(request.getActive() == null || request.getActive());

        return toResponse(productRepository.save(existing));
    }

    @Override
    public void deleteProduct(String productId) {
        Product product = getProductOrThrow(productId);
        productRepository.delete(product);
    }

    @Override
    public ProductResponse getProductById(String productId) {
        return toResponse(getActiveProductOrThrow(productId));
    }

    @Override
    public ProductResponse getProductBySlug(String slug) {
        Product product = productRepository.findBySlugAndActiveTrue(slug.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found for slug: " + slug));
        return toResponse(product);
    }

    @Override
    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll()
                .stream()
                .filter(Product::isActive)
                .map(this::toResponse)
                .toList();
    }

    @Override
    public List<ProductResponse> getAllProductsForAdmin() {
        return productRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public List<ProductResponse> getProductsByCategory(String category) {
        return productRepository.findByCategoryIgnoreCaseAndActiveTrue(category.trim())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public ProductResponse updateStock(String productId, Integer stockQuantity) {
        if (stockQuantity < 0) {
            throw new BadRequestException("Stock quantity cannot be negative");
        }

        Product product = getProductOrThrow(productId);
        product.setStockQuantity(stockQuantity);
        return toResponse(productRepository.save(product));
    }

    private Product getProductOrThrow(String productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + productId));
    }

    private Product getActiveProductOrThrow(String productId) {
        Product product = getProductOrThrow(productId);

        if (!product.isActive()) {
            throw new ResourceNotFoundException("Product is inactive: " + productId);
        }

        return product;
    }

    private ProductResponse toResponse(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .slug(product.getSlug())
                .description(product.getDescription())
                .category(product.getCategory())
                .subCategory(product.getSubCategory())
                .price(product.getPrice())
                .inStock(product.getStockQuantity() != null && product.getStockQuantity() > 0)
                .stockQuantity(product.getStockQuantity())
                .imageUrl(product.getImageUrl())
                .rating(product.getRating())
                .reviewCount(product.getReviewCount())
                .gallery(normalizeList(product.getGallery()))
                .colorOptions(normalizeList(product.getColorOptions()))
                .sizes(normalizeList(product.getSizes()))
                .active(product.isActive())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }

    private List<String> normalizeList(List<String> values) {
        if (values == null) {
            return List.of();
        }
        return values.stream()
                .filter(item -> item != null && !item.isBlank())
                .map(String::trim)
                .toList();
    }
}
