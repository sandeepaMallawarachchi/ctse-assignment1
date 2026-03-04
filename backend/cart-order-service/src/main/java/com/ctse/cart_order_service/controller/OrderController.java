package com.ctse.cart_order_service.controller;

import com.ctse.cart_order_service.dto.request.CreateOrderRequest;
import com.ctse.cart_order_service.dto.request.PaymentCallbackRequest;
import com.ctse.cart_order_service.dto.request.UpdateOrderStatusRequest;
import com.ctse.cart_order_service.dto.response.ApiResponse;
import com.ctse.cart_order_service.dto.response.OrderResponse;
import com.ctse.cart_order_service.exception.CartException;
import com.ctse.cart_order_service.security.UserPrincipal;
import com.ctse.cart_order_service.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Orders", description = "Order management")
public class OrderController {

    private final OrderService orderService;

    @Value("${service.internal-key}")
    private String internalServiceKey;

    // ── User endpoints ────────────────────────────────────────────────────────

    @PostMapping
    @Operation(summary = "Create an order from the current cart")
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(
            Authentication auth,
            @Valid @RequestBody CreateOrderRequest request) {
        UserPrincipal p = principal(auth);
        OrderResponse order = orderService.createOrder(p.getUserId(), p.getEmail(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Order created successfully", order));
    }

    @GetMapping("/my-orders")
    @Operation(summary = "Get all orders for the authenticated user")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getMyOrders(Authentication auth) {
        List<OrderResponse> orders = orderService.getOrdersByUser(principal(auth).getUserId());
        return ResponseEntity.ok(ApiResponse.success("Orders retrieved", orders));
    }

    @GetMapping("/{orderId}")
    @Operation(summary = "Get a specific order by ID or order number")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrder(
            Authentication auth,
            @PathVariable String orderId) {
        UserPrincipal p = principal(auth);
        OrderResponse order = orderService.getOrder(orderId);

        // Users can only access their own orders; admins can access any
        if (!order.getUserId().equals(p.getUserId()) && !p.isAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Access denied"));
        }
        return ResponseEntity.ok(ApiResponse.success("Order retrieved", order));
    }

    @PutMapping("/{orderId}/cancel")
    @Operation(summary = "Cancel an order (owner only, if not yet shipped)")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(
            Authentication auth,
            @PathVariable String orderId) {
        OrderResponse order = orderService.cancelOrder(orderId, principal(auth).getUserId());
        return ResponseEntity.ok(ApiResponse.success("Order cancelled", order));
    }

    // ── Admin endpoints ───────────────────────────────────────────────────────

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "[ADMIN] Get all orders")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getAllOrders() {
        List<OrderResponse> orders = orderService.getAllOrders();
        return ResponseEntity.ok(ApiResponse.success("All orders retrieved", orders));
    }

    @PutMapping("/{orderId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "[ADMIN] Update order status (CONFIRMED, SHIPPED, DELIVERED, etc.)")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrderStatus(
            @PathVariable String orderId,
            @Valid @RequestBody UpdateOrderStatusRequest request) {
        OrderResponse order = orderService.updateOrderStatus(orderId, request);
        return ResponseEntity.ok(ApiResponse.success("Order status updated to " + request.getStatus(), order));
    }

    // ── Inter-service callback (Payment & Notification Service → this service) ─

    @PutMapping("/{orderId}/payment-callback")
    @Operation(summary = "[INTERNAL] Payment result callback from Payment Service")
    public ResponseEntity<ApiResponse<OrderResponse>> paymentCallback(
            @PathVariable String orderId,
            @RequestHeader("X-Service-Key") String serviceKey,
            @RequestBody PaymentCallbackRequest callback) {

        if (!internalServiceKey.equals(serviceKey)) {
            throw new CartException("Invalid internal service key");
        }

        OrderResponse order = orderService.handlePaymentCallback(orderId, callback);
        return ResponseEntity.ok(ApiResponse.success("Payment callback processed", order));
    }

    private UserPrincipal principal(Authentication auth) {
        return (UserPrincipal) auth.getPrincipal();
    }
}
