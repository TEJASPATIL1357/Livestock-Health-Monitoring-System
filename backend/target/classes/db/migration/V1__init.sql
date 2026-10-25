CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    preferred_language VARCHAR(255),
    role VARCHAR(255),
    status VARCHAR(255)
);

CREATE TABLE admins (
    id BIGINT PRIMARY KEY REFERENCES users(id)
);

CREATE TABLE farmers (
    id BIGINT PRIMARY KEY REFERENCES users(id)
);

CREATE TABLE doctors (
    id BIGINT PRIMARY KEY REFERENCES users(id)
);

CREATE TABLE animals (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    breed VARCHAR(255),
    species VARCHAR(255),
    tag_number VARCHAR(255) UNIQUE NOT NULL,
    date_of_birth DATE,
    farmer_id BIGINT REFERENCES farmers(id)
);

CREATE TABLE sensor_devices (
    id BIGSERIAL PRIMARY KEY,
    device_id VARCHAR(255) UNIQUE NOT NULL,
    device_name VARCHAR(255) NOT NULL,
    api_key VARCHAR(255) NOT NULL,
    status VARCHAR(255),
    last_seen TIMESTAMP,
    animal_id BIGINT REFERENCES animals(id)
);

CREATE TABLE sensor_readings (
    id BIGSERIAL PRIMARY KEY,
    animal_id BIGINT REFERENCES animals(id),
    device_id BIGINT REFERENCES sensor_devices(id),
    temperature DOUBLE PRECISION,
    activity_level INTEGER,
    timestamp TIMESTAMP
);

CREATE TABLE alerts (
    id BIGSERIAL PRIMARY KEY,
    animal_id BIGINT REFERENCES animals(id),
    type VARCHAR(255),
    severity VARCHAR(255),
    message TEXT,
    is_read BOOLEAN,
    timestamp TIMESTAMP
);

CREATE TABLE health_reports (
    id BIGSERIAL PRIMARY KEY,
    animal_id BIGINT REFERENCES animals(id),
    veterinarian_id BIGINT REFERENCES farmers(id),
    diagnosis VARCHAR(255),
    recommendation_text VARCHAR(255),
    date_issued TIMESTAMP
);

CREATE TABLE milk_productions (
    id BIGSERIAL PRIMARY KEY,
    animal_id BIGINT REFERENCES animals(id),
    date DATE,
    session VARCHAR(255),
    quantity_in_liters DOUBLE PRECISION,
    fat_percentage DOUBLE PRECISION,
    snf_percentage DOUBLE PRECISION
);

CREATE TABLE vaccination_records (
    id BIGSERIAL PRIMARY KEY,
    animal_id BIGINT REFERENCES animals(id),
    vaccine_name VARCHAR(255),
    date_administered DATE,
    next_due_date DATE,
    administered_by BIGINT REFERENCES farmers(id)
);

CREATE TABLE veterinary_visits (
    id BIGSERIAL PRIMARY KEY,
    animal_id BIGINT REFERENCES animals(id),
    veterinarian_id BIGINT REFERENCES doctors(id),
    visit_date TIMESTAMP,
    diagnosis TEXT,
    treatment TEXT
);

CREATE TABLE chat_histories (
    id BIGSERIAL PRIMARY KEY,
    farmer_id BIGINT REFERENCES farmers(id),
    session_id VARCHAR(255),
    user_message TEXT,
    bot_response TEXT,
    detected_intent VARCHAR(255),
    language VARCHAR(255),
    timestamp TIMESTAMP
);

-- Indexes
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_user_username ON users(username);
CREATE INDEX idx_animal_tag_number ON animals(tag_number);
CREATE INDEX idx_device_device_id ON sensor_devices(device_id);
CREATE INDEX idx_reading_animal_id ON sensor_readings(animal_id);
CREATE INDEX idx_reading_device_id ON sensor_readings(device_id);
