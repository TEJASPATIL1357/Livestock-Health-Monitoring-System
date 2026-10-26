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

// Trusted Root CA Certificate Bundle for Render (*.onrender.com)
// Includes:
//   1. Official ISRG Root X1 (Let's Encrypt Root CA, valid until 2035)
//   2. Official GTS Root R4 (Google Trust Services Root CA, valid until 2036)
// Formatted with clean C/C++ string concatenation and valid \n line endings.
const char* ISRG_ROOT_X1_CA_CERT =
"-----BEGIN CERTIFICATE-----\n"
"MIIFazCCA1OgAwIBAgIRAIIQz7DSQONZRGPgu2OCiwAwDQYJKoZIhvcNAQELBQAw\n"
"TzELMAkGA1UEBhMCVVMxKTAnBgNVBAoTIEludGVybmV0IFNlY3VyaXR5IFJlc2Vh\n"
"cmNoIEdyb3VwMRUwEwYDVQQDEwxJU1JHIFJvb3QgWDEwHhcNMTUwNjA0MTEwNDM4\n"
"WhcNMzUwNjA0MTEwNDM4WjBPMQswCQYDVQQGEwJVUzEpMCcGA1UEChMgSW50ZXJu\n"
"ZXQgU2VjdXJpdHkgUmVzZWFyY2ggR3JvdXAxFTATBgNVBAMTDElTUkcgUm9vdCBY\n"
"MTCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBAK3oJHP0FDfzm54rVygc\n"
"h77ct984kIxuPOZXoHj3dcKi/vVqbvYATyjb3miGbESTtrFj/RQSa78f0uoxmyF+\n"
"0TM8ukj13Xnfs7j/EvEhmkvBioZxaUpmZmyPfjxwv60pIgbz5MDmgK7iS4+3mX6U\n"
"A5/TR5d8mUgjU+g4rk8Kb4Mu0UlXjIB0ttov0DiNewNwIRt18jA8+o+u3dpjq+sW\n"
"T8KOEUt+zwvo/7V3LvSye0rgTBIlDHCNAymg4VMk7BPZ7hm/ELNKjD+Jo2FR3qyH\n"
"B5T0Y3HsLuJvW5iB4YlcNHlsdu87kGJ55tukmi8mxdAQ4Q7e2RCOFvu396j3x+UC\n"
"B5iPNgiV5+I3lg02dZ77DnKxHZu8A/lJBdiB3QW0KtZB6awBdpUKD9jf1b0SHzUv\n"
"KBds0pjBqAlkd25HN7rOrFleaJ1/ctaJxQZBKT5ZPt0m9STJEadao0xAH0ahmbWn\n"
"OlFuhjuefXKnEgV4We0+UXgVCwOPjdAvBbI+e0ocS3MFEvzG6uBQE3xDk3SzynTn\n"
"jh8BCNAw1FtxNrQHusEwMFxIt4I7mKZ9YIqioymCzLq9gwQbooMDQaHWBfEbwrbw\n"
"qHyGO0aoSCqI3Haadr8faqU9GY/rOPNk3sgrDQoo//fb4hVC1CLQJ13hef4Y53CI\n"
"rU7m2Ys6xt0nUW7/vGT1M0NPAgMBAAGjQjBAMA4GA1UdDwEB/wQEAwIBBjAPBgNV\n"
"HRMBAf8EBTADAQH/MB0GA1UdDgQWBBR5tFnme7bl5AFzgAiIyBpY9umbbjANBgkq\n"
"hkiG9w0BAQsFAAOCAgEAVR9YqbyyqFDQDLHYGmkgJykIrGF1XIpu+ILlaS/V9lZL\n"
"ubhzEFnTIZd+50xx+7LSYK05qAvqFyFWhfFQDlnrzuBZ6brJFe+GnY+EgPbk6ZGQ\n"
"3BebYhtF8GaV0nxvwuo77x/Py9auJ/GpsMiu/X1+mvoiBOv/2X/qkSsisRcOj/KK\n"
"NFtY2PwByVS5uCbMiogziUwthDyC3+6WVwW6LLv3xLfHTjuCvjHIInNzktHCgKQ5\n"
"ORAzI4JMPJ+GslWYHb4phowim57iaztXOoJwTdwJx4nLCgdNbOhdjsnvzqvHu7Ur\n"
"TkXWStAmzOVyyghqpZXjFaH3pO3JLF+l+/+sKAIuvtd7u+Nxe5AW0wdeRlN8NwdC\n"
"jNPElpzVmbUq4JUagEiuTDkHzsxHpFKVK7q4+63SM1N95R1NbdWhscdCb+ZAJzVc\n"
"oyi3B43njTOQ5yOf+1CceWxG1bQVs5ZufpsMljq4Ui0/1lvh+wjChP4kqKOJ2qxq\n"
"4RgqsahDYVvTH9w7jXbyLeiNdd8XM2w9U/t7y0Ff/9yi0GE44Za4rF2LN9d11TPA\n"
"mRGunUHBcnWEvgJBQl9nJEiU0Zsnvgc/ubhPgXRR4Xq37Z0j4r7g1SgEEzwxA57d\n"
"emyPxgcYxn/eR44/KJ4EBs+lVDR3veyJm+kXQ99b21/+jh5Xos1AnX5iItreGCc=\n"
"-----END CERTIFICATE-----\n"
"-----BEGIN CERTIFICATE-----\n"
"MIICCTCCAY6gAwIBAgINAgPlwGjvYxqccpBQUjAKBggqhkjOPQQDAzBHMQswCQYD\n"
"VQQGEwJVUzEiMCAGA1UEChMZR29vZ2xlIFRydXN0IFNlcnZpY2VzIExMQzEUMBIG\n"
"A1UEAxMLR1RTIFJvb3QgUjQwHhcNMTYwNjIyMDAwMDAwWhcNMzYwNjIyMDAwMDAw\n"
"WjBHMQswCQYDVQQGEwJVUzEiMCAGA1UEChMZR29vZ2xlIFRydXN0IFNlcnZpY2Vz\n"
"IExMQzEUMBIGA1UEAxMLR1RTIFJvb3QgUjQwdjAQBgcqhkjOPQIBBgUrgQQAIgNi\n"
"AATzdHOnaItgrkO4NcWBMHtLSZ37wWHO5t5GvWvVYRg1rkDdc/eJkTBa6zzuhXyi\n"
"QHY7qca4R9gq55KRanPpsXI5nymfopjTX15YhmUPoYRlBtHci8nHc8iMai/lxKvR\n"
"HYqjQjBAMA4GA1UdDwEB/wQEAwIBhjAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQW\n"
"BBSATNbrdP9JNqPV2Py1PsVq8JQdjDAKBggqhkjOPQQDAwNpADBmAjEA6ED/g94D\n"
"9J+uHXqnLrmvT/aDHQ4thQEd0dlq7A/Cr8deVl5c1RxYIigL9zC2L7F8AjEA8GE8\n"
"pabBzmBdZpPOweNoAj4iylKz1smS2UvK5wW5ZZAPq2e4/Yk7WbC0wJszN5ug\n"
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
 * Parses RFC 2822 / HTTP Date header into UNIX epoch timestamp.
 * Supported format: "[Day,] DD Mon YYYY HH:MM:SS GMT"
 * Uses pure UTC calendar arithmetic to prevent local timezone offsets from skewing the clock.
 */
