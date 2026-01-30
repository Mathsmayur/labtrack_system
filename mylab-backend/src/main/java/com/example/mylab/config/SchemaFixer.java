package com.example.mylab.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class SchemaFixer implements CommandLineRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        try {
            System.out.println("Attempting to fix constraints on pcs table...");
            // Allow lab_id, pc_type_id, and pc_number to be NULL
            jdbcTemplate.execute("ALTER TABLE pcs MODIFY lab_id BIGINT NULL");
            jdbcTemplate.execute("ALTER TABLE pcs MODIFY pc_type_id BIGINT NULL");
            jdbcTemplate.execute("ALTER TABLE pcs MODIFY pc_number VARCHAR(255) NULL");
            System.out.println("Successfully altered pcs table: lab_id, pc_type_id, and pc_number are now nullable.");
        } catch (Exception e) {
            System.err.println("Failed to alter pcs table (it might already be correct or DB specific syntax issue): " + e.getMessage());
        }
    }
}
