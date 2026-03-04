package com.ctse.cart_order_service.dto.response;

import com.ctse.cart_order_service.model.Coupon.CouponType;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class CouponResponse {
    private String id;
    private String code;
    private CouponType type;
    private BigDecimal value;
    private BigDecimal minOrderAmount;
    private int maxUsageCount;
    private int usageCount;
    private boolean active;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;
}
