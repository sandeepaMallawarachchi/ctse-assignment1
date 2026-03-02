package com.ctse.product_catelog_service.config;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Getter
@Setter
@Validated
@ConfigurationProperties(prefix = "app.aws.s3")
public class S3Properties {

    @NotBlank
    private String region;

    @NotBlank
    private String bucket;

    private String accessKey;

    private String secretKey;

    private String keyPrefix = "products";
}
