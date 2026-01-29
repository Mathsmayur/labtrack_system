package com.example.mylab.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BulkPCRequest {
    private String brand;
    private String model;
    private Integer productionYear;
    private String ram;
    private String rom;
    private String processor;
    private Integer quantity;
    private Long labId; // optional - if provided, assign newly created PCs to this lab
}

