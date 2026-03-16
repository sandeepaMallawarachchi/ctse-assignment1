package com.ctse.cart_order_service.service;

import com.ctse.cart_order_service.dto.external.ProductDto;
import com.ctse.cart_order_service.dto.request.AddToCartRequest;
import com.ctse.cart_order_service.dto.request.UpdateCartItemRequest;
import com.ctse.cart_order_service.dto.response.CartResponse;
import com.ctse.cart_order_service.exception.CartException;
import com.ctse.cart_order_service.exception.ResourceNotFoundException;
import com.ctse.cart_order_service.model.Cart;
import com.ctse.cart_order_service.model.CartItem;
import com.ctse.cart_order_service.repository.CartRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CartService {

    private final CartRepository cartRepository;
    private final ProductServiceClient productServiceClient;
    private final CouponService couponService;

    public CartResponse getCart(String userId) {
        Cart cart = getOrCreateCart(userId);
        return mapToResponse(cart);
    }

    public CartResponse addItem(String userId, AddToCartRequest request) {
        // Optionally verify product exists in the Product Catalog Service
        Optional<ProductDto> product = productServiceClient.getProduct(request.getProductId());
        if (product.isPresent() && !product.get().isActive()) {
            throw new CartException("Product is no longer available: " + request.getProductId());
        }

        // Use live price from catalog if available, otherwise trust client-provided price
        BigDecimal price = product.map(ProductDto::getPrice).orElse(request.getPrice());
        String productName = product.map(ProductDto::getName).orElse(request.getProductName());
        String imageUrl   = product.map(ProductDto::getImageUrl).orElse(request.getImageUrl());
        String category   = product.map(ProductDto::getCategory).orElse(request.getCategory());

        Cart cart = getOrCreateCart(userId);

        Optional<CartItem> existing = cart.getItems().stream()
                .filter(i -> i.getProductId().equals(request.getProductId()))
                .findFirst();

        if (existing.isPresent()) {
            existing.get().setQuantity(existing.get().getQuantity() + request.getQuantity());
            existing.get().setPrice(price);
        } else {
            cart.getItems().add(CartItem.builder()
                    .productId(request.getProductId())
                    .productName(productName)
                    .price(price)
                    .quantity(request.getQuantity())
                    .imageUrl(imageUrl)
                    .category(category)
                    .build());
        }

        recalculateDiscount(cart);
        return mapToResponse(cartRepository.save(cart));
    }

    public CartResponse updateItem(String userId, String productId, UpdateCartItemRequest request) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found for user: " + userId));

        if (request.getQuantity() == 0) {
            cart.getItems().removeIf(i -> i.getProductId().equals(productId));
        } else {
            CartItem item = cart.getItems().stream()
                    .filter(i -> i.getProductId().equals(productId))
                    .findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Product not found in cart: " + productId));
            item.setQuantity(request.getQuantity());
        }

        recalculateDiscount(cart);
        return mapToResponse(cartRepository.save(cart));
    }

    public CartResponse removeItem(String userId, String productId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found for user: " + userId));

        boolean removed = cart.getItems().removeIf(i -> i.getProductId().equals(productId));
        if (!removed) {
            throw new ResourceNotFoundException("Product not found in cart: " + productId);
        }

        recalculateDiscount(cart);
        return mapToResponse(cartRepository.save(cart));
    }

    public void clearCart(String userId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found for user: " + userId));
        cart.getItems().clear();
        cart.setAppliedCouponCode(null);
        cart.setDiscountAmount(BigDecimal.ZERO);
        cartRepository.save(cart);
        log.debug("Cart cleared for user: {}", userId);
    }

    // ── Coupon operations ─────────────────────────────────────────────────────

    public CartResponse applyCoupon(String userId, String code) {
        Cart cart = getOrCreateCart(userId);
        BigDecimal subtotal = computeSubtotal(cart);
        BigDecimal discount = couponService.calculateDiscount(code, subtotal);
        cart.setAppliedCouponCode(code.toUpperCase());
        cart.setDiscountAmount(discount);
        return mapToResponse(cartRepository.save(cart));
    }

    public CartResponse removeCoupon(String userId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found for user: " + userId));
        cart.setAppliedCouponCode(null);
        cart.setDiscountAmount(BigDecimal.ZERO);
        return mapToResponse(cartRepository.save(cart));
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private Cart getOrCreateCart(String userId) {
        return cartRepository.findByUserId(userId).orElseGet(() -> {
            Cart newCart = Cart.builder()
                    .userId(userId)
                    .items(new ArrayList<>())
                    .build();
            return cartRepository.save(newCart);
        });
    }

    private BigDecimal computeSubtotal(Cart cart) {
        return cart.getItems().stream()
                .map(i -> i.getPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private void recalculateDiscount(Cart cart) {
        if (cart.getAppliedCouponCode() == null) return;
        try {
            BigDecimal discount = couponService.calculateDiscount(
                    cart.getAppliedCouponCode(), computeSubtotal(cart));
            cart.setDiscountAmount(discount);
        } catch (Exception ex) {
            log.debug("Coupon '{}' invalidated after cart change: {}",
                    cart.getAppliedCouponCode(), ex.getMessage());
            cart.setAppliedCouponCode(null);
            cart.setDiscountAmount(BigDecimal.ZERO);
        }
    }

    private CartResponse mapToResponse(Cart cart) {
        List<CartResponse.CartItemResponse> itemResponses = cart.getItems().stream()
                .map(item -> CartResponse.CartItemResponse.builder()
                        .productId(item.getProductId())
                        .productName(item.getProductName())
                        .price(item.getPrice())
                        .quantity(item.getQuantity())
                        .itemTotal(item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                        .imageUrl(item.getImageUrl())
                        .category(item.getCategory())
                        .build())
                .toList();

        BigDecimal subtotal = itemResponses.stream()
                .map(CartResponse.CartItemResponse::getItemTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal discount = cart.getDiscountAmount() != null
                ? cart.getDiscountAmount() : BigDecimal.ZERO;

        int totalItems = cart.getItems().stream()
                .mapToInt(CartItem::getQuantity)
                .sum();

        return CartResponse.builder()
                .cartId(cart.getId())
                .userId(cart.getUserId())
                .items(itemResponses)
                .totalAmount(subtotal)
                .appliedCouponCode(cart.getAppliedCouponCode())
                .discountAmount(discount)
                .finalAmount(subtotal.subtract(discount))
                .totalItems(totalItems)
                .updatedAt(cart.getUpdatedAt())
                .build();
    }
}
