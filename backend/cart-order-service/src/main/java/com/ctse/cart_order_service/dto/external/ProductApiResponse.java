package com.ctse.cart_order_service.dto.external;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Wrapper matching the ApiResponse<ProductResponse> envelope returned by
 * the Product Catalog Service: { "data": { ...ProductDto fields... } }
 */
@Data
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class ProductApiResponse {
    private ProductDto data;
}
