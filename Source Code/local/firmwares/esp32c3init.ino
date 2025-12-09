#include <WiFi.h>
#include <PubSubClient.h>
#include <MFRC522.h>
#include <SPI.h>
#include <HTTPClient.h>
#include <Update.h>
#include <ArduinoJson.h>

#define LED_PIN 2
#define BUZZER_PIN 0
#define RFID_RST_PIN 3
#define RFID_SDA_PIN 10

// -------------------------
// CONFIG TẬP TRUNG
// -------------------------
struct DeviceConfig {
  const char* ssid = "ZG04";
  const char* pass = "zg04ckpt";

  const char* mqttServer = "10.55.155.99";
  int mqttPort = 1883;
  const char* mqttTopic = "esp32c3";
  const char* mqttClientId = "esp32c3";

  const char* apiKey = "[KEY]";
  int deviceId = [ID];

  const char* firmwareBaseUrl = "http://10.55.155.99:4000";

  String currentVersion = "[VERSION]";

  String getVersionCheckUrl() const {
    return "http://10.55.155.99:4000/api/devices/check-version?device_id=" +
           String(deviceId) +
           "&key=" + apiKey;
  }
};

DeviceConfig cfg;

// -------------------------
WiFiClient espClient;
PubSubClient mqttClient(espClient);
MFRC522 mfrc522(RFID_SDA_PIN, RFID_RST_PIN);

unsigned long lastVersionCheck = 0;
const unsigned long versionCheckInterval = 5000;

// -------------------------
// STATUS UPDATE
// -------------------------
void updateStatus(const String& status) {
  Serial.println("[STATUS] -> " + status);

  HTTPClient http;
  http.begin("http://10.55.155.99:4000/api/devices/update-status");
  http.addHeader("Content-Type", "application/json");

  String jsonBody = "{"
                      "\"key\":\"" + String(cfg.apiKey) + "\","
                      "\"device_id\":" + String(cfg.deviceId) + ","
                      "\"status\":\"" + status + "\""
                    "}";

  int httpCode = http.POST(jsonBody);
  if (httpCode > 0) {
    Serial.printf("[STATUS] HTTP code: %d\n", httpCode);
    String response = http.getString();
    Serial.println("[STATUS] Server response: " + response);
  } else {
    Serial.printf("[STATUS] ERROR sending status: %s\n", http.errorToString(httpCode).c_str());
  }

  http.end();
}

// -------------------------
// OTA UPDATE
// -------------------------
void performOTA(const String& firmwarePath) {
  Serial.println("[OTA] Starting OTA...");
  Serial.println("[OTA] URL: " + String(cfg.firmwareBaseUrl) + firmwarePath);

  digitalWrite(LED_PIN, HIGH);
  digitalWrite(BUZZER_PIN, HIGH);

  HTTPClient http;
  http.begin(String(cfg.firmwareBaseUrl) + firmwarePath);

  int httpCode = http.GET();
  if (httpCode == HTTP_CODE_OK) {
    int contentLength = http.getSize();
    Serial.printf("[OTA] Firmware size: %d bytes\n", contentLength);

    if (Update.begin(contentLength)) {
      WiFiClient* stream = http.getStreamPtr();
      size_t written = Update.writeStream(*stream);

      if (written != contentLength) {
        Serial.printf("[OTA] WARNING: Only wrote %d/%d bytes\n", written, contentLength);
      }

      if (Update.end()) {
        if (Update.isFinished()) {
          Serial.println("[OTA] OTA completed -> restarting...");
          updateStatus("updated");
          digitalWrite(LED_PIN, HIGH);
          delay(500);
          ESP.restart();
        } else {
          Serial.println("[OTA] ERROR: OTA not finished");
        }
      } else {
        Serial.printf("[OTA] ERROR: %s\n", Update.errorString());
      }
    } else {
      Serial.println("[OTA] ERROR: Update.begin() failed");
    }
  } else {
    Serial.printf("[OTA] ERROR HTTP code: %d\n", httpCode);
  }

  digitalWrite(LED_PIN, LOW);
  digitalWrite(BUZZER_PIN, LOW);

  http.end();
}

// -------------------------
// VERSION CHECK
// -------------------------
void checkForUpdate() {
  Serial.println("1 Checking for update...");

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("1 WiFi not connected");
    return;
  }

  HTTPClient http;
  http.begin(cfg.getVersionCheckUrl());
  http.setTimeout(10000);

  int httpCode = http.GET();
  if (httpCode != HTTP_CODE_OK) {
    Serial.printf("1 ERROR HTTP code: %d\n", httpCode);
    http.end();
    return;
  }

  String payload = http.getString();
  payload.trim();
  Serial.println("payload: " + payload);

  StaticJsonDocument<1024> doc;
  DeserializationError error = deserializeJson(doc, payload);
  if (error) {
      Serial.print("1 ERROR parsing JSON: ");
      Serial.println(error.c_str());
      http.end();
      return;
  }

  if (doc["success"]) {
    String serverVersion = doc["data"]["version"].as<String>();
    String firmwarePath = doc["data"]["firmware_path"].as<String>();

    Serial.printf("1 Local=%s, Server=%s\n",
                  cfg.currentVersion.c_str(),
                  serverVersion.c_str());

    if (serverVersion.toInt() > cfg.currentVersion.toInt()) {
      Serial.println("1 New version found -> OTA");
      updateStatus("updating");
      performOTA(firmwarePath);
    } else {
      Serial.println("1 Already latest version");
    }
  }

  http.end();
}

// -------------------------
// SETUP
// -------------------------
void setup() {
  Serial.begin(115200);

  pinMode(LED_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);

  digitalWrite(LED_PIN, LOW);
  digitalWrite(BUZZER_PIN, LOW);

  Serial.println("[WiFi] Connecting...");
  WiFi.begin(cfg.ssid, cfg.pass);
  while (WiFi.status() != WL_CONNECTED) {
    delay(200);
    Serial.print(".");
  }
  Serial.println("\n[WiFi] Connected, IP: " + WiFi.localIP().toString());
  Serial.println("Version hien tai: " + cfg.currentVersion);

  updateStatus("running");
}

// -------------------------
// LOOP
// -------------------------
void loop() {
  if (millis() - lastVersionCheck >= versionCheckInterval) {
    lastVersionCheck = millis();
    checkForUpdate();
  }
}