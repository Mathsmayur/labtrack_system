package com.example.mylab.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InvalidPcTypeDTO {
    private Long id;
    private String pcNumber;
    private Long pcTypeId;
    private Long labId;
}

