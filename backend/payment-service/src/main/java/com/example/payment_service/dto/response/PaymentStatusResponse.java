package com.example.payment_service.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Builder
public class PaymentStatusResponse {
    private String orderId;
    private String paymentReference;
    private String gatewayPaymentId;
    private String status;
    private String statusMessage;
    private BigDecimal amount;
    private String currency;
    private Instant createdAt;
    private Instant updatedAt;
}
