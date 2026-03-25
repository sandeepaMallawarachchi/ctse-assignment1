package com.ctse.auth_service.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

// connect with mongodb
@Configuration
@EnableMongoAuditing
public class MongoConfig {
}
