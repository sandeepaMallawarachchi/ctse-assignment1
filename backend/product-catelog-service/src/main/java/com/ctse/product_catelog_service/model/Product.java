package com.ctse.product_catelog_service.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "products")
@CompoundIndexes({
        @CompoundIndex(name = "category_name_idx", def = "{'category': 1, 'name': 1}")
})
public class Product {

    @Id
    private String id;

    @Indexed
    private String name;

    @Indexed
    private String slug;

    private String description;

    @Indexed
    private String category;

    @Field(targetType = FieldType.DECIMAL128)
    private BigDecimal price;

    private Integer stockQuantity;

    private String imageUrl;

    @Builder.Default
    private Double rating = 0.0;

    @Builder.Default
    private Integer reviewCount = 0;

    @Builder.Default
    private List<String> breadcrumbs = new ArrayList<>();

    @Builder.Default
    private List<String> gallery = new ArrayList<>();

    @Builder.Default
    private List<String> colorOptions = new ArrayList<>();

    @Builder.Default
    private List<String> sizes = new ArrayList<>();

    @Builder.Default
    private boolean active = true;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
