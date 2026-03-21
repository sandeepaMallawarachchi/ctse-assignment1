package com.ctse.cart_order_service.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Value("${server.port:8084}")
    private String serverPort;

    @Value("${service.gateway.url:http://localhost:8080}")
    private String gatewayUrl;

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Cart & Order Service API")
                        .description("""
                                Microservice responsible for managing shopping carts and orders.

                                **Order Status Flow:** CREATED → PAID → CONFIRMED → SHIPPED → DELIVERED

                                Communicates with:
                                - **Auth Service** – JWT token validation
                                - **Product Catalog Service** – product detail verification
                                - **Payment & Notification Service** – payment initiation and callbacks
                                """)
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("CTSE Assignment - Cart & Order Service")
                                .email("it22586766@my.sliit.lk")))
                .servers(List.of(
                        new Server()
                                .url(gatewayUrl)
                                .description("API Gateway (recommended)"),
                        new Server()
                                .url("http://localhost:" + serverPort)
                                .description("Direct — Local Development")))
                .addSecurityItem(new SecurityRequirement().addList("Bearer Authentication"))
                .components(new Components()
                        .addSecuritySchemes("Bearer Authentication",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("JWT token issued by the Auth Service")));
    }
}
