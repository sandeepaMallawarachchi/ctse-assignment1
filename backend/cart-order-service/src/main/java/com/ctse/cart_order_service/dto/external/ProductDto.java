package com.ctse.cart_order_service.dto.external;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class ProductDto {
    private String id;
    private String name;
    private BigDecimal price;
    private int stockCount;
    private String category;
    private String imageUrl;
    private Boolean active;  // Boolean wrapper — null means unknown, not inactive
}
