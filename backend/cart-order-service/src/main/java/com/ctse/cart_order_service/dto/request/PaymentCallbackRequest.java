package com.ctse.cart_order_service.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentCallbackRequest {
    // COMPLETED | FAILED
    private String paymentStatus;
    private String transactionId;
    private String message;
}
