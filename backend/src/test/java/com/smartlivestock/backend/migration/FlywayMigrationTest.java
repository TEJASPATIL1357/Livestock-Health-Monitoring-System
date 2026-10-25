package com.smartlivestock.backend.migration;

import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class FlywayMigrationTest {

    @Autowired
    private Flyway flyway;

    @Test
    @DisplayName("Should execute Flyway schema migrations successfully on clean database")
    void shouldExecuteFlywayMigrationsSuccessfully() {
        assertNotNull(flyway);
        var info = flyway.info();
        assertNotNull(info.current());
        assertEquals("4", info.current().getVersion().getVersion());
        assertTrue(info.current().getState().isApplied());
    }
}
