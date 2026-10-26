/**
 * ============================================================================
 * Smart Livestock Health — ESP32 Collar Firmware (Production Node)
 * ============================================================================
 * Target Livestock : Cow Nandini (Tag: 0001)
 * Device Identifier: ESP32-COLLAR-002
 * Target Farm      : New Farm
 * Production Base  : https://smart-livestock-backend-98l7.onrender.com
 * Telemetry Endpoint: /api/v1/sensors/upload
 *
 * Hardware Configuration:
 *   - Microcontroller : ESP32 DevKit V1
 *   - Temperature Bus : DS18B20 on GPIO 4 (Requires 4.7kΩ pull-up to 3.3V)
 *   - Motion/IMU Bus  : MPU-6050 / MPU-6500 on I2C (SDA=GPIO 21, SCL=GPIO 22)
 *                       Address 0x68 (Default)
 *
 * Resilience & Diagnostic Architecture:
 *   1. Dual-Path Time Sync (NTP with HTTP Date header fallback) ensures the
 *      system clock is strictly valid before initiating TLS.
 *   2. Strict TLS 1.3 certificate validation against Let's Encrypt ISRG Root X1.
 *      Never uses setInsecure().
 *   3. Safe multi-layer diagnostics test Wi-Fi, Internet, NTP, DNS, TCP port 443,
 *      and TLS handshakes to isolate network barriers.
 *   4. DS18B20 device address caching and 3-attempt read retry with 1-Wire reset
 *      eliminates intermittent -127°C / 85°C anomalies.
 *   5. All secrets (Wi-Fi password, device API key) remain strictly confidential
 *      and redacted from Serial output.
 * ============================================================================
 */

#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <Wire.h>
#include <time.h>
#include <sys/time.h>

// 1. Secure Local Credentials Inclusion
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
const unsigned long UPLOAD_INTERVAL_MS = 5000;         // 5-second normal sampling cadence
const unsigned long MAX_BACKOFF_INTERVAL_MS = 20000;   // 20-second max backoff on network failures
const unsigned long HTTP_TIMEOUT_MS = 25000;           // 25-second HTTP/TLS network timeout (Render spin-up tolerance)
const unsigned long EARLIEST_VALID_EPOCH = 1704067200; // Jan 1, 2024 (validity floor for TLS)

// 4. Peripherals & Sensors
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature tempSensor(&oneWire);
DeviceAddress tempSensorAddr;
bool tempSensorFound = false;

unsigned long lastUploadTime = 0;
unsigned long currentIntervalMs = UPLOAD_INTERVAL_MS;
int consecutiveFailures = 0;
bool mpuInitialized = false;

/**
 * Parses HTTP Date header format: "Day, DD Mon YYYY HH:MM:SS GMT"
 * Returns UNIX epoch timestamp, or 0 on failure.
 */
time_t parseHttpDate(const char* dateStr) {
    if (!dateStr || strlen(dateStr) < 25) return 0;
    const char* p = strchr(dateStr, ' ');
    if (!p) return 0;
    p++; // Points to DD
    int day = atoi(p);
    p = strchr(p, ' ');
    if (!p) return 0;
    p++; // Points to Mon
    char monStr[4] = { p[0], p[1], p[2], '\0' };
    int month = 0;
    const char* months[] = {"Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"};
    for (int i = 0; i < 12; i++) {
        if (strcasecmp(monStr, months[i]) == 0) {
            month = i;
            break;
        }
    }
    p = strchr(p, ' ');
    if (!p) return 0;
    p++; // Points to YYYY
    int year = atoi(p);
    p = strchr(p, ' ');
    if (!p) return 0;
    p++; // Points to HH:MM:SS
    int hour = 0, minute = 0, second = 0;
    sscanf(p, "%d:%d:%d", &hour, &minute, &second);

    struct tm tmTime;
    memset(&tmTime, 0, sizeof(tmTime));
    tmTime.tm_year = year - 1900;
    tmTime.tm_mon = month;
    tmTime.tm_mday = day;
    tmTime.tm_hour = hour;
    tmTime.tm_min = minute;
    tmTime.tm_sec = second;

    return mktime(&tmTime);
}

