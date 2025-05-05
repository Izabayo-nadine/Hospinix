package com.hospital.pharmacy.config;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.util.FileCopyUtils;

import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.nio.charset.StandardCharsets;

@Component
public class DataInit {

    private static final Logger logger = LoggerFactory.getLogger(DataInit.class);

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void initDatabase() {
        try {
            logger.info("Executing database fix script...");

            // Load the SQL script
            ClassPathResource resource = new ClassPathResource("db/fix-isactive-column.sql");
            String sql;

            try (Reader reader = new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8)) {
                sql = FileCopyUtils.copyToString(reader);
            }

            // Execute the script
            jdbcTemplate.execute(sql);

            logger.info("Database fix script executed successfully");
        } catch (IOException e) {
            logger.error("Error loading database fix script", e);
        } catch (Exception e) {
            logger.error("Error executing database fix script", e);
        }
    }
}