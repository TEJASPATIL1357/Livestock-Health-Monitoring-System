-- Module 2B/2C Schema Migration for Animals, Devices, Sensor Telemetry, AI Assessments, Alerts, and Push Tokens

CREATE TABLE animals (
    id UUID PRIMARY KEY,
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    tag_number VARCHAR(100) NOT NULL,
    species VARCHAR(50) NOT NULL DEFAULT 'CATTLE',
    breed VARCHAR(100),
    date_of_birth DATE,
    gender VARCHAR(20),
    status VARCHAR(50) NOT NULL DEFAULT 'HEALTHY',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT uq_animals_farm_tag UNIQUE (farm_id, tag_number)
);

CREATE TABLE devices (
    id UUID PRIMARY KEY,
    device_identifier VARCHAR(100) NOT NULL UNIQUE,
    api_key_hash VARCHAR(255) NOT NULL UNIQUE,
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    animal_id UUID REFERENCES animals(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    last_seen_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE sensor_telemetry (
    id UUID PRIMARY KEY,
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    animal_id UUID NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    temperature DOUBLE PRECISION NOT NULL,
    measured_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ingested_at TIMESTAMP WITH TIME ZONE NOT NULL,
    movement_available BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE ai_assessments (
    id UUID PRIMARY KEY,
    animal_id UUID NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    health_status VARCHAR(50) NOT NULL,
    summary_en TEXT NOT NULL,
    summary_hi TEXT,
    summary_mr TEXT,
    reading_count INT NOT NULL DEFAULT 0,
    avg_temperature DOUBLE PRECISION,
    window_start TIMESTAMP WITH TIME ZONE,
    window_end TIMESTAMP WITH TIME ZONE,
    assessed_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE alerts (
    id UUID PRIMARY KEY,
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    animal_id UUID REFERENCES animals(id) ON DELETE CASCADE,
    device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
    alert_type VARCHAR(100) NOT NULL,
    severity VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    dedup_key VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE push_tokens (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    platform VARCHAR(50) NOT NULL DEFAULT 'ANDROID',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Indexing
CREATE INDEX idx_animals_farm_id ON animals(farm_id);
CREATE INDEX idx_devices_farm_id ON devices(farm_id);
CREATE INDEX idx_devices_animal_id ON devices(animal_id);
CREATE INDEX idx_devices_identifier ON devices(device_identifier);
CREATE INDEX idx_telemetry_animal_id ON sensor_telemetry(animal_id);
CREATE INDEX idx_telemetry_measured_at ON sensor_telemetry(measured_at);
CREATE INDEX idx_ai_assessments_animal_id ON ai_assessments(animal_id);
CREATE INDEX idx_alerts_farm_id ON alerts(farm_id);
CREATE INDEX idx_alerts_is_read ON alerts(is_read);
CREATE INDEX idx_alerts_dedup_key ON alerts(dedup_key);
