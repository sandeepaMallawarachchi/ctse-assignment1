package com.ctse.cart_order_service.service;

import com.ctse.cart_order_service.dto.request.CreateOrderRequest;
import com.ctse.cart_order_service.dto.request.PaymentCallbackRequest;
import com.ctse.cart_order_service.dto.request.UpdateOrderStatusRequest;
import com.ctse.cart_order_service.dto.response.OrderResponse;
import com.ctse.cart_order_service.exception.CartException;
import com.ctse.cart_order_service.exception.ResourceNotFoundException;
import com.ctse.cart_order_service.model.*;
import com.ctse.cart_order_service.repository.CartRepository;
import com.ctse.cart_order_service.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final PaymentServiceClient paymentServiceClient;

    public OrderResponse createOrder(String userId, String userEmail, CreateOrderRequest request) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new CartException("No cart found for user: " + userId));

        if (cart.getItems().isEmpty()) {
            throw new CartException("Cannot create order from an empty cart");
        }

        // Map cart items → order items
        List<OrderItem> orderItems = cart.getItems().stream()
                .map(item -> {
                    BigDecimal subtotal = item.getPrice()
                            .multiply(BigDecimal.valueOf(item.getQuantity()));
                    return OrderItem.builder()
                            .productId(item.getProductId())
                            .productName(item.getProductName())
                            .price(item.getPrice())
                            .quantity(item.getQuantity())
                            .subtotal(subtotal)
                            .build();
                }).toList();

        // Totals
        BigDecimal subtotal = orderItems.stream()
                .map(OrderItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal tax = subtotal
                .multiply(new BigDecimal("0.10"))
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal shippingCost = subtotal.compareTo(new BigDecimal("50")) >= 0
                ? BigDecimal.ZERO
                : new BigDecimal("5.99");

        BigDecimal total = subtotal.add(tax).add(shippingCost);

        // Shipping address
        var addrDto = request.getShippingAddress();
        ShippingAddress shippingAddress = ShippingAddress.builder()
                .fullName(addrDto.getFullName())
                .addressLine1(addrDto.getAddressLine1())
                .addressLine2(addrDto.getAddressLine2())
                .city(addrDto.getCity())
                .state(addrDto.getState())
                .postalCode(addrDto.getPostalCode())
                .country(addrDto.getCountry())
                .phone(addrDto.getPhone())
                .build();

        Order order = Order.builder()
                .orderNumber(generateOrderNumber())
                .userId(userId)
                .userEmail(userEmail)
                .items(orderItems)
                .shippingAddress(shippingAddress)
                .status(OrderStatus.CREATED)
                .subtotal(subtotal)
                .tax(tax)
                .shippingCost(shippingCost)
                .totalAmount(total)
                .paymentStatus("PENDING")
                .notes(request.getNotes())
                .build();

        Order saved = orderRepository.save(order);
        log.info("Order created: {} for user: {}, total: {}", saved.getOrderNumber(), userId, total);

        // Notify Payment & Notification Service (non-blocking on failure)
        try {
            paymentServiceClient.initiatePayment(saved);
        } catch (Exception e) {
            log.error("Payment initiation failed for order {}; order still created: {}",
                    saved.getOrderNumber(), e.getMessage());
        }

        // Clear the cart
        cart.getItems().clear();
        cartRepository.save(cart);

        return mapToResponse(saved);
    }

    public OrderResponse getOrder(String orderId) {
        return mapToResponse(findOrder(orderId));
    }

    public List<OrderResponse> getOrdersByUser(String userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::mapToResponse).toList();
    }

    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::mapToResponse).toList();
    }

    public OrderResponse updateOrderStatus(String orderId, UpdateOrderStatusRequest request) {
        Order order = findOrder(orderId);
        order.setStatus(request.getStatus());
        if (request.getNotes() != null) {
            order.setNotes(request.getNotes());
        }
        return mapToResponse(orderRepository.save(order));
    }

    public OrderResponse handlePaymentCallback(String orderId, PaymentCallbackRequest callback) {
        Order order = findOrder(orderId);
        order.setPaymentStatus(callback.getPaymentStatus());
        order.setPaymentTransactionId(callback.getTransactionId());

        if ("COMPLETED".equalsIgnoreCase(callback.getPaymentStatus())) {
            order.setStatus(OrderStatus.PAID);
            log.info("Order {} marked as PAID, transaction: {}", orderId, callback.getTransactionId());
        } else if ("FAILED".equalsIgnoreCase(callback.getPaymentStatus())) {
            log.warn("Payment FAILED for order {}: {}", orderId, callback.getMessage());
        }

        return mapToResponse(orderRepository.save(order));
    }

    public OrderResponse cancelOrder(String orderId, String userId) {
        Order order = findOrder(orderId);

        if (!order.getUserId().equals(userId)) {
            throw new CartException("You are not authorized to cancel this order");
        }
        if (order.getStatus() == OrderStatus.SHIPPED
                || order.getStatus() == OrderStatus.DELIVERED) {
            throw new CartException("Cannot cancel an order that has already been shipped or delivered");
        }

        order.setStatus(OrderStatus.CANCELLED);
        return mapToResponse(orderRepository.save(order));
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private Order findOrder(String orderId) {
        return orderRepository.findById(orderId)
                .or(() -> orderRepository.findByOrderNumber(orderId))
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));
    }

    private String generateOrderNumber() {
        String date   = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String suffix = String.format("%05d", new Random().nextInt(99999));
        return "ORD-" + date + "-" + suffix;
    }

    private OrderResponse mapToResponse(Order order) {
        List<OrderResponse.OrderItemResponse> items = order.getItems().stream()
                .map(i -> OrderResponse.OrderItemResponse.builder()
                        .productId(i.getProductId())
                        .productName(i.getProductName())
                        .price(i.getPrice())
                        .quantity(i.getQuantity())
                        .subtotal(i.getSubtotal())
                        .build())
                .toList();

        ShippingAddress a = order.getShippingAddress();
        OrderResponse.ShippingAddressResponse addr = OrderResponse.ShippingAddressResponse.builder()
                .fullName(a.getFullName())
                .addressLine1(a.getAddressLine1())
                .addressLine2(a.getAddressLine2())
                .city(a.getCity())
                .state(a.getState())
                .postalCode(a.getPostalCode())
                .country(a.getCountry())
                .phone(a.getPhone())
                .build();

        return OrderResponse.builder()
                .orderId(order.getId())
                .orderNumber(order.getOrderNumber())
                .userId(order.getUserId())
                .userEmail(order.getUserEmail())
                .items(items)
                .shippingAddress(addr)
                .status(order.getStatus().name())
                .subtotal(order.getSubtotal())
                .tax(order.getTax())
                .shippingCost(order.getShippingCost())
                .totalAmount(order.getTotalAmount())
                .paymentStatus(order.getPaymentStatus())
                .paymentTransactionId(order.getPaymentTransactionId())
                .notes(order.getNotes())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }
}
