package com.ctse.cart_order_service.service;

import com.ctse.cart_order_service.dto.request.CreateCouponRequest;
import com.ctse.cart_order_service.dto.response.CouponResponse;
import com.ctse.cart_order_service.dto.response.ValidateCouponResponse;
import com.ctse.cart_order_service.exception.CartException;
import com.ctse.cart_order_service.exception.ResourceNotFoundException;
import com.ctse.cart_order_service.model.Coupon;
import com.ctse.cart_order_service.repository.CouponRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CouponService {

    private final CouponRepository couponRepository;

    // ── Admin operations ──────────────────────────────────────────────────────

    public CouponResponse createCoupon(CreateCouponRequest request) {
        if (couponRepository.existsByCodeIgnoreCase(request.getCode())) {
            throw new CartException("Coupon code already exists: " + request.getCode());
        }
        Coupon coupon = Coupon.builder()
                .code(request.getCode().toUpperCase())
                .type(request.getType())
                .value(request.getValue())
                .minOrderAmount(request.getMinOrderAmount() != null
                        ? request.getMinOrderAmount() : BigDecimal.ZERO)
                .maxUsageCount(request.getMaxUsageCount())
                .expiresAt(request.getExpiresAt())
                .build();

        return toResponse(couponRepository.save(coupon));
    }

    public List<CouponResponse> getAllCoupons() {
        return couponRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public CouponResponse deactivateCoupon(String id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found: " + id));
        coupon.setActive(false);
        return toResponse(couponRepository.save(coupon));
    }

    // ── Validation (used by CartService) ──────────────────────────────────────

    /**
     * Validates the coupon code against the given order subtotal and returns the
     * discount amount. Does NOT increment usageCount – call {@link #redeemCoupon}
     * only when the order is actually placed.
     */
    public BigDecimal calculateDiscount(String code, BigDecimal subtotal) {
        Coupon coupon = findAndValidate(code, subtotal);
        return computeDiscount(coupon, subtotal);
    }

    /**
     * Validates, computes discount, and increments usageCount.
     * Call this when an order is confirmed.
     */
    public BigDecimal redeemCoupon(String code, BigDecimal subtotal) {
        Coupon coupon = findAndValidate(code, subtotal);
        BigDecimal discount = computeDiscount(coupon, subtotal);
        coupon.setUsageCount(coupon.getUsageCount() + 1);
        couponRepository.save(coupon);
        log.info("Coupon '{}' redeemed (usage {}/{})", code,
                coupon.getUsageCount(),
                coupon.getMaxUsageCount() == 0 ? "∞" : coupon.getMaxUsageCount());
        return discount;
    }

    /** Validates a coupon and returns the discount breakdown without persisting anything.
     *  Safe to call unauthenticated (e.g. guest users). */
    public ValidateCouponResponse validateCoupon(String code, BigDecimal amount) {
        Coupon coupon = findAndValidate(code, amount);
        BigDecimal discount = computeDiscount(coupon, amount);
        return ValidateCouponResponse.builder()
                .code(coupon.getCode())
                .originalAmount(amount)
                .discountAmount(discount)
                .finalAmount(amount.subtract(discount))
                .build();
    }

    /** Returns the CouponResponse for the given code (for informational display). */
    public CouponResponse getCouponByCode(String code) {
        return toResponse(couponRepository.findByCodeIgnoreCase(code)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found: " + code)));
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Coupon findAndValidate(String code, BigDecimal subtotal) {
        Coupon coupon = couponRepository.findByCodeIgnoreCase(code)
                .orElseThrow(() -> new CartException("Invalid coupon code: " + code));

        if (!coupon.isActive()) {
            throw new CartException("Coupon is no longer active: " + code);
        }
        if (coupon.getExpiresAt() != null && LocalDateTime.now().isAfter(coupon.getExpiresAt())) {
            throw new CartException("Coupon has expired: " + code);
        }
        if (coupon.getMaxUsageCount() > 0 && coupon.getUsageCount() >= coupon.getMaxUsageCount()) {
            throw new CartException("Coupon usage limit reached: " + code);
        }
        if (subtotal.compareTo(coupon.getMinOrderAmount()) < 0) {
            throw new CartException(String.format(
                    "Minimum order amount of $%.2f required for coupon '%s'",
                    coupon.getMinOrderAmount(), code));
        }
        return coupon;
    }

    private BigDecimal computeDiscount(Coupon coupon, BigDecimal subtotal) {
        return switch (coupon.getType()) {
            case PERCENTAGE -> subtotal
                    .multiply(coupon.getValue())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            case FIXED_AMOUNT -> coupon.getValue().min(subtotal); // can't discount more than total
        };
    }

    private CouponResponse toResponse(Coupon c) {
        return CouponResponse.builder()
                .id(c.getId())
                .code(c.getCode())
                .type(c.getType())
                .value(c.getValue())
                .minOrderAmount(c.getMinOrderAmount())
                .maxUsageCount(c.getMaxUsageCount())
                .usageCount(c.getUsageCount())
                .active(c.isActive())
                .expiresAt(c.getExpiresAt())
                .createdAt(c.getCreatedAt())
                .build();
    }
}
