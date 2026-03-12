package com.example.mylab.config;

import com.example.mylab.model.*;
import com.example.mylab.repository.LabRepository;
import com.example.mylab.repository.LabScheduleRepository;
import com.example.mylab.repository.PCRepository;
import com.example.mylab.repository.PCTypeRepository;
import com.example.mylab.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalTime;
import java.util.Random;
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
    private PCTypeRepository pcTypeRepository;

    @Autowired
    private PCRepository pcRepository;

    @Autowired
    private LabScheduleRepository labScheduleRepository;

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

        // Initialize PCTypes
        if (pcTypeRepository.count() == 0) {
            PCType optiplex = new PCType();
            optiplex.setBrand("Dell");
            optiplex.setModel("Optiplex 7000");
            optiplex.setProductionYear(2023);
            optiplex.setRam("16GB");
            optiplex.setRom("512GB SSD");
            optiplex.setProcessor("Intel Core i7");
            optiplex.setTotalQuantity(50);
            pcTypeRepository.save(optiplex);

            PCType prodesk = new PCType();
            prodesk.setBrand("HP");
            prodesk.setModel("ProDesk 600");
            prodesk.setProductionYear(2022);
            prodesk.setRam("8GB");
            prodesk.setRom("256GB SSD");
            prodesk.setProcessor("Intel Core i5");
            prodesk.setTotalQuantity(100);
            pcTypeRepository.save(prodesk);
        }

        // Initialize PCs for each lab if they don't have enough PCs
        PCType defaultType = pcTypeRepository.findAll().get(0);
        labRepository.findAll().forEach(lab -> {
            long labPcCount = pcRepository.findByLab(lab).size();
            if (labPcCount < 5) {
                int toCreate = 5 - (int) labPcCount;
                for (int i = 1; i <= toCreate; i++) {
                    PC pc = new PC();
                    pc.setPcNumber(lab.getDepartment() + "-" + lab.getName().replaceAll("[^0-9]", "") + "-PC-" + String.format("%02d", labPcCount + i));
                    pc.setLab(lab);
                    pc.setPcType(defaultType);
                    pc.setStatus(PCStatus.WORKING);
                    pcRepository.save(pc);
                }
            }
        });

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

        // Initialize Lab Schedules
        if (labScheduleRepository.count() == 0) {
            String[] subjects = {"Data Structures", "Web Development", "Computer Networks", "Database Management", "Artificial Intelligence", "Operating Systems", "Cyber Security", "Cloud Computing"};
            String[] professors = {"Dr. Sharma", "Prof. Verma", "Dr. Gupta", "Prof. Malhotra", "Dr. Iyer", "Prof. Reddy", "Dr. Chatterjee", "Prof. Nair"};
            String[] days = {"MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"};
            Random random = new Random();

            labRepository.findAll().forEach(lab -> {
                // Add 2-3 sessions for each lab
                int sessionsCount = 2 + random.nextInt(2);
                for (int i = 0; i < sessionsCount; i++) {
                    LabSchedule schedule = new LabSchedule();
                    schedule.setLab(lab);
                    schedule.setDayOfWeek(days[random.nextInt(days.length)]);
                    
                    int startHour = 9 + random.nextInt(9); // 9 AM to 5 PM
                    schedule.setStartTime(LocalTime.of(startHour, 0));
                    schedule.setEndTime(LocalTime.of(startHour + 2, 0));
                    
                    schedule.setSubject(subjects[random.nextInt(subjects.length)]);
                    schedule.setProfessorName(professors[random.nextInt(professors.length)]);
                    
                    labScheduleRepository.save(schedule);
                }
            });
        }
    }
}
