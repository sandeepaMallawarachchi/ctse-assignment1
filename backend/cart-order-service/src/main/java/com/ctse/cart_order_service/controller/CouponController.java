package com.ctse.cart_order_service.controller;

import com.ctse.cart_order_service.dto.request.CreateCouponRequest;
import com.ctse.cart_order_service.dto.request.ValidateCouponRequest;
import com.ctse.cart_order_service.dto.response.ApiResponse;
import com.ctse.cart_order_service.dto.response.CouponResponse;
import com.ctse.cart_order_service.dto.response.ValidateCouponResponse;
import com.ctse.cart_order_service.service.CouponService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/coupons")
@RequiredArgsConstructor
@Tag(name = "Coupons", description = "Coupon management (admin) and lookup")
public class CouponController {

    private final CouponService couponService;

    @PostMapping("/validate")
    @Operation(summary = "Validate a coupon code and preview discount (public, no auth required)")
    public ResponseEntity<ApiResponse<ValidateCouponResponse>> validateCoupon(
            @Valid @RequestBody ValidateCouponRequest request) {
        ValidateCouponResponse result = couponService.validateCoupon(request.getCode(), request.getAmount());
        return ResponseEntity.ok(ApiResponse.success("Coupon is valid", result));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new coupon (admin only)")
    public ResponseEntity<ApiResponse<CouponResponse>> createCoupon(
            @Valid @RequestBody CreateCouponRequest request) {
        CouponResponse created = couponService.createCoupon(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Coupon created", created));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List all coupons (admin only)")
    public ResponseEntity<ApiResponse<List<CouponResponse>>> getAllCoupons() {
        return ResponseEntity.ok(ApiResponse.success("Coupons retrieved", couponService.getAllCoupons()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Deactivate a coupon (admin only)")
    public ResponseEntity<ApiResponse<CouponResponse>> deactivateCoupon(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success("Coupon deactivated", couponService.deactivateCoupon(id)));
    }
}