time_t parseHttpDate(const char* dateStr) {
    if (!dateStr || strlen(dateStr) < 20) return 0;

    const char* p = dateStr;
    if (strchr(p, ',')) {
        p = strchr(p, ',');
        p++;
    }
    while (*p == ' ') p++;

    int day = atoi(p);
    if (day < 1 || day > 31) return 0;

    p = strchr(p, ' ');
    if (!p) return 0;
    while (*p == ' ') p++;

    char monStr[4] = { p[0], p[1], p[2], '\0' };
    int month = -1;
    static const char* months[] = {"Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"};
    for (int i = 0; i < 12; i++) {
        if (strcasecmp(monStr, months[i]) == 0) {
            month = i;
            break;
        }
    }
    if (month == -1) return 0;

    p = strchr(p, ' ');
    if (!p) return 0;
    while (*p == ' ') p++;

    int year = atoi(p);
    if (year < 2024 || year > 2035) return 0;

    p = strchr(p, ' ');
    if (!p) return 0;
    while (*p == ' ') p++;

    int hour = 0, minute = 0, second = 0;
    if (sscanf(p, "%d:%d:%d", &hour, &minute, &second) < 3) return 0;
    if (hour < 0 || hour > 23 || minute < 0 || minute > 59 || second < 0 || second > 60) return 0;

    // Pure UTC epoch conversion (no local timezone dependency)
    static const int daysBeforeMonth[] = {0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334};
    int y = year - 1970;
    int leapDays = (year - 1969) / 4 - (year - 1901) / 100 + (year - 1601) / 400;
    bool isLeap = ((year % 4 == 0 && year % 100 != 0) || (year % 400 == 0));
    int days = y * 365 + leapDays + daysBeforeMonth[month];
    if (isLeap && month > 1) days++;
    days += (day - 1);

    return (time_t)days * 86400ULL + (time_t)hour * 3600ULL + (time_t)minute * 60ULL + (time_t)second;
}

