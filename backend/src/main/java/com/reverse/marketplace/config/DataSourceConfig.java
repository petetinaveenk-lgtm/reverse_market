package com.reverse.marketplace.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;

import javax.sql.DataSource;
import java.net.URI;
import java.net.URISyntaxException;

/**
 * Handles all common Render/Heroku Postgres URL formats and converts them
 * to a valid JDBC URL that Spring Boot / HikariCP can use.
 *
 * Supported SPRING_DATASOURCE_URL / DATABASE_URL formats:
 *   jdbc:postgresql://...        → used as-is
 *   postgresql://user:pass@host  → converted to jdbc:postgresql://
 *   postgres://user:pass@host    → converted to jdbc:postgresql://
 */
@Configuration
public class DataSourceConfig {

    @Bean
    @Primary
    @ConditionalOnMissingBean(DataSource.class)
    public DataSource dataSource() throws URISyntaxException {

        // ─── 1. SPRING_DATASOURCE_URL (any format) ─────────────────────────
        String url = System.getenv("SPRING_DATASOURCE_URL");
        if (url != null && !url.isBlank()) {

            if (url.startsWith("jdbc:")) {
                // Already a valid JDBC URL — use directly with username/password env vars
                return buildHikari(
                        url,
                        System.getenv("SPRING_DATASOURCE_USERNAME"),
                        System.getenv("SPRING_DATASOURCE_PASSWORD")
                );
            }

            if (url.startsWith("postgresql://") || url.startsWith("postgres://")) {
                // Render-style URL passed via SPRING_DATASOURCE_URL — auto-convert
                return buildFromPostgresUrl(url);
            }
        }

        // ─── 2. DATABASE_URL (Render auto-injected env var) ────────────────
        String dbUrl = System.getenv("DATABASE_URL");
        if (dbUrl != null && !dbUrl.isBlank()) {
            if (dbUrl.startsWith("jdbc:")) {
                return buildHikari(dbUrl, null, null);
            }
            return buildFromPostgresUrl(dbUrl);
        }

        // ─── 3. Fall through — let Spring Boot use application.properties ──
        return null;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Converts postgres:// or postgresql:// URL to a HikariDataSource.
     * Credentials embedded in the URL take priority over separate env vars.
     */
    private DataSource buildFromPostgresUrl(String rawUrl) throws URISyntaxException {

        // Normalise both "postgres://" and "postgresql://" for java.net.URI parsing
        String normalised = rawUrl
                .replace("postgresql://", "pg-internal://")
                .replace("postgres://",   "pg-internal://");

        URI uri = new URI(normalised);

        String host   = uri.getHost();
        int    port   = uri.getPort() == -1 ? 5432 : uri.getPort();
        String dbName = uri.getPath().replaceFirst("^/", "");

        String username = null;
        String password = null;
        String userInfo = uri.getUserInfo();

        if (userInfo != null && userInfo.contains(":")) {
            username = userInfo.split(":", 2)[0];
            password = userInfo.split(":", 2)[1];
        } else if (userInfo != null) {
            username = userInfo;
        }

        // Fall back to separate env vars if credentials are not in the URL
        if (username == null || username.isBlank()) {
            username = System.getenv("SPRING_DATASOURCE_USERNAME");
        }
        if (password == null || password.isBlank()) {
            password = System.getenv("SPRING_DATASOURCE_PASSWORD");
        }

        String jdbcUrl = String.format(
                "jdbc:postgresql://%s:%d/%s?sslmode=require",
                host, port, dbName
        );

        System.out.println("[DataSourceConfig] Converted Render URL → " + jdbcUrl);

        return buildHikari(jdbcUrl, username, password);
    }

    private DataSource buildHikari(String jdbcUrl, String username, String password) {

        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(jdbcUrl);

        if (username != null && !username.isBlank()) {
            config.setUsername(username);
        }
        if (password != null && !password.isBlank()) {
            config.setPassword(password);
        }

        // Tuned for Render Free tier (1 vCPU, limited connections)
        config.setMaximumPoolSize(5);
        config.setMinimumIdle(1);
        config.setConnectionTimeout(30_000);
        config.setIdleTimeout(600_000);
        config.setMaxLifetime(1_800_000);
        config.setConnectionTestQuery("SELECT 1");

        return new HikariDataSource(config);
    }
}
