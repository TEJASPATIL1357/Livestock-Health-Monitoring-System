/**
 * ============================================================================
 * Smart Livestock Health — Phase 1A: ESP32 DS18B20 Telemetry Upload
 * ============================================================================
 * Hardware:
 *   - ESP32 Dev Module (WROOM / NodeMCU-32S)
 *   - DS18B20 Waterproof Temperature Sensor on GPIO 4
 *     (Requires a 4.7kΩ pull-up resistor between GPIO 4 and 3.3V)
 *
 * Backend Endpoint:
 *   - POST http://10.143.195.19:8085/api/v1/sensors/upload
 *   - Header: X-API-KEY: <provisioned_key>
 *   - Payload: {"deviceIdentifier":"ESP32-COLLAR-001","temperature":XX.XX}
 *
 * Note: Never hardcode sensitive credentials directly in source control.
 * Credentials are loaded from the local secrets.h header.
 * ============================================================================
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <time.h>

// 1. Credentials & Configuration Inclusion
// Checks for local secrets.h in the sketch folder first (for Arduino IDE tabs), then parent folder
#if __has_include("secrets.h")
#include "secrets.h"
#elif __has_include("../secrets.h")
#include "../secrets.h"
#else
#error "secrets.h not found! Please place secrets.h containing WIFI_SSID, WIFI_PASSWORD, SERVER_URL, DEVICE_IDENTIFIER, and API_KEY in this sketch folder."
#endif

// 2. Hardware Pin Definitions
#define ONE_WIRE_BUS 4

// 3. Operational Constants
const unsigned long UPLOAD_INTERVAL_MS = 5000; // 5-second interval
const unsigned long HTTP_TIMEOUT_MS = 8000;    // 8-second HTTP timeout
const char* DEFAULT_LAN_URL = "http://10.143.195.19:8085/api/v1/sensors/upload";
const char* NTP_SERVER_1 = "pool.ntp.org";
const char* NTP_SERVER_2 = "time.google.com";

// 4. Peripherals & Sensor Initialization
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

unsigned long lastUploadTime = 0;
bool ntpConfigured = false;

/**
 * Resolves the effective backend endpoint.
 * If the configured SERVER_URL still targets the host-only virtual adapter (192.168.56.1),
 * automatically substitutes the active Wi-Fi LAN IP (10.143.195.19).
 */
const char* getEffectiveServerUrl() {
    if (SERVER_URL != nullptr && strstr(SERVER_URL, "192.168.56.1") != nullptr) {
        return DEFAULT_LAN_URL;
    }
    return SERVER_URL;
}

/**
 * Connects or reconnects to the configured Wi-Fi network.
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
    while (WiFi.status() != WL_CONNECTED && (millis() - startAttempt < 15000)) {
        delay(500);
        Serial.print(F("."));
    }
    Serial.println();

    if (WiFi.status() == WL_CONNECTED) {
        Serial.print(F("[WIFI] Connected successfully! IP Address: "));
        Serial.println(WiFi.localIP());

        // Configure NTP once Wi-Fi is active
        if (!ntpConfigured) {
            configTime(0, 0, NTP_SERVER_1, NTP_SERVER_2);
            ntpConfigured = true;
            Serial.println(F("[NTP] SNTP client initialized for UTC timestamps."));
        }
    } else {
        Serial.println(F("[WIFI] Connection attempt failed. Will retry on next cycle."));
    }
}

/**
 * Attempts to retrieve an ISO-8601 UTC timestamp string.
 * Returns true if NTP time is synchronized (epoch > Jan 1, 2024), false otherwise.
 */
