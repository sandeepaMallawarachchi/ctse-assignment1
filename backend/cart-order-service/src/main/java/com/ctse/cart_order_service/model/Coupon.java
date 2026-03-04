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

@Document(collection = "coupons")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Coupon {

    @Id
    private String id;

    @Indexed(unique = true)
    private String code;

    /** PERCENTAGE → value is 0-100 (e.g. 10 = 10 %).
     *  FIXED_AMOUNT → value is absolute dollar amount to subtract. */
    private CouponType type;

    private BigDecimal value;

    /** Minimum cart subtotal required to apply this coupon. */
    @Builder.Default
    private BigDecimal minOrderAmount = BigDecimal.ZERO;

    /** 0 = unlimited. */
    @Builder.Default
    private int maxUsageCount = 0;

    @Builder.Default
    private int usageCount = 0;

    @Builder.Default
    private boolean active = true;

    /** null = never expires. */
    private LocalDateTime expiresAt;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public enum CouponType {
        PERCENTAGE, FIXED_AMOUNT
    }
}
