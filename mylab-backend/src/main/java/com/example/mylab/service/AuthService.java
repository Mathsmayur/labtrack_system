package com.example.mylab.service;

import com.example.mylab.dto.LoginRequest;
import com.example.mylab.dto.LoginResponse;
import com.example.mylab.dto.RegisterRequest;
import com.example.mylab.model.Role;
import com.example.mylab.model.User;
import com.example.mylab.repository.UserRepository;
import com.example.mylab.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    public LoginResponse login(LoginRequest request) {
        // First authenticate
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        User user = userRepository.findByUsername(request.getUsername())
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Validate department for students and professors
        if ((user.getRole() == Role.STUDENT || user.getRole() == Role.PROFESSOR)) {
            if (request.getDepartment() == null || request.getDepartment().isEmpty()) {
                throw new RuntimeException("Department is required for students and professors");
            }
            if (!user.getDepartment().equals(request.getDepartment())) {
                throw new RuntimeException("Invalid department for this user");
            }
        }

        String token = jwtUtil.generateToken(user.getUsername());

        return new LoginResponse(token, user.getId(), user.getUsername(), user.getName(), user.getRole(), user.getDepartment());
    }

    public LoginResponse register(RegisterRequest request) {
        // Check if username already exists
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        // Validate department for students and professors
        if ((request.getRole() == Role.STUDENT || request.getRole() == Role.PROFESSOR)) {
            if (request.getDepartment() == null || request.getDepartment().isEmpty()) {
                throw new RuntimeException("Department is required for students and professors");
            }
        }

        // Create new user
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setName(request.getName());
        user.setRole(request.getRole());
        user.setDepartment(request.getDepartment());

        User savedUser = userRepository.save(user);

        // Generate token and return login response
        String token = jwtUtil.generateToken(savedUser.getUsername());

        return new LoginResponse(
            token,
            savedUser.getId(),
            savedUser.getUsername(),
            savedUser.getName(),
            savedUser.getRole(),
            savedUser.getDepartment()
        );
    }
}
