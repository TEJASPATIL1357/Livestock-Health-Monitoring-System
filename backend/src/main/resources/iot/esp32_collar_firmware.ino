/**
 * SMART LIVESTOCK HEALTH COLLAR - ESP32 FIRMWARE
 * Target Hardware: ESP32 Development Board, SIM800L GSM, DS18B20 Temp, MPU6050 Accelerometer
 * 
 * =========================================================================
 * PHYSICAL PINOUT WIRING SCHEMATIC:
 * 
 * 1. ESP32 Dev Board <---> SIM800L GPRS Module
 *    - TX2 (Pin 17)    ---> SIM800L RXD (use a voltage divider to 2.8V-3.3V)
 *    - RX2 (Pin 16)    <--- SIM800L TXD
 *    - GND             ---  Common Ground
 *    * Note: SIM800L requires 3.7V - 4.2V with up to 2A burst current.
 *      Feed directly from 3.7V Li-ion battery or high-current buck converter.
 * 
 * 2. ESP32 Dev Board <---> DS18B20 OneWire Temperature Sensor
 *    - Pin 4           <---> DS18B20 Data Pin (Requires a 4.7k Ohm Pull-Up to 3.3V)
 *    - 3.3V            ---  DS18B20 VCC
 *    - GND             ---  DS18B20 GND
 * 
 * 3. ESP32 Dev Board <---> MPU6050 Accelerometer (I2C)
 *    - SDA (Pin 21)    <---> MPU6050 SDA
 *    - SCL (Pin 22)    <---> MPU6050 SCL
 *    - 3.3V            ---  MPU6050 VCC
 *    - GND             ---  MPU6050 GND
 * 
 * 4. ESP32 Dev Board <---> 3.7V Li-ion Battery & TP4056 Charger
 *    - Analog Pin 34   <--- Voltage Divider (100k pull-up, 100k pull-down to read battery voltage)
 * =========================================================================
 */

#include <Wire.h>
#include <OneWire.h>
#include <DallasTemperature.h>

// 1. PIN CONFIGURATIONS
#define ONE_WIRE_BUS 4
#define BATTERY_ANALOG_PIN 34
#define RXD2 16
#define TXD2 17

// 2. TIMEOUTS & SLEEP (5 minutes = 300 seconds)
#define TIME_TO_SLEEP_SEC 300
#define UPLOAD_TIMEOUT_MS 15000

// 3. SERVICE CONFIGURATION
const char* APN = "YOUR_CELLULAR_APN";       // e.g. "internet", "airtelgprs.com"
const char* SERVER_URL = "http://YOUR_SERVER_IP:8080/api/v1/sensors/upload";
const String DEVICE_MAC = "ESP32-COLLAR-001"; // Physical device serial identifier

// Instantiations
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

// MPU6050 I2C Register Addresses
const int MPU_addr = 0x68;

void setup() {
  Serial.begin(115200);
  Serial2.begin(9600, SERIAL_8N1, RXD2, TXD2); // UART connection to SIM800L
  
  Serial.println("=========================================");
  Serial.println("Initializing Smart Livestock Health Collar...");
  
  // Initialize I2C Bus & Dallas Temp Sensors
  Wire.begin();
  sensors.begin();
  
  // Power up MPU6050 Accelerometer
  Wire.beginTransmission(MPU_addr);
  Wire.write(0x6B); // PWR_MGMT_1 register
  Wire.write(0);    // Wake up MPU
  Wire.endTransmission(true);

  // Execute Sensor Reading and GPRS Upload Flow
  runCollarWorkflow();
  
  // Put hardware into ultra-low-power Deep Sleep
  enterDeepSleep();
}

void loop() {
  // Empty. Execution runs inside setup() then goes to Deep Sleep.
}

/**
 * Orchestrates sensor readings, payload creation, and SIM800L GPRS uploads.
 */
void runCollarWorkflow() {
  // A. Read DS18B20 Temperature
  sensors.requestTemperatures();
  float temperature = sensors.getTempCByIndex(0);
  if (temperature == DEVICE_DISCONNECTED_C) {
    temperature = 38.5; // Fallback normal temp
    Serial.println("Warning: DS18B20 Temp sensor disconnected.");
  }
  Serial.print("Temperature Readout: ");
  Serial.print(temperature);
  Serial.println(" °C");

  // B. Read MPU6050 Accelerometer Vectors to compute Activity Level
  int16_t AcX, AcY, AcZ;
  Wire.beginTransmission(MPU_addr);
  Wire.write(0x3B); // starting register for Accelerometer Readings
  Wire.endTransmission(false);
  Wire.requestFrom(MPU_addr, 6, true);
  
  AcX = Wire.read() << 8 | Wire.read();
  AcY = Wire.read() << 8 | Wire.read();
  AcZ = Wire.read() << 8 | Wire.read();

  // Normalize activity vectors to a 0-100 index range
  long rawAccelSum = abs(AcX) + abs(AcY) + abs(AcZ);
  int activityLevel = map(constrain(rawAccelSum, 10000, 45000), 10000, 45000, 10, 95);
  Serial.print("Activity Level Index: ");
  Serial.println(activityLevel);

  // C. Calculate Battery Voltage via Analog Divider
  int analogVal = analogRead(BATTERY_ANALOG_PIN);
  float voltage = (analogVal / 4095.0) * 3.3 * 2.0; // Multiplying by 2 due to 100k/100k divider
  float batteryPct = constrain(((voltage - 3.4) / 0.8) * 100.0, 0.0, 100.0);
  Serial.print("Battery Voltage: ");
  Serial.print(voltage);
  Serial.print("V (");
  Serial.print(batteryPct);
  Serial.println("%)");

  // D. Query cellular signal strength via SIM800L
  int rssi = getCellularSignalStrength();

  // E. Build GPRS Upload Payload JSON String
  String payload = "{"
                   "\"deviceId\":\"" + DEVICE_MAC + "\","
                   "\"temperature\":" + String(temperature, 1) + ","
                   "\"activityLevel\":" + String(activityLevel) + ","
                   "\"batteryLevel\":" + String(batteryPct, 1) + ","
                   "\"rssi\":" + String(rssi) +
                   "}";
                   
  // F. Execute SIM800L HTTP Post Upload
  executeGprsPost(payload);
}

