package com.spectorrent.backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

/**
 * Drops ALL auto-generated CHECK constraints that previous Hibernate ddl-auto:update
 * sessions may have created on public schema tables.
 */
@Configuration
public class DatabaseCleanupConfig {

    @Bean
    CommandLineRunner dropHibernateCheckConstraints(DataSource dataSource) {
        return args -> {
            List<String[]> constraints = new ArrayList<>();
            try (Connection conn = dataSource.getConnection()) {
                // Step 1: find all CHECK constraints in public schema
                try (Statement query = conn.createStatement()) {
                    ResultSet rs = query.executeQuery(
                            "SELECT conname, conrelid::regclass::text AS tablename " +
                            "FROM pg_constraint " +
                            "WHERE contype = 'c' " +
                            "AND connamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public') " +
                            "AND conname LIKE '%_check'"
                    );
                    while (rs.next()) {
                        constraints.add(new String[]{
                                rs.getString("tablename"),
                                rs.getString("conname")
                        });
                    }
                }
                // Step 2: drop each one
                if (!constraints.isEmpty()) {
                    try (Statement drop = conn.createStatement()) {
                        for (String[] c : constraints) {
                            String sql = "ALTER TABLE " + c[0] + " DROP CONSTRAINT IF EXISTS " + c[1];
                            drop.execute(sql);
                            System.out.println("Dropped CHECK constraint: " + c[1] + " from " + c[0]);
                        }
                    }
                } else {
                    System.out.println("No Hibernate CHECK constraints found to drop.");
                }
            } catch (Exception e) {
                System.err.println("Note: Could not drop CHECK constraints: " + e.getMessage());
            }

            // Ensure chat_messages has the system_message column
            // (may have been added by a previous Hibernate ddl-auto:update session
            //  but missing in init.sql)
            try (Connection conn2 = dataSource.getConnection();
                 Statement stmt = conn2.createStatement()) {
                stmt.execute(
                    "ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS system_message boolean NOT NULL DEFAULT false"
                );
                System.out.println("Ensured chat_messages.system_message column exists.");
            } catch (Exception e) {
                System.err.println("Note: Could not ensure system_message column: " + e.getMessage());
            }
        };
    }
}
