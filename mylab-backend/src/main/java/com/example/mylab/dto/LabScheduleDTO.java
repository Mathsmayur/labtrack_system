package com.example.mylab.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LabScheduleDTO {
    private Long id;
    private Long labId;
    private String labName;
    private String dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;
    private String subject;
    private String professorName;
}
