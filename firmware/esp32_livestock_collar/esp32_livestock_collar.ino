/**
 * ============================================================================
 * Smart Livestock Health — ESP32 Collar Firmware (Production Node)
 * ============================================================================
 * Target Livestock : Cow Nandini (Tag: 0001)
 * Device Identifier: ESP32-COLLAR-002
 *
 * Hardware Configuration:
 *   - Controller: ESP32 DevKit V1
 *   - Temperature Sensor: DS18B20 on GPIO 4 (Requires 4.7kΩ pull-up to 3.3V)
 *   - Movement/Activity Sensor: MPU module (MPU-6050/6500)
 *       - I2C Bus: SDA on GPIO 21, SCL on GPIO 22
 *       - I2C Address: 0x68 (Default)
 *       - Raw Register Protocol: Wakes device via PWR_MGMT_1 (0x6B = 0x00)
 *         and bursts 14 bytes from 0x3B (ACCEL_XOUT_H through GYRO_ZOUT_H).
 *         Supports clones and alternate revisions (e.g. WHO_AM_I == 0x70).
 *
 * IMPORTANT:
 *   - MPU readings transmitted are RAW 16-bit sensor counts (-32768 to +32767).
 *     These are uncalibrated raw units, ready for server-side or edge filtering.
 *   - If MPU read fails or module is disconnected, the node seamlessly
 *     continues transmitting DS18B20 temperature data.
 *   - All credentials (Wi-Fi, API Key) are loaded from the local secrets.h header.
 * ============================================================================
 */

#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <Wire.h>
#include <time.h>

// 1. Secure Local Credentials Inclusion
// Checks for local secrets.h in the sketch folder first (for Arduino IDE tabs), then parent folder
#if __has_include("secrets.h")
#include "secrets.h"
#elif __has_include("../secrets.h")
#include "../secrets.h"
#else
#error "secrets.h not found! Please place secrets.h containing WIFI_SSID, WIFI_PASSWORD, SERVER_URL, DEVICE_IDENTIFIER, and API_KEY in this sketch folder."
#endif

// Let's Encrypt ISRG Root X1 CA Certificate (Trusted Root for Render *.onrender.com)
// Valid until 2035. Protects against MITM attacks during production HTTPS uploads.
const char* ISRG_ROOT_X1_CA_CERT = \
"-----BEGIN CERTIFICATE-----\n" \
"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\n" \
"rQhmUGo=\n" \
"-----END CERTIFICATE-----\n";

// 2. Hardware Pin & Bus Definitions
#define ONE_WIRE_BUS 4
#define I2C_SDA_PIN 21
#define I2C_SCL_PIN 22
#define MPU_I2C_ADDR 0x68
#define MPU_REG_PWR_MGMT_1 0x6B
#define MPU_REG_ACCEL_XOUT_H 0x3B

// 3. Operational Constants & Resilient Retry State
const unsigned long UPLOAD_INTERVAL_MS = 5000;         // 5-second default sampling cadence
const unsigned long MAX_BACKOFF_INTERVAL_MS = 15000;   // 15-second max backoff on network failures
const unsigned long HTTP_TIMEOUT_MS = 7000;            // 7-second HTTP/TLS network timeout
const char* NTP_SERVER_1 = "pool.ntp.org";
const char* NTP_SERVER_2 = "time.google.com";

// 4. Peripherals & Sensors
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature tempSensor(&oneWire);

unsigned long lastUploadTime = 0;
unsigned long currentIntervalMs = UPLOAD_INTERVAL_MS;
int consecutiveFailures = 0;
bool ntpInitialized = false;
bool mpuInitialized = false;

/**
 * Initializes the MPU sensor via direct raw register access.
 * Bypasses strict WHO_AM_I checks to guarantee support for modules with WHO_AM_I = 0x70.
 */