/**
 * Dual-path system clock synchronizer.
 * Primary: NTP (UDP 123) with multiple global servers.
 * Fallback: Plain HTTP Date header from Render port 80 (bypasses UDP 123 blocking on cellular hotspots).
 */
bool syncSystemTime() {
    Serial.println(F("[TIME] Synchronizing system clock for strict TLS verification..."));

    // 1. Primary: NTP via SNTP
    configTime(0, 0, "pool.ntp.org", "time.google.com", "time.cloudflare.com");
    unsigned long ntpStart = millis();
    while (millis() - ntpStart < 6000) {
        time_t now = time(nullptr);
        if (now >= EARLIEST_VALID_EPOCH) {
            struct tm timeinfo;
            gmtime_r(&now, &timeinfo);
            Serial.printf("[NTP] SUCCESS: Clock synced via NTP (%04d-%02d-%02d %02d:%02d:%02d UTC)\n",
                timeinfo.tm_year + 1900, timeinfo.tm_mon + 1, timeinfo.tm_mday,
                timeinfo.tm_hour, timeinfo.tm_min, timeinfo.tm_sec);
            return true;
        }
        delay(300);
        Serial.print(F("."));
    }
    Serial.println();
    Serial.println(F("[NTP] Warning: NTP timed out (UDP port 123 may be filtered by carrier/hotspot)."));

    // 2. Fallback: HTTP Date header from backend host (Port 80 plain HTTP)
    Serial.println(F("[TIME] Attempting HTTP Date fallback via port 80 to backend..."));
    HTTPClient httpFallback;
    WiFiClient plainClient;
    const char* healthUrl = "http://smart-livestock-backend-98l7.onrender.com/api/v1/health";
    httpFallback.begin(plainClient, healthUrl);
    httpFallback.setTimeout(8000);
    const char* headerKeys[] = {"Date"};
    httpFallback.collectHeaders(headerKeys, 1);
    int httpCode = httpFallback.GET();

    if (httpCode > 0 && httpFallback.hasHeader("Date")) {
        String dateHeader = httpFallback.header("Date");
        time_t parsedTime = parseHttpDate(dateHeader.c_str());
        if (parsedTime >= EARLIEST_VALID_EPOCH) {
            struct timeval tv = { .tv_sec = parsedTime, .tv_usec = 0 };
            settimeofday(&tv, NULL);
            struct tm timeinfo;
            gmtime_r(&parsedTime, &timeinfo);
            Serial.printf("[HTTP-TIME] SUCCESS: Clock set via HTTP Date header (%04d-%02d-%02d %02d:%02d:%02d UTC)\n",
                timeinfo.tm_year + 1900, timeinfo.tm_mon + 1, timeinfo.tm_mday,
                timeinfo.tm_hour, timeinfo.tm_min, timeinfo.tm_sec);
            httpFallback.end();
            return true;
        }
    }
    httpFallback.end();

    time_t finalCheck = time(nullptr);
    if (finalCheck < EARLIEST_VALID_EPOCH) {
        Serial.println(F("[TIME] CRITICAL: Clock unsynchronized! TLS certificate validation will fail until clock is set."));
        return false;
    }
    return true;
}

/**
 * Comprehensive diagnostic check inspecting Wi-Fi, Internet, NTP, DNS, TCP, and TLS.
 */
