package com.ctse.cart_order_service.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class OrderResponse {

    private String orderId;
    private String orderNumber;
    private String userId;
    private String userEmail;
    private List<OrderItemResponse> items;
    private ShippingAddressResponse shippingAddress;
    private String status;
    private BigDecimal subtotal;
    private BigDecimal tax;
    private BigDecimal shippingCost;
    private BigDecimal totalAmount;
    private String paymentStatus;
    private String paymentTransactionId;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @Builder
    public static class OrderItemResponse {
        private String productId;
        private String productName;
        private BigDecimal price;
        private int quantity;
        private BigDecimal subtotal;
    }

    @Data
    @Builder
    public static class ShippingAddressResponse {
        private String fullName;
        private String addressLine1;
        private String addressLine2;
        private String city;
        private String state;
        private String postalCode;
        private String country;
        private String phone;
    }
}
