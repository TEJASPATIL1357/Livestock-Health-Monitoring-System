CREATE TABLE disease_knowledge (
    id BIGSERIAL PRIMARY KEY,
    disease_name VARCHAR(255) NOT NULL,
    description TEXT,
    symptoms TEXT,
    severity VARCHAR(50),
    recommendations TEXT,
    emergency_action TEXT
);

CREATE TABLE disease_supported_languages (
    disease_id BIGINT NOT NULL,
    language_code VARCHAR(10) NOT NULL,
    FOREIGN KEY (disease_id) REFERENCES disease_knowledge(id)
);
