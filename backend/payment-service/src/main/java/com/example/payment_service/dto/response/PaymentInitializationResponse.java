package com.example.payment_service.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class PaymentInitializationResponse {
    private String orderId;
    private String paymentReference;
    private String status;
    private String merchantId;
    private BigDecimal amount;
    private String currency;
    private String hash;
    private String notifyUrl;
    private String returnUrl;
    private String cancelUrl;
    private String checkoutUrl;
    private String customerEmail;
    private boolean sandbox;
}
