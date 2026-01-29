package com.example.mylab.dto;

import com.example.mylab.model.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    private String username;
    private String password;
    private String name;
    private Role role;
    private String department; // Required for STUDENT and PROFESSOR
}
