package com.example.payment_service.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "payhere")
@Getter
@Setter
public class PayHereProperties {

    private boolean sandbox;
    private String merchantId;
    private String merchantSecret;
    private String currency;
    private String notifyUrl;
    private String returnUrl;
    private String cancelUrl;
    private String checkoutUrl;
}
