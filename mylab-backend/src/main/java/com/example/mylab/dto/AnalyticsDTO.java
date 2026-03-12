package com.example.mylab.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsDTO {
    private List<Map<String, Object>> mostProblematicPCs;
    private List<Map<String, Object>> mostCommonProblems;
    private Long weeklyComplaintCount;
    private Long monthlyComplaintCount;
    private Double averageRepairTime;
    private Long totalResolvedComplaints;
    private List<Map<String, Object>> labInventorySummary;
}
