package com.example.payment_service.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "payment_transactions")
public class PaymentTransaction {

    @Id
    private String id;

    @Indexed(unique = true)
    private String orderId;

    private String userId;
    private String userEmail;
    private BigDecimal amount;
    private String currency;
    private String callbackUrl;
    private String paymentReference;
    private String gatewayPaymentId;
    private String payHereStatusCode;
    private String statusMessage;
    private String paymentMethod;

    @Builder.Default
    private PaymentStatus status = PaymentStatus.PENDING;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
