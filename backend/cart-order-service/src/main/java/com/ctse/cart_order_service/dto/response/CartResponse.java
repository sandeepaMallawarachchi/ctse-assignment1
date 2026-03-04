package com.ctse.cart_order_service.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class CartResponse {

    private String cartId;
    private String userId;
    private List<CartItemResponse> items;
    private BigDecimal totalAmount;
    private int totalItems;
    private LocalDateTime updatedAt;

    @Data
    @Builder
    public static class CartItemResponse {
        private String productId;
        private String productName;
        private BigDecimal price;
        private int quantity;
        private BigDecimal itemTotal;
        private String imageUrl;
        private String category;
    }
}
