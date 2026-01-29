package com.example.mylab.dto;

import com.example.mylab.model.PCStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PCDTO {
    private Long id;
    private String pcNumber;
    private Long labId;
    private String labName;
    private String department;
    private PCStatus status;
    private Long pcTypeId;
    private String brand;
    private String model;
    private Integer productionYear;
    private String ram;
    private String rom;
    private String processor;
}
