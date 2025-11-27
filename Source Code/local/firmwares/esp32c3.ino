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

// ===== CẤU HÌNH WIFI =====
const char* ssid = "[WifiName]";
const char* password = "[WifiPass]";

// ===== CẤU HÌNH MQTT =====
const char* mqttServer = "[Broker LAN IP]";
const int mqttPort = 1883;
const char* mqttTopic = "esp32c3";
const char* clientId = "esp32c3";

// Version checking example
const char* versionCheckUrl = "https://iot.hoangcn.com/api/devices/check-version?key=804e8ee5eba8c5c3d17cd17077677b07adbcd134aab3f3289d4d47b001779b9e&device_id=1";
const char* firmwareBaseUrl = "https://iot.hoangcn.com";
String currentVersion = "1"; // Version hiện tại của thiết bị

WiFiClient espClient;
PubSubClient mqttClient(espClient);
MFRC522 mfrc522(RFID_SDA_PIN, RFID_RST_PIN);

unsigned long lastVersionCheck = 0;
const unsigned long versionCheckInterval = 5000; // 5 giây

bool isConnected = false;

String getCardUID() {
  String uidStr = "";
  for (byte i = 0; i < mfrc522.uid.size; i++) {
    if (mfrc522.uid.uidByte[i] < 0x10) uidStr += "0";
    uidStr += String(mfrc522.uid.uidByte[i], HEX);
  }
  uidStr.toUpperCase();
  return uidStr;
}

void mqttCallback(char* topic, byte* payload, unsigned int length) {
  Serial.print("[MQTT] Nhan tin nhan tu topic: ");
  Serial.println(topic);
  
  String message = "";
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  Serial.println("[MQTT] Noi dung: " + message);

  // Xử lý
  String reply = "";
  if (message == "REFRESH") {
    reply = "READY";
  }

  if (reply != "") {
    mqttClient.publish(topic, reply.c_str());
  }
}

void reconnectMQTT() {
  while (!mqttClient.connected()) {
    Serial.print("Dang ket noi MQTT...");

    if (mqttClient.connect(clientId)) {
      Serial.println("Da ket noi!");
      isConnected = true;
      mqttClient.subscribe(mqttTopic);
      mqttClient.publish(mqttTopic, "READY");
    } else {
      Serial.print("That bai, rc=");
      Serial.print(mqttClient.state());
      Serial.println(" Thu lai sau 5 giay...");
      delay(5000);
    }
  }
}

void performOTA(String firmwarePath) {
  Serial.println("[OTA] Bat dau cap nhat firmware...");
  Serial.println("[OTA] Duong dan: " + String(firmwareBaseUrl) + firmwarePath);
  
  HTTPClient http;
  http.begin(String(firmwareBaseUrl) + firmwarePath);
  
  int httpCode = http.GET();
  
  if (httpCode == HTTP_CODE_OK) {
    int contentLength = http.getSize();
    Serial.printf("[OTA] Kich thuoc firmware: %d bytes\n", contentLength);
    
    bool canBegin = Update.begin(contentLength);
    
    if (canBegin) {
      WiFiClient* stream = http.getStreamPtr();
      size_t written = Update.writeStream(*stream);
      
      if (written == contentLength) {
        Serial.println("[OTA] Da ghi xong firmware");
      } else {
        Serial.printf("[OTA] Chi ghi duoc %d/%d bytes\n", written, contentLength);
      }
      
      if (Update.end()) {
        if (Update.isFinished()) {
          Serial.println("[OTA] Cap nhat thanh cong! Khoi dong lai...");
          digitalWrite(LED_PIN, HIGH);
          delay(1000);
          ESP.restart();
        } else {
          Serial.println("[OTA] Cap nhat chua hoan thanh");
        }
      } else {
        Serial.printf("[OTA] Loi: %s\n", Update.errorString());
      }
    } else {
      Serial.println("[OTA] Khong du bo nho de cap nhat");
    }
  } else {
    Serial.printf("[OTA] Loi tai firmware, HTTP code: %d\n", httpCode);
  }
  
  http.end();
}

void checkForUpdate() {
  if (WiFi.status() != WL_CONNECTED) {
    return;
  }
  
  HTTPClient http;
  http.begin(versionCheckUrl);
  http.setTimeout(10000);
  
  int httpCode = http.GET();
  
  if (httpCode == HTTP_CODE_OK) {
    String payload = http.getString();
    Serial.println("[Version Check] Response: " + payload);
    
    StaticJsonDocument<512> doc;
    DeserializationError error = deserializeJson(doc, payload);
    
    if (!error) {
      bool success = doc["success"];
      
      if (success) {
        String serverVersion = doc["data"]["version"].as<String>();
        String firmwarePath = doc["data"]["firmware_path"].as<String>();
        
        Serial.println("[Version Check] Version hien tai: " + currentVersion);
        Serial.println("[Version Check] Version moi: " + serverVersion);
        
        // So sánh version (đơn giản, có thể cải thiện)
        if (serverVersion.toInt() > currentVersion.toInt()) {
          Serial.println("[Version Check] Co version moi! Bat dau OTA...");
          mqttClient.publish(mqttTopic, "UPDATING_FIRMWARE");
          performOTA(firmwarePath);
        } else {
          Serial.println("[Version Check] Dang su dung version moi nhat");
        }
      }
    } else {
      Serial.println("[Version Check] Loi parse JSON");
    }
  } else {
    Serial.printf("[Version Check] Loi HTTP: %d\n", httpCode);
  }
  
  http.end();
}

void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);

  // Setup RFID
  SPI.begin(4, 5, 6, 10);
  mfrc522.PCD_Init();
  Serial.println("RFID da khoi tao!");

  // Kết nối WiFi
  Serial.println();
  Serial.print("Dang ket noi WiFi...");
  WiFi.begin(ssid, pass);

  while(WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.println("Da ket noi WiFi!");
  Serial.print("Dia chi IP: ");
  Serial.println(WiFi.localIP());
  Serial.print("Gateway: ");
  Serial.println(WiFi.gatewayIP());

  // Setup MQTT
  mqttClient.setServer(mqttServer, mqttPort);
  mqttClient.setCallback(mqttCallback);
  
  Serial.printf("\nDang ket noi MQTT broker: %s:%d\n", mqttServer, mqttPort);
  Serial.println("Version hien tai: " + currentVersion);
}

void loop() {
  // Duy trì kết nối MQTT
  if (!mqttClient.connected()) {
    isConnected = false;
    reconnectMQTT();
  }
  mqttClient.loop();

  // Kiểm tra version mỗi 5 giây
  if (millis() - lastVersionCheck >= versionCheckInterval) {
    lastVersionCheck = millis();
    checkForUpdate();
  }

  // Đọc thẻ RFID
  if (mfrc522.PICC_IsNewCardPresent()) {
    if (mfrc522.PICC_ReadCardSerial()) {
      String cardId = getCardUID();
      Serial.println("Phat hien the moi: " + cardId);
      
      digitalWrite(LED_PIN, HIGH);
      digitalWrite(BUZZER_PIN, HIGH);
      
      // Gửi qua MQTT
      String message = "UID-" + cardId;
      mqttClient.publish(mqttTopic, message.c_str());

      mfrc522.PICC_HaltA();
      delay(500);
      digitalWrite(BUZZER_PIN, LOW);
      delay(500);
      digitalWrite(LED_PIN, LOW);
    }
  }
}