void runNetworkDiagnostics() {
    Serial.println(F("\n====== [DIAGNOSTICS] Network & TLS Health Check ======"));

    // 1. Wi-Fi Status & Addressing
    Serial.printf("[DIAG] 1. Wi-Fi Connection : %s (SSID: %s, RSSI: %d dBm)\n",
        (WiFi.status() == WL_CONNECTED) ? "CONNECTED" : "DISCONNECTED",
        WIFI_SSID, WiFi.RSSI());
    Serial.printf("[DIAG]    Local IP         : %s\n", WiFi.localIP().toString().c_str());
    Serial.printf("[DIAG]    Gateway IP       : %s\n", WiFi.gatewayIP().toString().c_str());
    Serial.printf("[DIAG]    DNS Server IP    : %s\n", WiFi.dnsIP().toString().c_str());

    // 2. Internet Reachability Test (TCP to 8.8.8.8:53)
    WiFiClient pingClient;
    bool internetOk = pingClient.connect(IPAddress(8, 8, 8, 8), 53, 3000);
    pingClient.stop();
    Serial.printf("[DIAG] 2. Internet Uplink  : %s\n", internetOk ? "OK (TCP to 8.8.8.8:53 succeeded)" : "FAILED (No route to public internet)");

    // 3. System Time & TLS Clock Validity
    time_t now = time(nullptr);
    struct tm timeinfo;
    gmtime_r(&now, &timeinfo);
    char timeBuf[32];
    strftime(timeBuf, sizeof(timeBuf), "%Y-%m-%d %H:%M:%S UTC", &timeinfo);
    bool timeOk = (now >= EARLIEST_VALID_EPOCH);
    Serial.printf("[DIAG] 3. System Clock     : %s (Status: %s)\n", timeBuf, timeOk ? "VALID FOR TLS" : "INVALID (Year < 2024)");

    // 4. DNS Resolution of Production Backend
    const char* backendHost = "smart-livestock-backend-98l7.onrender.com";
    IPAddress backendIp;
    bool dnsOk = WiFi.hostByName(backendHost, backendIp);
    if (dnsOk) {
        Serial.printf("[DIAG] 4. DNS Resolution   : OK (%s -> %s)\n", backendHost, backendIp.toString().c_str());
    } else {
        Serial.printf("[DIAG] 4. DNS Resolution   : FAILED (Could not resolve host %s)\n", backendHost);
    }

    // 5. TCP Connectivity to Port 443
    if (dnsOk) {
        WiFiClient tcpClient;
        bool tcpOk = tcpClient.connect(backendIp, 443, 4000);
        tcpClient.stop();
        Serial.printf("[DIAG] 5. TCP Port 443     : %s\n", tcpOk ? "OK (Port 443 accepting connections)" : "FAILED (Connection refused or timed out)");
    } else {
        Serial.println(F("[DIAG] 5. TCP Port 443     : SKIPPED (DNS unresolved)"));
    }

    // 6. TLS Handshake & Certificate Verification
    if (dnsOk && timeOk) {
        WiFiClientSecure diagSecure;
        diagSecure.setCACert(ISRG_ROOT_X1_CA_CERT);
        diagSecure.setTimeout(15);
        diagSecure.setHandshakeTimeout(15);
        Serial.println(F("[DIAG] 6. Testing TLS 1.3 Handshake with ISRG Root X1 CA..."));
        bool tlsOk = diagSecure.connect(backendHost, 443, 15000);
        if (tlsOk) {
            Serial.println(F("[DIAG] 6. TLS Handshake    : SUCCESS (Strict certificate verified)"));
            diagSecure.stop();
        } else {
            char errBuf[128] = {0};
            diagSecure.lastError(errBuf, sizeof(errBuf));
            Serial.printf("[DIAG] 6. TLS Handshake    : FAILED (Detail: %s)\n", strlen(errBuf) > 0 ? errBuf : "Handshake rejected or timeout");
        }
    } else if (!timeOk) {
        Serial.println(F("[DIAG] 6. TLS Handshake    : SKIPPED (Clock invalid, TLS certificate check would fail)"));
    }
    Serial.println(F("======================================================\n"));
}

/**
 * Initializes DS18B20 1-Wire sensor, discovers device address, and sets 11-bit resolution.
 */
