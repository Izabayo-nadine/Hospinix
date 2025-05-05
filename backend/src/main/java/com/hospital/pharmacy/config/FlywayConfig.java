package com.hospital.pharmacy.config;

import org.flywaydb.core.Flyway;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.DependsOn;
import org.springframework.core.env.Environment;

import javax.sql.DataSource;

@Configuration
public class FlywayConfig {

    @Autowired
    private Environment env;

    @Bean(initMethod = "migrate")
    public Flyway flyway(DataSource dataSource) {
        Flyway flyway = Flyway.configure()
                .dataSource(dataSource)
                .baselineOnMigrate(true)
                .locations("classpath:db/migration")
                .load();

        // Clean the database in development mode only (DANGEROUS!)
        // Only enable this if you're sure you want to wipe your database
        // String[] activeProfiles = env.getActiveProfiles();
        // if (activeProfiles.length > 0 && "dev".equals(activeProfiles[0])) {
        // flyway.clean();
        // }

        return flyway;
    }
}