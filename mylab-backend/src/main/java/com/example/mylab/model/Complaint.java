package com.example.mylab.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

import lombok.EqualsAndHashCode;

@Entity
@Table(name = "complaints")
@Data
@EqualsAndHashCode(exclude = {"pc", "user"})
@NoArgsConstructor
@AllArgsConstructor
public class Complaint {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "pc_id", nullable = false)
    private PC pc;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private ProblemType problemType;

    @Column(columnDefinition = "TEXT")
    private String description; // For "Other" problem type

    @Column(nullable = false)
    private LocalDateTime reportedAt;

    @Column
    private LocalDateTime resolvedAt;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private ComplaintStatus status; // PENDING, IN_PROGRESS, RESOLVED
}
