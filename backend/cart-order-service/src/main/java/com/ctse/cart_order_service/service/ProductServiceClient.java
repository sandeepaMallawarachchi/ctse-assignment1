package com.ctse.cart_order_service.service;

import com.ctse.cart_order_service.dto.external.ProductApiResponse;
import com.ctse.cart_order_service.dto.external.ProductDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Optional;

/**
 * Client for communicating with the Product Catalog Service.
 * Used to verify product details when adding items to a cart.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ProductServiceClient {

    private final RestTemplate restTemplate;

    @Value("${service.product-catalog.url}")
    private String productCatalogUrl;

    public Optional<ProductDto> getProduct(String productId) {
        try {
            String url = productCatalogUrl + "/api/products/" + productId;
            // Catalog wraps responses in ApiResponse<ProductResponse> — unwrap via ProductApiResponse
            ResponseEntity<ProductApiResponse> response =
                    restTemplate.getForEntity(url, ProductApiResponse.class);
            ProductApiResponse body = response.getBody();
            if (body == null || body.getData() == null) {
                log.warn("Empty response for product {} from catalog service", productId);
                return Optional.empty();
            }
            log.debug("Fetched product {} from catalog service", productId);
            return Optional.of(body.getData());
        } catch (Exception e) {
            log.warn("Could not fetch product {} from catalog service: {}", productId, e.getMessage());
            return Optional.empty();
        }
    }
}
