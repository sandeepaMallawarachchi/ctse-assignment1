package com.example.payment_service.controller;

import com.example.payment_service.dto.ApiResponse;
import com.example.payment_service.dto.request.InitiatePaymentRequest;
import com.example.payment_service.dto.response.PaymentInitializationResponse;
import com.example.payment_service.dto.response.PaymentStatusResponse;
import com.example.payment_service.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
@Tag(name = "Payment", description = "PayHere integration APIs")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/initiate")
    @Operation(summary = "Initiate a payment for an order [INTERNAL]")
    public ResponseEntity<ApiResponse<PaymentInitializationResponse>> initiatePayment(
            @RequestHeader("X-Service-Key") String serviceKey,
            @Valid @RequestBody InitiatePaymentRequest request,
            HttpServletRequest httpRequest) {

        PaymentInitializationResponse response = paymentService.initiatePayment(request, serviceKey);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(body(HttpStatus.CREATED, "Payment initiated successfully", httpRequest.getRequestURI(), response));
    }

    @GetMapping("/order")
    @Operation(summary = "Get payment status by order ID")
    public ResponseEntity<ApiResponse<PaymentStatusResponse>> getPaymentByOrderId(
            @RequestParam String orderId,
            HttpServletRequest httpRequest) {

        PaymentStatusResponse response = paymentService.getPaymentByOrderId(orderId);
        return ResponseEntity.ok(body(HttpStatus.OK, "Payment fetched successfully", httpRequest.getRequestURI(), response));
    }

    @GetMapping("/checkout")
    @Operation(summary = "Get PayHere checkout payload by order ID")
    public ResponseEntity<ApiResponse<PaymentInitializationResponse>> getCheckoutDetails(
            @RequestParam String orderId,
            HttpServletRequest httpRequest) {

        PaymentInitializationResponse response = paymentService.getCheckoutDetails(orderId);
        return ResponseEntity.ok(body(HttpStatus.OK, "Checkout payload fetched successfully", httpRequest.getRequestURI(), response));
    }

    @PostMapping("/notify")
    @Operation(summary = "PayHere notify_url endpoint")
    public ResponseEntity<String> notifyPayment(@RequestParam MultiValueMap<String, String> formData) {
        Map<String, String> payload = formData.toSingleValueMap();
        paymentService.handlePayHereNotification(payload);
        return ResponseEntity.ok("OK");
    }

    @GetMapping("/return")
    @Operation(summary = "Return URL after payment success")
    public ResponseEntity<String> returnUrl() {
        return ResponseEntity.ok("Payment flow returned successfully. Check order status from the frontend.");
    }

    @GetMapping("/cancel")
    @Operation(summary = "Cancel URL after payment cancellation")
    public ResponseEntity<String> cancelUrl() {
        return ResponseEntity.ok("Payment was cancelled.");
    }

    private <T> ApiResponse<T> body(HttpStatus status, String message, String path, T data) {
        return ApiResponse.<T>builder()
                .timestamp(Instant.now())
                .status(status.value())
                .message(message)
                .path(path)
                .data(data)
                .build();
    }
}