bool getIso8601Timestamp(char* buffer, size_t maxLen) {
    time_t now;
    time(&now);
    // 1704067200 = 2024-01-01 00:00:00 UTC
    if (now < 1704067200) {
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
    Serial.println(F("  Smart Livestock Health — ESP32 Telemetry Node   "));
    Serial.println(F("  Phase 1A: DS18B20 Temperature Upload (GPIO 4)   "));
    Serial.println(F("=================================================="));

    // Print non-sensitive configuration parameters
    Serial.print(F("[CONFIG] Device Identifier : "));
    Serial.println(DEVICE_IDENTIFIER);
    Serial.print(F("[CONFIG] Target Server URL : "));
    Serial.println(getEffectiveServerUrl());
    Serial.print(F("[CONFIG] Wi-Fi SSID        : "));
    Serial.println(WIFI_SSID);
    Serial.println(F("[CONFIG] Wi-Fi Password    : [REDACTED]"));
    Serial.println(F("[CONFIG] Device API Key    : [CONFIGURED - REDACTED]"));

    // Initialize DS18B20 1-Wire sensor bus
    Serial.println(F("[SENSOR] Initializing DS18B20 on GPIO 4..."));
    sensors.begin();
    sensors.setWaitForConversion(true);

    int deviceCount = sensors.getDeviceCount();
    Serial.print(F("[SENSOR] DS18B20 Sensors detected on bus: "));
    Serial.println(deviceCount);

    if (deviceCount == 0) {
        Serial.println(F("[SENSOR] WARNING: No 1-Wire devices found on GPIO 4."));
        Serial.println(F("[SENSOR] Verify VCC (3.3V), GND, and 4.7kΩ pull-up resistor."));
    }

    // Connect to Wi-Fi
    ensureWiFiConnection();
}

void loop() {
    unsigned long currentMillis = millis();

    // Enforce 5-second upload interval without tight loops
    if (currentMillis - lastUploadTime < UPLOAD_INTERVAL_MS && lastUploadTime != 0) {
        delay(100);
        return;
    }
    lastUploadTime = currentMillis;

    // Check Wi-Fi state
    ensureWiFiConnection();
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println(F("[LOOP] Wi-Fi unavailable. Skipping transmission."));
        return;
    }

    // 1. Read DS18B20 temperature
    sensors.requestTemperatures();
    float tempC = sensors.getTempCByIndex(0);

    Serial.println(F("--------------------------------------------------"));
    Serial.print(F("[SENSOR] Read Temperature: "));
    Serial.print(tempC, 2);
    Serial.println(F(" °C"));

    // 2. Validate sensor reading against sentinel & physical bounds
    // DS18B20 returns DEVICE_DISCONNECTED_C (-127.0°C) when disconnected or bad pull-up
    if (tempC <= -126.0f || tempC == DEVICE_DISCONNECTED_C) {
        Serial.println(F("[SENSOR] ERROR: DS18B20 disconnected or bus error (-127°C)."));
        Serial.println(F("[SENSOR] Transmission aborted. Check GPIO 4 wiring & pullup."));
        return;
    }

    // Physical bounds check (Livestock range: 0.0°C to 60.0°C)
    if (tempC < 0.0f || tempC > 60.0f) {
        Serial.print(F("[SENSOR] WARNING: Temperature out of biological range (0-60°C): "));
        Serial.print(tempC);
        Serial.println(F(" °C. Transmission skipped to avoid backend rejection."));
        return;
    }

    // 3. Format JSON payload matching backend SensorUploadRequest DTO
    char isoTimestamp[32];
    bool hasTimestamp = getIso8601Timestamp(isoTimestamp, sizeof(isoTimestamp));

    char payload[160];
    if (hasTimestamp) {
        snprintf(payload, sizeof(payload),
            "{\"deviceIdentifier\":\"%s\",\"temperature\":%.2f,\"measuredAt\":\"%s\"}",
            DEVICE_IDENTIFIER, tempC, isoTimestamp);
    } else {
        snprintf(payload, sizeof(payload),
            "{\"deviceIdentifier\":\"%s\",\"temperature\":%.2f}",
            DEVICE_IDENTIFIER, tempC);
    }

    Serial.print(F("[HTTP] POST Payload: "));
    Serial.println(payload);

    // 4. Execute HTTP POST to backend
    HTTPClient http;
    const char* targetUrl = getEffectiveServerUrl();

    if (!http.begin(targetUrl)) {
        Serial.println(F("[HTTP] ERROR: Unable to parse URL or begin HTTP client."));
        return;
    }

    http.setTimeout(HTTP_TIMEOUT_MS);
    http.addHeader(F("Content-Type"), F("application/json"));
    http.addHeader(F("X-API-KEY"), API_KEY);

    int httpResponseCode = http.POST((uint8_t*)payload, strlen(payload));

    // 5. Evaluate HTTP response
    if (httpResponseCode > 0) {
        Serial.print(F("[HTTP] Response Code: "));
        Serial.println(httpResponseCode);

        String responseBody = http.getString();
        if (httpResponseCode == 201) {
            Serial.println(F("[HTTP] SUCCESS: Telemetry ingested and persisted."));
            Serial.print(F("[HTTP] Server Response: "));
            Serial.println(responseBody);
        } else if (httpResponseCode == 400) {
            Serial.println(F("[HTTP] REJECTED (400 Bad Request): Verify assigned animal."));
            Serial.print(F("[HTTP] Server Response: "));
            Serial.println(responseBody);
        } else if (httpResponseCode == 401) {
            Serial.println(F("[HTTP] REJECTED (401 Unauthorized): Invalid or missing X-API-KEY."));
        } else {
            Serial.print(F("[HTTP] Unexpected Status: "));
            Serial.println(httpResponseCode);
            Serial.println(responseBody);
        }
    } else {
        Serial.print(F("[HTTP] Connection Error: "));
        Serial.println(http.errorToString(httpResponseCode));
        Serial.println(F("[HTTP] Verify backend is running and Windows Firewall allows port 8085."));
    }

    http.end();
}
