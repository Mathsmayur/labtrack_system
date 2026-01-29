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
public class ComplaintDTO {
    private Long id;
    private Long pcId;
    private String pcNumber;
    private String labName;
    private Long userId;
    private String userName;
    private ProblemType problemType;
    private String description;
    private LocalDateTime reportedAt;
    private LocalDateTime resolvedAt;
    private ComplaintStatus status;
    private Integer daysSinceReport;
}