bool initMpuRaw() {
    Wire.beginTransmission(MPU_I2C_ADDR);
    Wire.write(MPU_REG_PWR_MGMT_1);
    Wire.write(0x00); // Clear SLEEP bit (bit 6) to wake up oscillator
    byte error = Wire.endTransmission(true);

    if (error == 0) {
        Serial.println(F("[MPU] Woke up sensor at I2C 0x68 (PWR_MGMT_1 cleared)."));
        return true;
    } else {
        Serial.print(F("[MPU] Warning: Failed to contact MPU at 0x68. Error code: "));
        Serial.println(error);
        return false;
    }
}

/**
 * Reads 6-DoF raw registers (Accelerometer X/Y/Z and Gyroscope X/Y/Z).
 * Returns true if 14 bytes were successfully read, false otherwise.
 */
bool readMpuRaw(int16_t &ax, int16_t &ay, int16_t &az, int16_t &gx, int16_t &gy, int16_t &gz) {
    Wire.beginTransmission(MPU_I2C_ADDR);
    Wire.write(MPU_REG_ACCEL_XOUT_H);
    if (Wire.endTransmission(false) != 0) {
        return false;
    }

    // Request 14 bytes: 6 for Accel (X,Y,Z), 2 for Temp, 6 for Gyro (X,Y,Z)
    if (Wire.requestFrom((uint8_t)MPU_I2C_ADDR, (size_t)14, true) != 14) {
        return false;
    }

    ax = (Wire.read() << 8) | Wire.read();
    ay = (Wire.read() << 8) | Wire.read();
    az = (Wire.read() << 8) | Wire.read();
    Wire.read(); Wire.read(); // Skip internal die temperature
    gx = (Wire.read() << 8) | Wire.read();
    gy = (Wire.read() << 8) | Wire.read();
    gz = (Wire.read() << 8) | Wire.read();

    return true;
}

/**
 * Connects or reconnects to Wi-Fi non-blockingly.
 */
void ensureWiFiConnection() {
    if (WiFi.status() == WL_CONNECTED) {
        return;
    }

    Serial.println();
    Serial.print(F("[WIFI] Connecting to SSID: "));
    Serial.println(WIFI_SSID);

    WiFi.mode(WIFI_STA);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

    unsigned long startAttempt = millis();
    while (WiFi.status() != WL_CONNECTED && (millis() - startAttempt < 10000)) {
        delay(500);
        Serial.print(F("."));
    }
    Serial.println();

    if (WiFi.status() == WL_CONNECTED) {
        Serial.print(F("[WIFI] Connected! Assigned IP: "));
        Serial.println(WiFi.localIP());

        if (!ntpInitialized) {
            configTime(0, 0, NTP_SERVER_1, NTP_SERVER_2);
            ntpInitialized = true;
            Serial.println(F("[NTP] SNTP client started."));
        }
    } else {
        Serial.println(F("[WIFI] Connection failed. Will retry next cycle."));
    }
}

/**
 * Retrieves ISO-8601 UTC timestamp string if NTP is synced.
 */
bool getIso8601Timestamp(char* buffer, size_t maxLen) {
    time_t now;
    time(&now);
    if (now < 1704067200) { // Prior to Jan 1, 2024
        return false;
    }
    struct tm timeinfo;
    gmtime_r(&now, &timeinfo);
    strftime(buffer, maxLen, "%Y-%m-%dT%H:%M:%SZ", &timeinfo);
    return true;
}

void setup() {
    Serial.begin(115200);
    delay(1000);

    Serial.println(F("=================================================="));
    Serial.println(F(" Smart Livestock Health — ESP32 Collar Node      "));
    Serial.println(F(" Target: Cow Nandini (0001) | ESP32-COLLAR-002    "));
    Serial.println(F("=================================================="));

    // Print safe configuration summary (secrets redacted)
    Serial.print(F("[CONFIG] Device Identifier : "));
    Serial.println(DEVICE_IDENTIFIER);
    Serial.print(F("[CONFIG] Backend URL       : "));
    Serial.println(SERVER_URL);
    Serial.print(F("[CONFIG] Wi-Fi SSID        : "));
    Serial.println(WIFI_SSID);
    Serial.println(F("[CONFIG] Wi-Fi Password    : [REDACTED]"));
    Serial.println(F("[CONFIG] Device API Key    : [CONFIGURED - REDACTED]"));

    // Initialize DS18B20 1-Wire bus on GPIO 4
    Serial.println(F("[DS18B20] Initializing temperature bus on GPIO 4..."));
    tempSensor.begin();
    tempSensor.setWaitForConversion(true);
    int count = tempSensor.getDeviceCount();
    Serial.print(F("[DS18B20] Found devices on 1-Wire bus: "));
    Serial.println(count);
    if (count == 0) {
        Serial.println(F("[DS18B20] WARNING: No sensor detected. Check GPIO 4 & 4.7kΩ pullup."));
    }

    // Initialize I2C Bus for MPU on GPIO 21 (SDA), 22 (SCL)
    Serial.println(F("[I2C] Initializing Wire on SDA=21, SCL=22..."));
    Wire.begin(I2C_SDA_PIN, I2C_SCL_PIN, 100000); // 100 kHz standard mode
    mpuInitialized = initMpuRaw();

    // Connect to local Wi-Fi
    ensureWiFiConnection();
}

