#include "esp_camera.h"
#include "esp_http_server.h"
#include <WiFi.h>
#include <PubSubClient.h>
#include <HTTPClient.h>
#include <Update.h>
#include <ArduinoJson.h>

// ===== CẤU HÌNH WIFI =====
const char* ssid = "ZG04";
const char* password = "zg04ckpt";

// ===== CẤU HÌNH MQTT =====
const char* mqttServer = "10.215.192.99";
const int mqttPort = 1883;
const char* mqttTopic = "esp32cam";
const char* clientId = "esp32cam";

// ===== CẤU HÌNH VERSION & OTA =====
const char* versionCheckUrl = "https://iot.hoangcn.com/api/devices/check-version?key=804e8ee5eba8c5c3d17cd17077677b07adbcd134aab3f3289d4d47b001779b9e&device_id=1";
const char* firmwareBaseUrl = "https://iot.hoangcn.com";
String currentVersion = "1"; // Version hiện tại của thiết bị

unsigned long lastVersionCheck = 0;
const unsigned long versionCheckInterval = 5000; // 5 giây

// ===== CẤU HÌNH CAMERA AI-THINKER =====
#define PWDN_GPIO_NUM     32
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM      0
#define SIOD_GPIO_NUM     26
#define SIOC_GPIO_NUM     27
#define Y9_GPIO_NUM       35
#define Y8_GPIO_NUM       34
#define Y7_GPIO_NUM       39
#define Y6_GPIO_NUM       36
#define Y5_GPIO_NUM       21
#define Y4_GPIO_NUM       19
#define Y3_GPIO_NUM       18
#define Y2_GPIO_NUM        5
#define VSYNC_GPIO_NUM    25
#define HREF_GPIO_NUM     23
#define PCLK_GPIO_NUM     22
#define LED_GPIO_NUM       4

// ===== BIẾN TOÀN CỤC =====
httpd_handle_t stream_httpd = NULL;
httpd_handle_t camera_httpd = NULL;
WiFiClient espClient;
PubSubClient mqttClient(espClient);

#define PART_BOUNDARY "123456789000000000000987654321"
static const char* _STREAM_CONTENT_TYPE = "video/x-motion-jpeg;boundary=" PART_BOUNDARY;
static const char* _STREAM_BOUNDARY = "\r\n--" PART_BOUNDARY "\r\n";
static const char* _STREAM_PART = "Content-Type: image/jpeg\r\nContent-Length: %u\r\n\r\n";

