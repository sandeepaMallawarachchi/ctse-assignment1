package com.example.payment_service.service;

import com.example.payment_service.dto.request.PaymentResultCallbackRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
@RequiredArgsConstructor
public class CartOrderCallbackClient {

    private final RestTemplate restTemplate;

    @Value("${service.internal-key}")
    private String internalKey;

    public void notifyCartService(String callbackUrl, String paymentStatus, String transactionId, String message) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-Service-Key", internalKey);

        PaymentResultCallbackRequest body = new PaymentResultCallbackRequest(paymentStatus, transactionId, message);
        restTemplate.put(callbackUrl, new HttpEntity<>(body, headers));
    }
}
