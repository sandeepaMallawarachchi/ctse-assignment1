package com.ctse.cart_order_service.controller;

import com.ctse.cart_order_service.dto.request.AddToCartRequest;
import com.ctse.cart_order_service.dto.request.ApplyCouponRequest;
import com.ctse.cart_order_service.dto.request.UpdateCartItemRequest;
import com.ctse.cart_order_service.dto.response.ApiResponse;
import com.ctse.cart_order_service.dto.response.CartResponse;
import com.ctse.cart_order_service.security.UserPrincipal;
import com.ctse.cart_order_service.service.CartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Cart", description = "Shopping cart management")
public class CartController {

    private final CartService cartService;

    @GetMapping
    @Operation(summary = "Get current user's cart")
    public ResponseEntity<ApiResponse<CartResponse>> getCart(Authentication auth) {
        CartResponse cart = cartService.getCart(principal(auth).getUserId());
        return ResponseEntity.ok(ApiResponse.success("Cart retrieved", cart));
    }

    @PostMapping("/items")
    @Operation(summary = "Add an item to the cart")
    public ResponseEntity<ApiResponse<CartResponse>> addItem(
            Authentication auth,
            @Valid @RequestBody AddToCartRequest request) {
        CartResponse cart = cartService.addItem(principal(auth).getUserId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Item added to cart", cart));
    }

    @PutMapping("/items/{productId}")
    @Operation(summary = "Update item quantity (set 0 to remove)")
    public ResponseEntity<ApiResponse<CartResponse>> updateItem(
            Authentication auth,
            @PathVariable String productId,
            @Valid @RequestBody UpdateCartItemRequest request) {
        CartResponse cart = cartService.updateItem(principal(auth).getUserId(), productId, request);
        return ResponseEntity.ok(ApiResponse.success("Cart item updated", cart));
    }

    @DeleteMapping("/items/{productId}")
    @Operation(summary = "Remove a specific item from the cart")
    public ResponseEntity<ApiResponse<CartResponse>> removeItem(
            Authentication auth,
            @PathVariable String productId) {
        CartResponse cart = cartService.removeItem(principal(auth).getUserId(), productId);
        return ResponseEntity.ok(ApiResponse.success("Item removed from cart", cart));
    }

    @DeleteMapping
    @Operation(summary = "Clear all items from the cart")
    public ResponseEntity<ApiResponse<Void>> clearCart(Authentication auth) {
        cartService.clearCart(principal(auth).getUserId());
        return ResponseEntity.ok(ApiResponse.success("Cart cleared", null));
    }

    @PostMapping("/coupons")
    @Operation(summary = "Apply a coupon to the cart")
    public ResponseEntity<ApiResponse<CartResponse>> applyCoupon(
            Authentication auth,
            @Valid @RequestBody ApplyCouponRequest request) {
        CartResponse cart = cartService.applyCoupon(principal(auth).getUserId(), request.getCode());
        return ResponseEntity.ok(ApiResponse.success("Coupon applied", cart));
    }

    @DeleteMapping("/coupons")
    @Operation(summary = "Remove the applied coupon from the cart")
    public ResponseEntity<ApiResponse<CartResponse>> removeCoupon(Authentication auth) {
        CartResponse cart = cartService.removeCoupon(principal(auth).getUserId());
        return ResponseEntity.ok(ApiResponse.success("Coupon removed", cart));
    }

    private UserPrincipal principal(Authentication auth) {
        return (UserPrincipal) auth.getPrincipal();
    }
}