// ===== HTML GIAO DIỆN NGƯỜI DÙNG =====
static const char PROGMEM INDEX_HTML[] = R"rawliteral(
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>ESP32-CAM Live Stream</title>
<style>
body{font-family:Arial,sans-serif;margin:0;padding:20px;background:#f0f0f0;text-align:center}
h1{color:#333;margin-bottom:20px}
.container{max-width:800px;margin:0 auto;background:white;padding:20px;border-radius:10px;box-shadow:0 2px 10px rgba(0,0,0,0.1)}
#stream{width:100%;max-width:800px;border-radius:5px;margin:20px 0}
.controls{display:flex;justify-content:center;gap:10px;flex-wrap:wrap;margin-top:20px}
button{padding:10px 20px;font-size:16px;border:none;border-radius:5px;cursor:pointer;background:#4CAF50;color:white;transition:background 0.3s}
button:hover{background:#45a049}
button:active{background:#3d8b40}
.info{margin-top:20px;color:#666;font-size:14px}
</style>
</head>
<body>
<div class="container">
<h1>📷 ESP32-CAM Live Stream</h1>
<img id="stream" src="">
<div class="controls">
<button onclick="changeResolution('QVGA')">QVGA (320x240)</button>
<button onclick="changeResolution('VGA')">VGA (640x480)</button>
<button onclick="changeResolution('SVGA')">SVGA (800x600)</button>
<button onclick="changeResolution('HD')">HD (1280x720)</button>
</div>
<div class="info">
<p>Status: <span id="status">Connecting...</span></p>
<p>Stream URL: <span id="url"></span></p>
</div>
</div>
<script>
window.onload=function(){
const streamImg=document.getElementById('stream');
const statusSpan=document.getElementById('status');
const urlSpan=document.getElementById('url');
const streamUrl=window.location.protocol+'//'+window.location.hostname+':81/stream';
streamImg.src=streamUrl;
urlSpan.textContent=streamUrl;
streamImg.onload=function(){statusSpan.textContent='Connected ✓';statusSpan.style.color='green'};
streamImg.onerror=function(){statusSpan.textContent='Error ✗';statusSpan.style.color='red'};
}
function changeResolution(res){
const resMap={'QVGA':11,'VGA':10,'SVGA':9,'HD':7};
const framesize=resMap[res]||10;
fetch('/control?var=framesize&val='+framesize)
.then(r=>r.text())
.then(()=>alert('Resolution changed to '+res))
.catch(e=>alert('Error: '+e));
}
</script>
</body>
</html>
)rawliteral";

// ===== MQTT CALLBACK =====
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

// ===== RECONNECT MQTT =====
void reconnectMQTT() {
  while (!mqttClient.connected()) {
    Serial.print("Dang ket noi MQTT...");    
    if (mqttClient.connect(clientId)) {
      Serial.println("Da ket noi!");
      mqttClient.subscribe(mqttTopic);
      mqttClient.publish(mqttTopic, "READY");

      // Gửi url stream sau 1s
      delay(1000);
      String message1 = "STREAM_URL-http://" + WiFi.localIP().toString() + ":81/stream";
      mqttClient.publish(mqttTopic, message1.c_str());

      // Gửi url stream sau 0.5s
      delay(0.5);
      String message2 = "CAPTURE_URL-http://" + WiFi.localIP().toString() + "/cap";
      mqttClient.publish(mqttTopic, message2.c_str());

    } else {
      Serial.print("That bai, rc=");
      Serial.print(mqttClient.state());
      Serial.println(" Thu lai sau 5 giay...");
      delay(5000);
    }
  }
}

// ===== PERFORM OTA =====
void performOTA(String firmwarePath) {
  Serial.println("[OTA] Bat dau cap nhat firmware...");
  Serial.println("[OTA] Duong dan: " + String(firmwareBaseUrl) + firmwarePath);
  
  mqttClient.publish(mqttTopic, "OTA_UPDATING");
  
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
          mqttClient.publish(mqttTopic, "OTA_SUCCESS_REBOOTING");
          delay(1000);
          ESP.restart();
        } else {
          Serial.println("[OTA] Cap nhat chua hoan thanh");
          mqttClient.publish(mqttTopic, "OTA_INCOMPLETE");
        }
      } else {
        Serial.printf("[OTA] Loi: %s\n", Update.errorString());
        mqttClient.publish(mqttTopic, "OTA_ERROR");
      }
    } else {
      Serial.println("[OTA] Khong du bo nho de cap nhat");
      mqttClient.publish(mqttTopic, "OTA_NO_MEMORY");
    }
  } else {
    Serial.printf("[OTA] Loi tai firmware, HTTP code: %d\n", httpCode);
    mqttClient.publish(mqttTopic, "OTA_DOWNLOAD_ERROR");
  }
  
  http.end();
}

// ===== CHECK FOR UPDATE =====
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
        
        // So sánh version
        if (serverVersion.toInt() > currentVersion.toInt()) {
          Serial.println("[Version Check] Co version moi! Bat dau OTA...");
          mqttClient.publish(mqttTopic, ("NEW_VERSION_AVAILABLE:" + serverVersion).c_str());
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

// ===== HANDLER TRANG CHỦ =====
static esp_err_t index_handler(httpd_req_t *req) {
  httpd_resp_set_type(req, "text/html");
  return httpd_resp_send(req, INDEX_HTML, strlen(INDEX_HTML));
}

// ===== HANDLER STREAMING =====
static esp_err_t stream_handler(httpd_req_t *req) {
  httpd_resp_set_hdr(req, "Cache-Control", "no-cache");
  httpd_resp_set_hdr(req, "Pragma", "no-cache");
  camera_fb_t * fb = NULL;
  esp_err_t res = ESP_OK;
  size_t _jpg_buf_len = 0;
  uint8_t * _jpg_buf = NULL;
  char * part_buf[64];

  res = httpd_resp_set_type(req, _STREAM_CONTENT_TYPE);
  if(res != ESP_OK) return res;

  while(true) {
    fb = esp_camera_fb_get();
    if (!fb) {
      Serial.println("Camera capture failed");
      res = ESP_FAIL;
      break;
    }

    if(fb->format != PIXFORMAT_JPEG) {
      bool jpeg_converted = frame2jpg(fb, 80, &_jpg_buf, &_jpg_buf_len);
      esp_camera_fb_return(fb);
      fb = NULL;
      if(!jpeg_converted) {
        Serial.println("JPEG compression failed");
        res = ESP_FAIL;
      }
    } else {
      _jpg_buf_len = fb->len;
      _jpg_buf = fb->buf;
    }

    if(res == ESP_OK) {
      size_t hlen = snprintf((char *)part_buf, 64, _STREAM_PART, _jpg_buf_len);
      res = httpd_resp_send_chunk(req, (const char *)part_buf, hlen);
    }
    if(res == ESP_OK) {
      res = httpd_resp_send_chunk(req, (const char *)_jpg_buf, _jpg_buf_len);
    }
    if(res == ESP_OK) {
      res = httpd_resp_send_chunk(req, _STREAM_BOUNDARY, strlen(_STREAM_BOUNDARY));
    }
    
    if(fb) {
      esp_camera_fb_return(fb);
      fb = NULL;
      _jpg_buf = NULL;
    } else if(_jpg_buf) {
      free(_jpg_buf);
      _jpg_buf = NULL;
    }
    
    if(res != ESP_OK) break;
  }
  return res;
}

// ===== HANDLER ĐIỀU KHIỂN =====
static esp_err_t cmd_handler(httpd_req_t *req) {
  char*  buf;
  size_t buf_len;
  char variable[32] = {0,};
  char value[32] = {0,};

  buf_len = httpd_req_get_url_query_len(req) + 1;
  if (buf_len > 1) {
    buf = (char*)malloc(buf_len);
    if(!buf) {
      httpd_resp_send_500(req);
      return ESP_FAIL;
    }
    if (httpd_req_get_url_query_str(req, buf, buf_len) == ESP_OK) {
      if (httpd_query_key_value(buf, "var", variable, sizeof(variable)) == ESP_OK &&
          httpd_query_key_value(buf, "val", value, sizeof(value)) == ESP_OK) {
      } else {
        free(buf);
        httpd_resp_send_404(req);
        return ESP_FAIL;
      }
    } else {
      free(buf);
      httpd_resp_send_404(req);
      return ESP_FAIL;
    }
    free(buf);
  } else {
    httpd_resp_send_404(req);
    return ESP_FAIL;
  }

  int val = atoi(value);
  sensor_t * s = esp_camera_sensor_get();
  int res = 0;

  if(!strcmp(variable, "framesize")) {
    if(s->pixformat == PIXFORMAT_JPEG) res = s->set_framesize(s, (framesize_t)val);
  }
  else if(!strcmp(variable, "quality")) res = s->set_quality(s, val);
  else if(!strcmp(variable, "contrast")) res = s->set_contrast(s, val);
  else if(!strcmp(variable, "brightness")) res = s->set_brightness(s, val);
  else if(!strcmp(variable, "saturation")) res = s->set_saturation(s, val);
  else { res = -1; }

  if(res) {
    return httpd_resp_send_500(req);
  }

  httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
  return httpd_resp_send(req, NULL, 0);
}

// ===== HANDLER CHỤP ẢNH =====
static esp_err_t capture_handler(httpd_req_t *req) {
    camera_fb_t * fb = esp_camera_fb_get();
    if (!fb) {
        return httpd_resp_send_500(req);
    }

    httpd_resp_set_type(req, "image/jpeg");
    httpd_resp_set_hdr(req, "Content-Disposition", "inline; filename=capture.jpg");
    httpd_resp_send(req, (const char*)fb->buf, fb->len);

    esp_camera_fb_return(fb);
    return ESP_OK;
}

// ===== KHỞI TẠO WEB SERVER =====
void startCameraServer() {
  httpd_config_t config = HTTPD_DEFAULT_CONFIG();
  config.server_port = 80;

  httpd_uri_t index_uri = {
    .uri       = "/",
    .method    = HTTP_GET,
    .handler   = index_handler,
    .user_ctx  = NULL
  };

  httpd_uri_t cmd_uri = {
    .uri       = "/control",
    .method    = HTTP_GET,
    .handler   = cmd_handler,
    .user_ctx  = NULL
  };

  httpd_uri_t stream_uri = {
    .uri       = "/stream",
    .method    = HTTP_GET,
    .handler   = stream_handler,
    .user_ctx  = NULL
  };

  httpd_uri_t capture_uri = {
    .uri       = "/cap",
    .method    = HTTP_GET,
    .handler   = capture_handler,
    .user_ctx  = NULL
  };

  Serial.printf("Starting web server on port: '%d'\n", config.server_port);
  if (httpd_start(&camera_httpd, &config) == ESP_OK) {
    httpd_register_uri_handler(camera_httpd, &index_uri);
    httpd_register_uri_handler(camera_httpd, &cmd_uri);
    httpd_register_uri_handler(camera_httpd, &capture_uri);
  }

  config.server_port += 1;
  config.ctrl_port += 1;
  Serial.printf("Starting stream server on port: '%d'\n", config.server_port);
  if (httpd_start(&stream_httpd, &config) == ESP_OK) {
    httpd_register_uri_handler(stream_httpd, &stream_uri);
  }
}

// ===== SETUP =====
void setup() {
  Serial.begin(115200);
  Serial.println("\n\n=== ESP32-CAM Live Stream with MQTT & OTA ===");

  // Cấu hình camera
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sccb_sda = SIOD_GPIO_NUM;
  config.pin_sccb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;
  config.frame_size = FRAMESIZE_VGA;
  config.jpeg_quality = 12;
  config.fb_count = 2;
  config.grab_mode = CAMERA_GRAB_LATEST;
  config.fb_location = CAMERA_FB_IN_PSRAM;

  // Khởi tạo camera
  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Camera init failed with error 0x%x\n", err);
    return;
  }

  sensor_t * s = esp_camera_sensor_get();
  s->set_framesize(s, FRAMESIZE_VGA);

  // Kết nối WiFi
  WiFi.begin(ssid, password);
  WiFi.setSleep(false);

  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected!");

  // Setup MQTT
  mqttClient.setServer(mqttServer, mqttPort);
  mqttClient.setCallback(mqttCallback);
  Serial.printf("Dang ket noi MQTT broker: %s:%d\n", mqttServer, mqttPort);
  Serial.println("Version hien tai: " + currentVersion);

  // Khởi động web server
  startCameraServer();

  Serial.print("\n📷 Camera Ready! Open browser:\n");
  Serial.print("   http://");
  Serial.println(WiFi.localIP());
  Serial.print("   Stream: http://");
  Serial.print(WiFi.localIP());
  Serial.println(":81/stream\n");
}

// ===== LOOP =====
void loop() {
  // Duy trì kết nối MQTT
  if (!mqttClient.connected()) {
    reconnectMQTT();
  }
  mqttClient.loop();

  // Kiểm tra version mỗi 5 giây
  if (millis() - lastVersionCheck >= versionCheckInterval) {
    lastVersionCheck = millis();
    checkForUpdate();
  }

  delay(100);
}