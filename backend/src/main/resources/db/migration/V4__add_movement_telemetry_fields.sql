-- Module 2E Migration: Add 6-DoF Movement Telemetry Fields (MPU-6050 Accelerometer & Gyroscope)
-- All columns are strictly nullable to maintain 100% backward compatibility with existing telemetry and temperature-only clients.

ALTER TABLE sensor_telemetry ADD COLUMN accel_x DOUBLE PRECISION;
ALTER TABLE sensor_telemetry ADD COLUMN accel_y DOUBLE PRECISION;
ALTER TABLE sensor_telemetry ADD COLUMN accel_z DOUBLE PRECISION;
ALTER TABLE sensor_telemetry ADD COLUMN gyro_x DOUBLE PRECISION;
ALTER TABLE sensor_telemetry ADD COLUMN gyro_y DOUBLE PRECISION;
ALTER TABLE sensor_telemetry ADD COLUMN gyro_z DOUBLE PRECISION;

