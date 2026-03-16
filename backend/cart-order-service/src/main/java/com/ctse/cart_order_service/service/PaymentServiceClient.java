package com.ctse.cart_order_service.service;

import com.ctse.cart_order_service.model.Order;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

/**
 * Client for communicating with the Payment & Notification Service.
 * Called after an order is successfully created to initiate payment.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceClient {

    private final RestTemplate restTemplate;

    @Value("${service.payment.url}")
    private String paymentServiceUrl;

    @Value("${service.internal-key}")
    private String internalServiceKey;

    public void initiatePayment(Order order) {
        String url = paymentServiceUrl + "/api/payment/initiate";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-Service-Key", internalServiceKey);

        Map<String, Object> body = Map.of(
                "orderId",      order.getOrderNumber(),
                "userId",       order.getUserId(),
                "userEmail",    order.getUserEmail() != null ? order.getUserEmail() : "",
                "amount",       order.getTotalAmount(),
                "currency",     "USD",
                "callbackUrl",  "http://cart-order-service:8082/api/orders/"
                                        + order.getOrderNumber() + "/payment-callback"
        );

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            restTemplate.postForEntity(url, entity, Void.class);
            log.info("Payment initiated for order: {}, amount: {}",
                    order.getOrderNumber(), order.getTotalAmount());
        } catch (Exception e) {
            log.error("Failed to initiate payment for order {}: {}",
                    order.getOrderNumber(), e.getMessage());
            throw new RuntimeException("Payment service unavailable: " + e.getMessage(), e);
        }
    }
}
