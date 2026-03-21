package com.example.payment_service.service.impl;

import com.example.payment_service.config.PayHereProperties;
import com.example.payment_service.dto.request.InitiatePaymentRequest;
import com.example.payment_service.dto.response.PaymentInitializationResponse;
import com.example.payment_service.dto.response.PaymentStatusResponse;
import com.example.payment_service.exception.BadRequestException;
import com.example.payment_service.exception.ResourceNotFoundException;
import com.example.payment_service.exception.UnauthorizedException;
import com.example.payment_service.model.PaymentStatus;
import com.example.payment_service.model.PaymentTransaction;
import com.example.payment_service.repository.PaymentTransactionRepository;
import com.example.payment_service.service.CartOrderCallbackClient;
import com.example.payment_service.service.PayHereSignatureService;
import com.example.payment_service.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentTransactionRepository paymentTransactionRepository;
    private final PayHereProperties payHereProperties;
    private final PayHereSignatureService payHereSignatureService;
    private final CartOrderCallbackClient cartOrderCallbackClient;

    @Value("${service.internal-key}")
    private String internalKey;

    @Override
    public PaymentInitializationResponse initiatePayment(InitiatePaymentRequest request, String serviceKey) {
        validateInternalKey(serviceKey);
        validatePayHereConfiguration();

        PaymentTransaction transaction = paymentTransactionRepository.findByOrderId(request.getOrderId())
                .orElseGet(() -> PaymentTransaction.builder()
                        .orderId(request.getOrderId())
                        .paymentReference("PAY-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                        .build());

        transaction.setUserId(request.getUserId());
        transaction.setUserEmail(request.getUserEmail());
        transaction.setAmount(request.getAmount());
        transaction.setCurrency(request.getCurrency());
        transaction.setCallbackUrl(request.getCallbackUrl());
        transaction.setStatus(PaymentStatus.PENDING);
        transaction.setStatusMessage("Payment initiated");

        PaymentTransaction saved = paymentTransactionRepository.save(transaction);
        return toInitializationResponse(saved);
    }

    @Override
    public PaymentStatusResponse getPaymentByOrderId(String orderId) {
        PaymentTransaction transaction = paymentTransactionRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for order: " + orderId));
        return toStatusResponse(transaction);
    }

    @Override
    public PaymentInitializationResponse getCheckoutDetails(String orderId) {
        validatePayHereConfiguration();
        PaymentTransaction transaction = paymentTransactionRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for order: " + orderId));
        return toInitializationResponse(transaction);
    }

    @Override
    public void handlePayHereNotification(Map<String, String> payload) {
        String merchantId = value(payload, "merchant_id");
        String orderId = value(payload, "order_id");
        String payhereAmount = value(payload, "payhere_amount");
        String payhereCurrency = value(payload, "payhere_currency");
        String statusCode = value(payload, "status_code");
        String md5sig = value(payload, "md5sig");

        if (!payHereProperties.getMerchantId().equals(merchantId)) {
            throw new UnauthorizedException("Invalid merchant id");
        }
        if (!payHereSignatureService.isValidNotificationSignature(
                merchantId, orderId, payhereAmount, payhereCurrency, statusCode, md5sig)) {
            throw new UnauthorizedException("Invalid PayHere signature");
        }

        PaymentTransaction transaction = paymentTransactionRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for order: " + orderId));

        transaction.setGatewayPaymentId(payload.get("payment_id"));
        transaction.setPayHereStatusCode(statusCode);
        transaction.setPaymentMethod(payload.get("method"));
        transaction.setStatusMessage(payload.getOrDefault("status_message", "PayHere notification received"));

        PaymentStatus resolvedStatus = resolveStatus(statusCode);
        transaction.setStatus(resolvedStatus);

        PaymentTransaction saved = paymentTransactionRepository.save(transaction);
        cartOrderCallbackClient.notifyCartService(
                saved.getCallbackUrl(),
                mapCallbackStatus(resolvedStatus),
                saved.getGatewayPaymentId(),
                saved.getStatusMessage()
        );
    }

    private PaymentInitializationResponse toInitializationResponse(PaymentTransaction transaction) {
        return PaymentInitializationResponse.builder()
                .orderId(transaction.getOrderId())
                .paymentReference(transaction.getPaymentReference())
                .status(transaction.getStatus().name())
                .merchantId(payHereProperties.getMerchantId())
                .amount(transaction.getAmount())
                .currency(transaction.getCurrency())
                .hash(payHereSignatureService.generateRequestHash(
                        transaction.getOrderId(),
                        transaction.getAmount(),
                        transaction.getCurrency()))
                .notifyUrl(payHereProperties.getNotifyUrl())
                .returnUrl(payHereProperties.getReturnUrl())
                .cancelUrl(payHereProperties.getCancelUrl())
                .checkoutUrl(payHereProperties.getCheckoutUrl())
                .customerEmail(transaction.getUserEmail())
                .sandbox(payHereProperties.isSandbox())
                .build();
    }

    private PaymentStatusResponse toStatusResponse(PaymentTransaction transaction) {
        return PaymentStatusResponse.builder()
                .orderId(transaction.getOrderId())
                .paymentReference(transaction.getPaymentReference())
                .gatewayPaymentId(transaction.getGatewayPaymentId())
                .status(transaction.getStatus().name())
                .statusMessage(transaction.getStatusMessage())
                .amount(transaction.getAmount())
                .currency(transaction.getCurrency())
                .createdAt(transaction.getCreatedAt())
                .updatedAt(transaction.getUpdatedAt())
                .build();
    }

    private void validateInternalKey(String serviceKey) {
        if (serviceKey == null || !internalKey.equals(serviceKey)) {
            throw new UnauthorizedException("Invalid internal service key");
        }
    }

    private void validatePayHereConfiguration() {
        if (isBlank(payHereProperties.getMerchantId()) || isBlank(payHereProperties.getMerchantSecret())) {
            throw new BadRequestException("PayHere merchant configuration is missing");
        }
    }

    private String value(Map<String, String> payload, String key) {
        String value = payload.get(key);
        if (isBlank(value)) {
            throw new BadRequestException("Missing required PayHere field: " + key);
        }
        return value;
    }

    private PaymentStatus resolveStatus(String statusCode) {
        if ("2".equals(statusCode)) {
            return PaymentStatus.COMPLETED;
        }
        if ("0".equals(statusCode) || "-1".equals(statusCode) || "-2".equals(statusCode)) {
            return PaymentStatus.PENDING;
        }
        return PaymentStatus.FAILED;
    }

    private String mapCallbackStatus(PaymentStatus paymentStatus) {
        return paymentStatus == PaymentStatus.COMPLETED ? "COMPLETED" : "FAILED";
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
