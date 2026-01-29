package com.example.mylab.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "pc_types", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"brand", "model", "production_year", "ram", "rom", "processor"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PCType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String brand;

    @Column(nullable = false)
    private String model;

    @Column(name = "production_year", nullable = false)
    private Integer productionYear;

    @Column(nullable = false)
    private String ram;

    @Column(nullable = false)
    private String rom;

    @Column(nullable = false)
    private String processor;

    @Column(name = "total_quantity", nullable = false)
    private Integer totalQuantity;
}

