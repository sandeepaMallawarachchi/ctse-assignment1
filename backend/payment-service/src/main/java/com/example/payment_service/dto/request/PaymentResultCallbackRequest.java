package com.example.payment_service.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PaymentResultCallbackRequest {
    private String paymentStatus;
    private String transactionId;
    private String message;
}
