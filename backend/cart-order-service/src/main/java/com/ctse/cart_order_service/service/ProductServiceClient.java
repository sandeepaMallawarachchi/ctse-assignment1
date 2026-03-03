package com.ctse.cart_order_service.service;

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
            ResponseEntity<ProductDto> response = restTemplate.getForEntity(url, ProductDto.class);
            log.debug("Fetched product {} from catalog service", productId);
            return Optional.ofNullable(response.getBody());
        } catch (Exception e) {
            log.warn("Could not fetch product {} from catalog service: {}", productId, e.getMessage());
            return Optional.empty();
        }
    }
}
