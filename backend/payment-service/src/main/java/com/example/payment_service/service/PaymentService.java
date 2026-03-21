package com.example.payment_service.service;

import com.example.payment_service.dto.request.InitiatePaymentRequest;
import com.example.payment_service.dto.response.PaymentInitializationResponse;
import com.example.payment_service.dto.response.PaymentStatusResponse;

import java.util.Map;

public interface PaymentService {
    PaymentInitializationResponse initiatePayment(InitiatePaymentRequest request, String serviceKey);
    PaymentInitializationResponse getCheckoutDetails(String orderId);
    PaymentStatusResponse getPaymentByOrderId(String orderId);
    void handlePayHereNotification(Map<String, String> payload);
}