void initTemperatureSensor() {
    Serial.println(F("[DS18B20] Scanning 1-Wire bus on GPIO 4..."));
    tempSensor.begin();
    int count = tempSensor.getDeviceCount();
    Serial.printf("[DS18B20] Sensor count: %d\n", count);

    if (count > 0 && tempSensor.getAddress(tempSensorAddr, 0)) {
        tempSensorFound = true;
        // 11-bit resolution gives 0.125°C precision with 375ms conversion time (50% faster than 12-bit)
        tempSensor.setResolution(tempSensorAddr, 11);
        tempSensor.setWaitForConversion(false);
        Serial.print(F("[DS18B20] Sensor ROM: "));
        for (uint8_t i = 0; i < 8; i++) {
            Serial.printf("%02X", tempSensorAddr[i]);
        }
        Serial.println(F(" (11-bit resolution active)"));
    } else {
        tempSensorFound = false;
        Serial.println(F("[DS18B20] WARNING: No sensor detected. Check GPIO 4 & 4.7kΩ pull-up resistor."));
    }
}

/**
 * Robust temperature acquisition with 3-attempt retry and bus re-initialization.
 * Rejects -127°C, 85°C power-on resets, and invalid readings.
 */
float acquireValidTemperature(int maxRetries = 3) {
    for (int attempt = 1; attempt <= maxRetries; attempt++) {
        if (!tempSensorFound) {
            tempSensor.begin();
            if (!tempSensor.getAddress(tempSensorAddr, 0)) {
                delay(100);
                continue;
            }
            tempSensorFound = true;
            tempSensor.setResolution(tempSensorAddr, 11);
            tempSensor.setWaitForConversion(false);
        }

        // Request conversion on specific ROM address (bypasses searchROM on bus)
        tempSensor.requestTemperaturesByAddress(tempSensorAddr);
        delay(380); // Wait 380ms for 11-bit conversion (max 375ms required)

        float tempC = tempSensor.getTempC(tempSensorAddr);

        // Discard -127°C (disconnected) and 85°C (power-on reset scratchpad)
        if (tempC > -126.0f && tempC < 84.9f && tempC > 0.0f) {
            return tempC; // Valid reading
        }

        Serial.printf("[DS18B20] Read attempt %d/%d invalid (returned %.2f °C). Resetting 1-Wire bus...\n", attempt, maxRetries, tempC);
        tempSensor.begin();
        delay(100);
    }
    return DEVICE_DISCONNECTED_C;
}

/**
 * Initializes MPU sensor via direct register write (clearing sleep bit in PWR_MGMT_1).
 */
bool initMpuRaw() {
    Wire.beginTransmission(MPU_I2C_ADDR);
    Wire.write(MPU_REG_PWR_MGMT_1);
    Wire.write(0x00);
    byte error = Wire.endTransmission(true);

    if (error == 0) {
        Serial.println(F("[MPU] Woke up sensor at I2C 0x68 (PWR_MGMT_1 cleared)."));
        return true;
    } else {
        Serial.printf("[MPU] Warning: Contact failed at 0x68 (Error code: %d)\n", error);
        return false;
    }
}

/**
 * Reads 6-DoF accelerometer and gyroscope raw counts.
 */
bool readMpuRaw(int16_t &ax, int16_t &ay, int16_t &az, int16_t &gx, int16_t &gy, int16_t &gz) {
    Wire.beginTransmission(MPU_I2C_ADDR);
    Wire.write(MPU_REG_ACCEL_XOUT_H);
    if (Wire.endTransmission(false) != 0) {
        return false;
    }

    if (Wire.requestFrom((uint8_t)MPU_I2C_ADDR, (size_t)14, true) != 14) {
        return false;
    }

    ax = (Wire.read() << 8) | Wire.read();
    ay = (Wire.read() << 8) | Wire.read();
    az = (Wire.read() << 8) | Wire.read();
    Wire.read(); Wire.read(); // Skip die temp
    gx = (Wire.read() << 8) | Wire.read();
    gy = (Wire.read() << 8) | Wire.read();
    gz = (Wire.read() << 8) | Wire.read();

    return true;
}

/**
 * Ensures Wi-Fi connection and re-syncs system clock if needed.
 */
