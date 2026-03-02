package com.ctse.product_catelog_service.repository;

import com.ctse.product_catelog_service.model.Product;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ProductRepository extends MongoRepository<Product, String> {
    List<Product> findByCategoryIgnoreCaseAndActiveTrue(String category);

    List<Product> findByNameContainingIgnoreCaseAndActiveTrue(String name);
}
