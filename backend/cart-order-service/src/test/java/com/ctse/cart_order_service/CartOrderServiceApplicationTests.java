package com.ctse.cart_order_service;

import com.ctse.cart_order_service.model.OrderStatus;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Integration smoke tests – require a running MongoDB instance.
 * Start MongoDB locally or via docker-compose before running.
 */
@SpringBootTest
@ActiveProfiles("test")
class CartOrderServiceApplicationTests {

    @Test
    void contextLoads() {
        // Verifies the full Spring context starts without errors
    }

    @Test
    void orderStatusValues_containsRequiredStates() {
        assertThat(OrderStatus.values())
                .extracting(Enum::name)
                .contains("CREATED", "PAID", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED");
    }
}
