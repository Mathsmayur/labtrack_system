package com.example.mylab.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class PcTypeCleanupRunner implements CommandLineRunner {

    private final Logger logger = LoggerFactory.getLogger(PcTypeCleanupRunner.class);
    private final JdbcTemplate jdbcTemplate;

    public PcTypeCleanupRunner(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) throws Exception {
        try {
            // Set any invalid pc_type_id (0 or negative) to NULL to avoid Hibernate ObjectNotFound exceptions
            int updated = jdbcTemplate.update("UPDATE pcs SET pc_type_id = NULL WHERE pc_type_id IS NOT NULL AND pc_type_id <= 0");
            if (updated > 0) {
                logger.info("PcTypeCleanupRunner: set pc_type_id = NULL on {} rows (invalid FK values)", updated);
            } else {
                logger.debug("PcTypeCleanupRunner: no invalid pc_type_id rows found");
            }
        } catch (Exception e) {
            logger.warn("PcTypeCleanupRunner: failed to run cleanup query", e);
        }
    }
}

