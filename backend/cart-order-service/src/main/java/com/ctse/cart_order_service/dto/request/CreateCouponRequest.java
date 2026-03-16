package com.ctse.cart_order_service.dto.request;

import com.ctse.cart_order_service.model.Coupon.CouponType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateCouponRequest {

    @NotBlank(message = "Coupon code is required")
    private String code;

    @NotNull(message = "Coupon type is required")
    private CouponType type;

    @NotNull(message = "Coupon value is required")
    @DecimalMin(value = "0.01", message = "Value must be greater than 0")
    private BigDecimal value;

    @DecimalMin(value = "0.0", message = "Minimum order amount must be 0 or greater")
    private BigDecimal minOrderAmount = BigDecimal.ZERO;

    /** 0 = unlimited. */
    private int maxUsageCount = 0;

    /** null = never expires. */
    private LocalDateTime expiresAt;
}
