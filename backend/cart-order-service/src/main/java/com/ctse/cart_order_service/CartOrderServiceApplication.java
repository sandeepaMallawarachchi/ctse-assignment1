package com.ctse.cart_order_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

@SpringBootApplication
@EnableMongoAuditing
public class CartOrderServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(CartOrderServiceApplication.class, args);
	}

}
