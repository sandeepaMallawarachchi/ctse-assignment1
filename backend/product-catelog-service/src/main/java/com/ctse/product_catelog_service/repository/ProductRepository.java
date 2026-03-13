package com.ctse.product_catelog_service.repository;

import com.ctse.product_catelog_service.model.Product;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends MongoRepository<Product, String> {
    List<Product> findByCategoryIgnoreCaseAndActiveTrue(String category);

    Optional<Product> findBySlugAndActiveTrue(String slug);
}