void ensureWiFiConnection() {
    if (WiFi.status() == WL_CONNECTED) {
        return;
    }

    Serial.println();
    Serial.printf("[WIFI] Connecting to SSID: %s\n", WIFI_SSID);

    WiFi.mode(WIFI_STA);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

    unsigned long startAttempt = millis();
    while (WiFi.status() != WL_CONNECTED && (millis() - startAttempt < 12000)) {
        delay(500);
        Serial.print(F("."));
    }
    Serial.println();

    if (WiFi.status() == WL_CONNECTED) {
        Serial.printf("[WIFI] Connected! Assigned IP: %s (RSSI: %d dBm)\n",
            WiFi.localIP().toString().c_str(), WiFi.RSSI());

        time_t now = time(nullptr);
        if (now < EARLIEST_VALID_EPOCH) {
            syncSystemTime();
        }
    } else {
        Serial.println(F("[WIFI] Connection failed. Will retry next cycle."));
    }
}

/**
 * Retrieves ISO-8601 UTC timestamp string.
 */
bool getIso8601Timestamp(char* buffer, size_t maxLen) {
    time_t now = time(nullptr);
    if (now < EARLIEST_VALID_EPOCH) {
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

    Serial.println(F("\n=================================================="));
    Serial.println(F(" Smart Livestock Health — ESP32 Collar Node      "));
    Serial.println(F(" Target: Cow Nandini (0001) | ESP32-COLLAR-002    "));
    Serial.println(F(" Endpoint: Render Production HTTPS (/sensors/upload) "));
    Serial.println(F("=================================================="));

    // Print sanitized configuration summary (no raw secrets exposed)
    Serial.printf("[CONFIG] Device Identifier : %s\n", DEVICE_IDENTIFIER);
    Serial.printf("[CONFIG] Target Server URL : %s\n", SERVER_URL);
    Serial.printf("[CONFIG] Wi-Fi SSID        : %s\n", WIFI_SSID);
    Serial.println(F("[CONFIG] Wi-Fi Password    : [CONFIGURED - REDACTED]"));
    Serial.println(F("[CONFIG] Device API Key    : [CONFIGURED - REDACTED]"));

    // 1. Initialize DS18B20 1-Wire bus on GPIO 4
    initTemperatureSensor();

    // 2. Initialize I2C Bus for MPU on GPIO 21 (SDA), GPIO 22 (SCL)
    Serial.println(F("[I2C] Initializing Wire on SDA=21, SCL=22..."));
    Wire.begin(I2C_SDA_PIN, I2C_SCL_PIN, 100000);
    mpuInitialized = initMpuRaw();

    // 3. Connect to Wi-Fi and sync clock
    ensureWiFiConnection();

    // 4. Run baseline network diagnostics
    if (WiFi.status() == WL_CONNECTED) {
        runNetworkDiagnostics();
    }
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

    // Verify system time before attempting HTTPS
    time_t checkNow = time(nullptr);
    if (checkNow < EARLIEST_VALID_EPOCH) {
        Serial.println(F("[LOOP] System clock not yet synchronized. Syncing before HTTPS..."));
        if (!syncSystemTime()) {
            Serial.println(F("[LOOP] Clock sync failed. Skipping HTTPS to prevent TLS certificate rejection."));
            return;
        }
    }

    // 1. Acquire DS18B20 Temperature with retry & 1-Wire reset
    float tempC = acquireValidTemperature(3);
    bool hasValidTemp = (tempC > -126.0f && tempC < 65.0f && tempC > 0.0f);

    if (!hasValidTemp) {
        Serial.println(F("[DS18B20] ERROR: Sensor disconnected / invalid (-127°C). Transmission skipped to prevent database corruption."));
        consecutiveFailures++;
        if (consecutiveFailures >= 3) {
            currentIntervalMs = min(currentIntervalMs + 2000, MAX_BACKOFF_INTERVAL_MS);
        }
        return;
    }

    Serial.println(F("--------------------------------------------------"));
    Serial.printf("[DS18B20] Temperature: %.2f °C (VALID)\n", tempC);

    // 2. Acquire MPU-6050/6500 Movement Sensor Raw Counts
    int16_t ax = 0, ay = 0, az = 0, gx = 0, gy = 0, gz = 0;
    bool hasMovement = false;

    if (!mpuInitialized) {
        mpuInitialized = initMpuRaw();
    }

    if (mpuInitialized) {
        if (readMpuRaw(ax, ay, az, gx, gy, gz)) {
            hasMovement = true;
            Serial.printf("[MPU RAW] Accel (counts): X=%d Y=%d Z=%d\n", ax, ay, az);
            Serial.printf("[MPU RAW] Gyro  (counts): X=%d Y=%d Z=%d\n", gx, gy, gz);
        } else {
            Serial.println(F("[MPU] Warning: Read failed on I2C bus. Sending temp-only."));
            mpuInitialized = false;
        }
    } else {
        Serial.println(F("[MPU] Movement sensor not available. Sending temp-only."));
    }

    // 3. Assemble JSON Payload
    char isoTimestamp[32];
    bool hasTimestamp = getIso8601Timestamp(isoTimestamp, sizeof(isoTimestamp));

    char payload[320];
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

    Serial.printf("[HTTP] POST JSON: %s\n", payload);

    // 4. Perform HTTPS POST with strict TLS certificate verification
    HTTPClient http;
    WiFiClient plainClient;
    WiFiClientSecure secureClient;
    bool isHttps = String(SERVER_URL).startsWith("https://");
    bool beginSuccess = false;

    if (isHttps) {
        // Enforce strict TLS certificate verification with Let's Encrypt ISRG Root X1 CA
        secureClient.setCACert(ISRG_ROOT_X1_CA_CERT);
        secureClient.setTimeout(HTTP_TIMEOUT_MS / 1000);
        secureClient.setHandshakeTimeout(HTTP_TIMEOUT_MS / 1000);
        beginSuccess = http.begin(secureClient, SERVER_URL);
    } else {
        beginSuccess = http.begin(plainClient, SERVER_URL);
    }

    if (!beginSuccess) {
        Serial.println(F("[HTTP] ERROR: Unable to initialize connection to SERVER_URL."));
        runNetworkDiagnostics();
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
        Serial.printf("[HTTP] Status: %d\n", httpResponseCode);
        String responseBody = http.getString();

        if (httpResponseCode == 201) {
            Serial.println(F("[HTTP] SUCCESS (201 Created)! Reading stored for Cow Nandini (0001)."));
            Serial.printf("[HTTP] Response: %s\n", responseBody.c_str());
            consecutiveFailures = 0;
            currentIntervalMs = UPLOAD_INTERVAL_MS;
        } else if (httpResponseCode == 400) {
            Serial.printf("[HTTP] REJECTED (400 Bad Request): %s\n", responseBody.c_str());
        } else if (httpResponseCode == 401) {
            Serial.println(F("[HTTP] REJECTED (401 Unauthorized): API key hash mismatch or device unmapped."));
        } else if (httpResponseCode == 503) {
            Serial.println(F("[HTTP] 503 Service Unavailable: Backend cold-starting or restarting on Render."));
        } else {
            Serial.printf("[HTTP] Response Code %d: %s\n", httpResponseCode, responseBody.c_str());
        }
    } else {
        Serial.printf("[HTTP] Error: %s (Code: %d)\n", http.errorToString(httpResponseCode).c_str(), httpResponseCode);
        
        // Run deep diagnostics on connection failure
        runNetworkDiagnostics();

        consecutiveFailures++;
        if (consecutiveFailures >= 3) {
            currentIntervalMs = min(currentIntervalMs + 2000, MAX_BACKOFF_INTERVAL_MS);
            Serial.printf("[RETRY] Consecutive failures: %d. Backing off interval to %lu ms.\n",
                consecutiveFailures, currentIntervalMs);
        }
    }

    http.end();
}