/**
 * Dual-path system clock synchronizer.
 * Primary: Tier-1 Anycast NTP pools (time.google.com, time.cloudflare.com, pool.ntp.org).
 * Fallback: Trusted plain HTTP Date header endpoints (connectivitycheck.gstatic.com, google.com).
 *
 * SECURITY NOTE:
 * The HTTP Date fallback is used strictly as a non-cryptographic bootstrap hint to advance
 * the RTC from 1970 into the certificate validity window. Full cryptographic trust is strictly
 * enforced during the subsequent TLS 1.3 handshake via ISRG Root X1 and GTS Root R4 certificate validation.
 */
bool syncSystemTime() {
    Serial.println(F("[TIME] Synchronizing system clock for strict TLS verification..."));

    // 1. Primary: Anycast Tier-1 NTP via SNTP (UDP port 123)
    configTime(0, 0, "time.google.com", "time.cloudflare.com", "pool.ntp.org");
    unsigned long ntpStart = millis();
    while (millis() - ntpStart < 8000) {
        time_t now = time(nullptr);
        if (now >= EARLIEST_VALID_EPOCH) {
            struct tm timeinfo;
            gmtime_r(&now, &timeinfo);
            Serial.printf("[NTP] SUCCESS: Clock synced via Tier-1 NTP (%04d-%02d-%02d %02d:%02d:%02d UTC)\n",
                timeinfo.tm_year + 1900, timeinfo.tm_mon + 1, timeinfo.tm_mday,
                timeinfo.tm_hour, timeinfo.tm_min, timeinfo.tm_sec);
            return true;
        }
        delay(300);
        Serial.print(F("."));
    }
    Serial.println();
    Serial.println(F("[NTP] Warning: NTP timed out (UDP port 123 may be filtered by carrier/hotspot)."));

    // 2. Fallback: High-availability HTTP bootstrap endpoints
    static const char* BOOTSTRAP_URLS[] = {
        "http://connectivitycheck.gstatic.com/generate_204",
        "http://www.google.com",
        "http://smart-livestock-backend-98l7.onrender.com/api/v1/health"
    };

    Serial.println(F("[TIME] Attempting HTTP Date fallback for TLS clock bootstrap..."));
    HTTPClient httpFallback;
    WiFiClient plainClient;
    const char* headerKeys[] = {"Date"};

    for (size_t i = 0; i < sizeof(BOOTSTRAP_URLS) / sizeof(BOOTSTRAP_URLS[0]); i++) {
        const char* targetUrl = BOOTSTRAP_URLS[i];
        Serial.printf("[TIME] Probing fallback endpoint: %s\n", targetUrl);

        httpFallback.begin(plainClient, targetUrl);
        httpFallback.setTimeout(4000);
        httpFallback.collectHeaders(headerKeys, 1);
        int httpCode = httpFallback.GET();

        if (httpCode > 0 && httpFallback.hasHeader("Date")) {
            String dateHeader = httpFallback.header("Date");
            time_t parsedTime = parseHttpDate(dateHeader.c_str());

            if (parsedTime >= EARLIEST_VALID_EPOCH && parsedTime <= 2051222400) {
                struct timeval tv = { .tv_sec = parsedTime, .tv_usec = 0 };
                settimeofday(&tv, NULL);
                struct tm timeinfo;
                gmtime_r(&parsedTime, &timeinfo);

                Serial.printf("[HTTP-BOOTSTRAP] SUCCESS: Clock set via %s\n", targetUrl);
                Serial.printf("[HTTP-BOOTSTRAP] Validated Time: %04d-%02d-%02d %02d:%02d:%02d UTC (Epoch: %ld)\n",
                    timeinfo.tm_year + 1900, timeinfo.tm_mon + 1, timeinfo.tm_mday,
                    timeinfo.tm_hour, timeinfo.tm_min, timeinfo.tm_sec, (long)parsedTime);
                Serial.println(F("[SECURITY] Note: HTTP Date used solely as TLS bootstrap hint. TLS certificate validation will strictly authenticate server."));

                httpFallback.end();
                return true;
            }
        }
        httpFallback.end();
    }

    time_t finalCheck = time(nullptr);
    if (finalCheck < EARLIEST_VALID_EPOCH) {
        Serial.println(F("[TIME] WARNING: Clock unsynchronized! Telemetry upload will retry next cycle to prevent TLS rejection."));
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
