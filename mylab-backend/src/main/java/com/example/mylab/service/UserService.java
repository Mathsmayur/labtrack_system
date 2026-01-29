package com.example.mylab.service;

import com.example.mylab.dto.UserDTO;
import com.example.mylab.model.Role;
import com.example.mylab.model.User;
import com.example.mylab.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public UserDTO createUser(UserDTO userDTO, String password) {
        if (userRepository.existsByUsername(userDTO.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        User user = new User();
        user.setUsername(userDTO.getUsername());
        user.setPassword(passwordEncoder.encode(password));
        user.setName(userDTO.getName());
        user.setRole(userDTO.getRole());
        user.setDepartment(userDTO.getDepartment());

        User savedUser = userRepository.save(user);
        return convertToDTO(savedUser);
    }

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    public UserDTO getByUsername(String username) {
        return userRepository.findByUsername(username)
                .map(this::convertToDTO)
                .orElse(null);
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    public UserDTO convertToDTO(User user) {
        return new UserDTO(user.getId(), user.getUsername(), user.getName(), user.getRole(), user.getDepartment());
    }

    public User getUserEntityByUsername(String username) {
        return userRepository.findByUsername(username).orElse(null);
    }
}
