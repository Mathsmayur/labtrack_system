package com.example.mylab.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LabStatusDTO {
    private Long labId;
    private String labName;
    private String currentStatus; // "Occupied" or "Unoccupied"
    private String currentSubject;
    private String lastOccupied; // Descriptive string like "Today, 10:00 - 12:00" or date
    private String nextOccupied; // Descriptive string like "Tomorrow, 09:00 - 11:00"
}
