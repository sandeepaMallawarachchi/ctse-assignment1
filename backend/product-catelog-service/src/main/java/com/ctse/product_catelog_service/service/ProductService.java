package com.ctse.product_catelog_service.service;

import com.ctse.product_catelog_service.dto.ProductCreateRequest;
import com.ctse.product_catelog_service.dto.ProductResponse;
import com.ctse.product_catelog_service.dto.ProductUpdateRequest;

import java.util.List;

public interface ProductService {
    ProductResponse createProduct(ProductCreateRequest request);

    ProductResponse updateProduct(String productId, ProductUpdateRequest request);

    void deleteProduct(String productId);

    ProductResponse getProductById(String productId);

    List<ProductResponse> getAllProducts();

    List<ProductResponse> getProductsByCategory(String category);

    List<ProductResponse> searchProductsByName(String name);

    ProductResponse updateStock(String productId, Integer stockQuantity);
}
