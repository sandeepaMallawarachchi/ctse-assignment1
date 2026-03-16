package com.ctse.cart_order_service.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "carts")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Cart {

    @Id
    private String id;

    @Indexed(unique = true)
    private String userId;

    @Builder.Default
    private List<CartItem> items = new ArrayList<>();

    /** Code of the currently applied coupon, or null if none. */
    private String appliedCouponCode;

    /** Pre-calculated discount amount for the applied coupon. */
    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
