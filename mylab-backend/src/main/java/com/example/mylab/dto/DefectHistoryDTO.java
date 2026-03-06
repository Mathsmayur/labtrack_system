package com.example.mylab.dto;

import com.example.mylab.model.ComplaintStatus;
import com.example.mylab.model.ProblemType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DefectHistoryDTO {
    private Long id;
    private Long pcId;
    private ProblemType problemType;
    private String description;
    private LocalDateTime occurredAt;
    private LocalDateTime resolvedAt;
    private ComplaintStatus status;
    private String technicianRemarks;
}
