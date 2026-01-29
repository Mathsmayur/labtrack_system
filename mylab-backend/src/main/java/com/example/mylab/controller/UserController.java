package com.example.mylab.controller;

import com.example.mylab.dto.UserDTO;
import com.example.mylab.model.Role;
import com.example.mylab.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/by-username")
    public ResponseEntity<UserDTO> getByUsername(@RequestParam String username) {
        UserDTO user = userService.getByUsername(username);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(user);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDTO> createUser(@RequestBody Map<String, Object> request) {
        UserDTO userDTO = new UserDTO();
        userDTO.setUsername((String) request.get("username"));
        userDTO.setName((String) request.get("name"));
        userDTO.setRole(Role.valueOf((String) request.get("role")));
        userDTO.setDepartment((String) request.get("department"));
        
        String password = (String) request.get("password");
        UserDTO created = userService.createUser(userDTO, password);
        return ResponseEntity.ok(created);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok().build();
    }
}
