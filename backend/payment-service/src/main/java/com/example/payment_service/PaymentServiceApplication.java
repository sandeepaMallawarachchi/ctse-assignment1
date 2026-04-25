package com.example.payment_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

@SpringBootApplication
@EnableMongoAuditing
public class PaymentServiceApplication {

	//main class
	public static void main(String[] args) {
		SpringApplication.run(PaymentServiceApplication.class, args);
	}

}