void loop() {
    unsigned long currentMillis = millis();

    // Maintain non-blocking sampling interval with dynamic failure backoff
    if (currentMillis - lastUploadTime < currentIntervalMs && lastUploadTime != 0) {
        delay(100);
        return;
    }
    lastUploadTime = currentMillis;

    // Check Wi-Fi connectivity
    ensureWiFiConnection();
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println(F("[LOOP] Wi-Fi not connected. Skipping upload cycle."));
        return;
    }

    // 1. Read DS18B20 Temperature
    tempSensor.requestTemperatures();
    float tempC = tempSensor.getTempCByIndex(0);

    Serial.println(F("--------------------------------------------------"));
    Serial.print(F("[DS18B20] Temperature: "));
    Serial.print(tempC, 2);
    Serial.println(F(" °C"));

    // Validate sensor reading against disconnected sentinel (-127°C) & biological bounds
    if (tempC <= -126.0f || tempC == DEVICE_DISCONNECTED_C) {
        Serial.println(F("[DS18B20] ERROR: Sensor disconnected (-127°C). Transmission skipped."));
        return;
    }

    if (tempC < 0.0f || tempC > 60.0f) {
        Serial.print(F("[DS18B20] WARNING: Out-of-bounds reading (0-60°C): "));
        Serial.println(tempC);
        return;
    }

    // 2. Read MPU-6050/6500 Movement Sensor (Raw Registers)
    int16_t ax = 0, ay = 0, az = 0, gx = 0, gy = 0, gz = 0;
    bool hasMovement = false;

    if (!mpuInitialized) {
        mpuInitialized = initMpuRaw();
    }

    if (mpuInitialized) {
        if (readMpuRaw(ax, ay, az, gx, gy, gz)) {
            hasMovement = true;
            Serial.print(F("[MPU RAW] Accel (counts): X="));
            Serial.print(ax); Serial.print(F(" Y=")); Serial.print(ay); Serial.print(F(" Z=")); Serial.println(az);
            Serial.print(F("[MPU RAW] Gyro  (counts): X="));
            Serial.print(gx); Serial.print(F(" Y=")); Serial.print(gy); Serial.print(F(" Z=")); Serial.println(gz);
        } else {
            Serial.println(F("[MPU] Warning: Read failed on I2C bus. Sending temp-only."));
            mpuInitialized = false; // Attempt re-init on next cycle
        }
    } else {
        Serial.println(F("[MPU] Movement sensor not available. Sending temp-only."));
    }

    // 3. Assemble JSON Payload
    char isoTimestamp[32];
    bool hasTimestamp = getIso8601Timestamp(isoTimestamp, sizeof(isoTimestamp));

    char payload[300];
    if (hasMovement) {
        if (hasTimestamp) {
            snprintf(payload, sizeof(payload),
                "{\"deviceIdentifier\":\"%s\",\"temperature\":%.2f,\"measuredAt\":\"%s\","
                "\"accelX\":%d,\"accelY\":%d,\"accelZ\":%d,\"gyroX\":%d,\"gyroY\":%d,\"gyroZ\":%d}",
                DEVICE_IDENTIFIER, tempC, isoTimestamp, ax, ay, az, gx, gy, gz);
        } else {
            snprintf(payload, sizeof(payload),
                "{\"deviceIdentifier\":\"%s\",\"temperature\":%.2f,"
                "\"accelX\":%d,\"accelY\":%d,\"accelZ\":%d,\"gyroX\":%d,\"gyroY\":%d,\"gyroZ\":%d}",
                DEVICE_IDENTIFIER, tempC, ax, ay, az, gx, gy, gz);
        }
    } else {
        if (hasTimestamp) {
            snprintf(payload, sizeof(payload),
                "{\"deviceIdentifier\":\"%s\",\"temperature\":%.2f,\"measuredAt\":\"%s\"}",
                DEVICE_IDENTIFIER, tempC, isoTimestamp);
        } else {
            snprintf(payload, sizeof(payload),
                "{\"deviceIdentifier\":\"%s\",\"temperature\":%.2f}",
                DEVICE_IDENTIFIER, tempC);
        }
    }

    Serial.print(F("[HTTP] POST JSON: "));
    Serial.println(payload);

    // 4. Perform HTTP/HTTPS POST with X-API-KEY Authentication Header
    HTTPClient http;
    WiFiClient plainClient;
    WiFiClientSecure secureClient;
    bool isHttps = String(SERVER_URL).startsWith("https://");
    bool beginSuccess = false;

    if (isHttps) {
        secureClient.setCACert(ISRG_ROOT_X1_CA_CERT);
        beginSuccess = http.begin(secureClient, SERVER_URL);
    } else {
        beginSuccess = http.begin(plainClient, SERVER_URL);
    }

    if (!beginSuccess) {
        Serial.println(F("[HTTP] ERROR: Unable to initialize connection to SERVER_URL."));
        consecutiveFailures++;
        if (consecutiveFailures >= 3) {
            currentIntervalMs = min(currentIntervalMs + 2000, MAX_BACKOFF_INTERVAL_MS);
        }
        return;
    }

    http.setTimeout(HTTP_TIMEOUT_MS);
    http.addHeader(F("Content-Type"), F("application/json"));
    http.addHeader(F("X-API-KEY"), API_KEY);

    int httpResponseCode = http.POST((uint8_t*)payload, strlen(payload));

    if (httpResponseCode > 0) {
        Serial.print(F("[HTTP] Status: "));
        Serial.println(httpResponseCode);

        String responseBody = http.getString();
        if (httpResponseCode == 201) {
            Serial.println(F("[HTTP] SUCCESS! Reading stored for Cow Nandini (0001)."));
            Serial.print(F("[HTTP] Response: "));
            Serial.println(responseBody);
            // Reset failure counter and restore normal sampling cadence
            consecutiveFailures = 0;
            currentIntervalMs = UPLOAD_INTERVAL_MS;
        } else if (httpResponseCode == 400) {
            Serial.println(F("[HTTP] REJECTED (400 Bad Request): Check payload or animal assignment."));
            Serial.println(responseBody);
        } else if (httpResponseCode == 401) {
            Serial.println(F("[HTTP] REJECTED (401 Unauthorized): Check API key configuration."));
        } else {
            Serial.print(F("[HTTP] Unexpected Status: "));
            Serial.println(responseBody);
        }
    } else {
        Serial.print(F("[HTTP] Error: "));
        Serial.println(http.errorToString(httpResponseCode));
        if (isHttps) {
            Serial.println(F("[HTTP] Note: HTTPS TLS handshake failed or server unreachable. Retrying with backoff."));
        } else {
            Serial.println(F("[HTTP] Note: Verify backend LAN IP and ensure Windows Firewall allows port 8085."));
        }
        consecutiveFailures++;
        if (consecutiveFailures >= 3) {
            currentIntervalMs = min(currentIntervalMs + 2000, MAX_BACKOFF_INTERVAL_MS);
            Serial.print(F("[RETRY] Consecutive failures: "));
            Serial.print(consecutiveFailures);
            Serial.print(F(". Backing off interval to: "));
            Serial.print(currentIntervalMs);
            Serial.println(F(" ms."));
        }
    }

    http.end();
}
