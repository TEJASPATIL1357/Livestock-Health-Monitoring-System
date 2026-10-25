package com.smartlivestock.backend.common.config;

import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;

@Configuration
public class DatabaseConfig {

    private static final Logger log = LoggerFactory.getLogger(DatabaseConfig.class);

    @Bean
    @Primary
    public DataSource dataSource(
            DataSourceProperties properties,
            @Value("${DATABASE_URL:}") String databaseUrl
    ) {
        if (databaseUrl != null && (databaseUrl.startsWith("postgres://") || databaseUrl.startsWith("postgresql://"))) {
            log.info("Detected Render/PaaS DATABASE_URL format. Converting to JDBC format with SSL.");
            try {
                // Normalize prefix to postgres:// for URI parser
                String normalized = databaseUrl.startsWith("postgresql://")
                        ? "postgres://" + databaseUrl.substring("postgresql://".length())
                        : databaseUrl;
                URI uri = new URI(normalized);

                String userInfo = uri.getUserInfo();
                String username = properties.getUsername();
                String password = properties.getPassword();
                if (userInfo != null && userInfo.contains(":")) {
                    String[] parts = userInfo.split(":", 2);
                    username = parts[0];
                    password = parts[1];
                }

                int port = uri.getPort() <= 0 ? 5432 : uri.getPort();
                String dbPath = uri.getPath();
                if (dbPath != null && dbPath.startsWith("/")) {
                    dbPath = dbPath.substring(1);
                }

                String sslParam = (uri.getQuery() != null && uri.getQuery().contains("sslmode=")) ? "" : "?sslmode=require";
                String jdbcUrl = "jdbc:postgresql://" + uri.getHost() + ":" + port + "/" + dbPath + sslParam;

                HikariDataSource ds = new HikariDataSource();
                ds.setJdbcUrl(jdbcUrl);
                ds.setUsername(username);
                ds.setPassword(password);
                ds.setDriverClassName("org.postgresql.Driver");
                return ds;
            } catch (Exception e) {
                log.error("Failed to parse DATABASE_URL, falling back to standard DataSource properties: {}", e.getMessage());
            }
        }

        return properties.initializeDataSourceBuilder().build();
    }
}
