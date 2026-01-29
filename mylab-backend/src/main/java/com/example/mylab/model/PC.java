package com.example.mylab.model;

import jakarta.persistence.*;
import org.hibernate.annotations.NotFound;
import org.hibernate.annotations.NotFoundAction;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Entity
@Table(name = "pcs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PC {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = true)
    private String pcNumber; // e.g., "PC-01", "PC-02"

    @ManyToOne
    @JoinColumn(name = "lab_id", nullable = true)
    private Lab lab;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private PCStatus status; // WORKING, NON_WORKING, REPAIR_IN_PROGRESS
    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @NotFound(action = NotFoundAction.IGNORE)
    @JoinColumn(name = "pc_type_id", nullable = false)
    private PCType pcType;

    @OneToMany(mappedBy = "pc", cascade = CascadeType.ALL)
    private Set<Complaint> complaints;

    @OneToMany(mappedBy = "pc", cascade = CascadeType.ALL)
    private Set<DefectHistory> defectHistories;
}
