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
 * Converts Render's DATABASE_URL (postgres://user:pass@host:5432/db)
 * to a proper JDBC URL for Spring Boot automatically.
 *
 * Priority order:
 *   1. SPRING_DATASOURCE_URL (already valid jdbc:... URL — used as-is)
 *   2. DATABASE_URL          (Render-provided postgres:// URL — auto-converted)
 *   3. Local default         (jdbc:mysql://localhost:3306/reverse_marketplace)
 */
@Configuration
public class DataSourceConfig {

    @Bean
    @Primary
    @ConditionalOnMissingBean(DataSource.class)
    public DataSource dataSource() throws URISyntaxException {

        // ─── 1. Explicit JDBC URL already provided ─────────────────────────
        String explicitUrl = System.getenv("SPRING_DATASOURCE_URL");
        if (explicitUrl != null && !explicitUrl.isBlank() && explicitUrl.startsWith("jdbc")) {
            return buildHikari(
                    explicitUrl,
                    System.getenv("SPRING_DATASOURCE_USERNAME"),
                    System.getenv("SPRING_DATASOURCE_PASSWORD")
            );
        }

        // ─── 2. Render DATABASE_URL (postgres://…) ──────────────────────────
        String renderUrl = System.getenv("DATABASE_URL");
        if (renderUrl != null && !renderUrl.isBlank()) {
            return buildFromRenderUrl(renderUrl);
        }

        // ─── 3. Fall back to properties / local defaults ───────────────────
        // Return null so Spring Boot's auto-configuration takes over using
        // the application.properties values (local dev, docker-compose, etc.)
        return null;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Parses a Render Postgres URL like:
     *   postgres://user:password@hostname:5432/database
     * and creates a properly configured HikariDataSource.
     */
    private DataSource buildFromRenderUrl(String rawUrl) throws URISyntaxException {

        // Render sometimes provides "postgres://" — normalize to parseable form
        URI uri = new URI(rawUrl.replace("postgres://", "postgresql://"));

        String host     = uri.getHost();
        int    port     = uri.getPort() == -1 ? 5432 : uri.getPort();
        String dbName   = uri.getPath().replaceFirst("^/", "");
        String userInfo = uri.getUserInfo();

        String username = null;
        String password = null;

        if (userInfo != null && userInfo.contains(":")) {
            username = userInfo.split(":", 2)[0];
            password = userInfo.split(":", 2)[1];
        } else if (userInfo != null) {
            username = userInfo;
        }

        String jdbcUrl = String.format(
                "jdbc:postgresql://%s:%d/%s?sslmode=require",
                host, port, dbName
        );

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

        // Connection pool settings tuned for Render Free tier
        config.setMaximumPoolSize(5);
        config.setMinimumIdle(1);
        config.setConnectionTimeout(30_000);
        config.setIdleTimeout(600_000);
        config.setMaxLifetime(1_800_000);
        config.setConnectionTestQuery("SELECT 1");

        return new HikariDataSource(config);
    }
}
