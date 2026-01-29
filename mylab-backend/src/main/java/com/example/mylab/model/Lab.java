package com.example.mylab.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Entity
@Table(name = "labs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Lab {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name; // e.g., "CE Lab 1", "IT Lab 2"

    @Column(nullable = false)
    private String department; // CE or IT

    @OneToMany(mappedBy = "lab", cascade = CascadeType.ALL)
    private Set<PC> pcs;
}