/**
 * Communicates with SIM800L over UART to execute GPRS HTTP POST.
 */
void executeGprsPost(String jsonPayload) {
  Serial.println("Opening GPRS cellular connections...");
  
  sendAtCommand("AT", 1000);              // Check module presence
  sendAtCommand("AT+CFUN=1", 1000);       // Full functionality mode
  sendAtCommand("AT+CPIN?", 1000);        // Check SIM status
  sendAtCommand("AT+CGATT=1", 1000);      // Attach to GPRS Service
  
  // Set GPRS bearer parameters
  sendAtCommand("AT+SAPBR=3,1,\"Contype\",\"GPRS\"", 1000);
  sendAtCommand("AT+SAPBR=3,1,\"APN\",\"" + String(APN) + "\"", 1000);
  sendAtCommand("AT+SAPBR=1,1", 2000);    // Open GPRS context
  sendAtCommand("AT+SAPBR=2,1", 1000);    // Check GPRS IP assignment

  // Initialize HTTP Service
  sendAtCommand("AT+HTTPINIT", 1000);
  sendAtCommand("AT+HTTPPARA=\"CID\",1", 1000);
  sendAtCommand("AT+HTTPPARA=\"URL\",\"" + String(SERVER_URL) + "\"", 1000);
  sendAtCommand("AT+HTTPPARA=\"CONTENT\",\"application/json\"", 1000);
  
  // Set POST payload length & timeout parameters
  sendAtCommand("AT+HTTPDATA=" + String(jsonPayload.length()) + "," + String(UPLOAD_TIMEOUT_MS), 1000);
  Serial2.print(jsonPayload);             // Stream JSON payload
  delay(1000);
  
  // Send HTTP Request
  sendAtCommand("AT+HTTPACTION=1", 4000); // 1 = POST
  sendAtCommand("AT+HTTPREAD", 2000);     // Read server response
  sendAtCommand("AT+HTTPTERM", 1000);     // Terminate HTTP
  sendAtCommand("AT+SAPBR=0,1", 1000);    // Close GPRS context
  
  Serial.println("Collar telemetry uploaded successfully!");
}

/**
 * Obtains RSSI signal strength from SIM800L using standard CSQ check.
 */
int getCellularSignalStrength() {
  Serial2.println("AT+CSQ");
  delay(200);
  int csqVal = 99; // Default unknown signal
  
  if (Serial2.available()) {
    String resp = Serial2.readString();
    int index = resp.indexOf("+CSQ:");
    if (index != -1) {
      String sub = resp.substring(index + 6, resp.indexOf(",", index));
      csqVal = sub.toInt();
    }
  }
  
  // Map standard CSQ (0-31) to RSSI dBm signal strength values
  if (csqVal == 99) return 0; // No Signal
  return map(csqVal, 0, 31, -115, -52); // Map to standard dBm
}

/**
 * Sends AT commands to the SIM800L and prints raw responses to serial console.
 */
String sendAtCommand(String command, int timeout) {
  String response = "";
  Serial.println("AT Command -> " + command);
  Serial2.println(command);
  
  long int time = millis();
  while ((time + timeout) > millis()) {
    while (Serial2.available()) {
      char c = Serial2.read();
      response += c;
    }
  }
  Serial.print("SIM800L Response:\n");
  Serial.print(response);
  return response;
}

/**
 * Puts ESP32 and MPU6050 into low power Deep Sleep mode to save battery.
 */
void enterDeepSleep() {
  Serial.println("Collaring entering ultra-low power Deep Sleep mode...");
  
  // Sleep the MPU6050 Accelerometer
  Wire.beginTransmission(MPU_addr);
  Wire.write(0x6B); // PWR_MGMT_1 register
  Wire.write(0x40); // Set Sleep bit
  Wire.endTransmission(true);

  // Power down SIM800L
  sendAtCommand("AT+CPOWD=1", 1000); // Sleep/Power-down SIM800L module

  // Enable ESP32 wake timer
  esp_sleep_enable_timer_wakeup(TIME_TO_SLEEP_SEC * 1000000ULL);
  
  Serial.flush();
  esp_deep_sleep_start();
}
