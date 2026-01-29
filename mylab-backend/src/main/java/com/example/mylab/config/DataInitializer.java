package com.example.mylab.config;

import com.example.mylab.model.*;
import com.example.mylab.repository.LabRepository;
import com.example.mylab.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private LabRepository labRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Initialize Labs
        if (labRepository.count() == 0) {
            for (int i = 1; i <= 8; i++) {
                Lab ceLab = new Lab();
                ceLab.setName("CE Lab " + i);
                ceLab.setDepartment("CE");
                labRepository.save(ceLab);

                Lab itLab = new Lab();
                itLab.setName("IT Lab " + i);
                itLab.setDepartment("IT");
                labRepository.save(itLab);
            }
        }

        // Initialize Admin user
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setName("Admin User");
            admin.setRole(Role.ADMIN);
            admin.setDepartment(null);
            userRepository.save(admin);
        }

        // Initialize Technician user
        if (!userRepository.existsByUsername("technician")) {
            User technician = new User();
            technician.setUsername("technician");
            technician.setPassword(passwordEncoder.encode("tech123"));
            technician.setName("Lab Technician");
            technician.setRole(Role.TECHNICIAN);
            technician.setDepartment(null);
            userRepository.save(technician);
        }
    }
}
