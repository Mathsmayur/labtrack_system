package com.example.mylab.dto;

import com.example.mylab.model.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class    LoginResponse {
    private String token;
    private Long userId;
    private String username;
    private String name;
    private Role role;
    private String department;
}
