package com.example.payment_service.service;

import com.example.payment_service.config.PayHereProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class PayHereSignatureService {

    private final PayHereProperties properties;

    public String generateRequestHash(String orderId, BigDecimal amount, String currency) {
        String formattedAmount = String.format(Locale.US, "%.2f", amount);
        String merchantSecretHash = md5(properties.getMerchantSecret()).toUpperCase(Locale.ROOT);
        return md5(properties.getMerchantId() + orderId + formattedAmount + currency + merchantSecretHash)
                .toUpperCase(Locale.ROOT);
    }

    public boolean isValidNotificationSignature(String merchantId,
                                                String orderId,
                                                String payhereAmount,
                                                String payhereCurrency,
                                                String statusCode,
                                                String md5sig) {
        String merchantSecretHash = md5(properties.getMerchantSecret()).toUpperCase(Locale.ROOT);
        String expected = md5(merchantId + orderId + payhereAmount + payhereCurrency + statusCode + merchantSecretHash)
                .toUpperCase(Locale.ROOT);
        return expected.equals(md5sig == null ? "" : md5sig.toUpperCase(Locale.ROOT));
    }

    private String md5(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("MD5");
            return HexFormat.of().formatHex(digest.digest(input.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception ex) {
            throw new IllegalStateException("Failed to generate MD5 hash", ex);
        }
    }
}
