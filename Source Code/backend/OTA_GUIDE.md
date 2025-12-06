# Hướng Dẫn OTA (Over-The-Air Update) cho ESP32-C3

## Tổng Quan
Tài liệu này mô tả quy trình và yêu cầu để thực hiện OTA update thành công cho ESP32-C3 thông qua backend Node.js + Arduino CLI.

---

## 1. Cấu Hình Backend

### 1.1. Board Configuration (src/utils/device.util.js)

Đối với **ESP32-C3**, FQBN phải bao gồm đầy đủ các options:

```javascript
if (board.includes('esp32c3')) {
  board = 'esp32:esp32:esp32c3:CDCOnBoot=cdc,PartitionScheme=min_spiffs,CPUFreq=160,FlashMode=dio,FlashFreq=80,FlashSize=4M,UploadSpeed=921600,DebugLevel=none,EraseFlash=none';
}
```

**Giải thích các options:**
- `CDCOnBoot=cdc`: Bật USB CDC để Serial hoạt động qua USB
- `PartitionScheme=min_spiffs`: Partition scheme tối ưu cho OTA
  - App0: 1.9MB (firmware hiện tại)
  - App1: 1.9MB (firmware mới khi OTA)
  - SPIFFS: 190KB
- `FlashMode=dio`: Dual I/O mode (an toàn, tương thích cao)
- `FlashFreq=80`: Flash frequency 80MHz
- `FlashSize=4M`: Kích thước flash 4MB
- `CPUFreq=160`: CPU chạy 160MHz

### 1.2. Partition Schemes Khả Dụng

| Partition Scheme | App Size | OTA Support | SPIFFS/FATFS | Ghi Chú |
|------------------|----------|-------------|--------------|---------|
| `min_spiffs` | 1.9MB x2 | ✅ Yes | 190KB | **Khuyên dùng cho OTA** |
| `no_fs` | 2MB x2 | ✅ Yes | 0KB | Không có filesystem |
| `default` | 1.2MB x2 | ✅ Yes | 1.5MB | Dung lượng app nhỏ |
| `huge_app` | 3MB | ❌ No OTA | 1MB | App lớn, không OTA |
| `no_ota` | 2MB | ❌ No OTA | 2MB | Không hỗ trợ OTA |

---

## 2. Yêu Cầu Source Code Firmware

### 2.1. Thư Viện Bắt Buộc

```cpp
#include <WiFi.h>        // Kết nối WiFi
#include <HTTPClient.h>  // Tải firmware từ server
#include <Update.h>      // ESP32 OTA update library
```

### 2.2. Biến Placeholder

Backend sẽ tự động thay thế các placeholder:

```cpp
const char* deviceKey = "[KEY]";       // → Thay bằng device key thực
const char* deviceId = "[ID]";         // → Thay bằng device ID
String currentVersion = "[VERSION]";   // → Thay bằng version hiện tại
```

**URL mẫu:**
```cpp
const char* versionCheckUrl = "http://SERVER:PORT/api/devices/check-version?key=[KEY]&device_id=[ID]";
const char* firmwareBaseUrl = "http://SERVER:PORT";
```

### 2.3. Hàm Check Version (Bắt Buộc)

```cpp
void checkVersion() {
  if (WiFi.status() != WL_CONNECTED) return;
  
  HTTPClient http;
  http.begin(versionCheckUrl);
  int httpCode = http.GET();
  
  if (httpCode == HTTP_CODE_OK) {
    String response = http.getString();
    
    // Parse JSON để lấy version và firmware_path
    // So sánh với currentVersion
    // Nếu có version mới → gọi performOTA()
  }
  
  http.end();
}
```

### 2.4. Hàm OTA Update (Bắt Buộc)

```cpp
void performOTA(String path) {
  Serial.println("[OTA] Starting update...");
  
  HTTPClient http;
  http.begin(String(firmwareBaseUrl) + path);
  int httpCode = http.GET();
  
  if (httpCode != HTTP_CODE_OK) {
    Serial.printf("[OTA] HTTP Error: %d\n", httpCode);
    http.end();
    return;
  }
  
  int contentLength = http.getSize();
  Serial.printf("[OTA] Firmware size: %d bytes\n", contentLength);
  
  // ⚠️ QUAN TRỌNG: Phải có U_FLASH parameter
  if (!Update.begin(contentLength, U_FLASH)) {
    Serial.println("[OTA] Not enough space!");
    http.end();
    return;
  }
  
  // Ghi firmware
  WiFiClient* stream = http.getStreamPtr();
  size_t written = Update.writeStream(*stream);
  
  Serial.printf("[OTA] Written: %d/%d bytes\n", written, contentLength);
  
  if (written != contentLength) {
    Serial.println("[OTA] Write failed!");
    Update.abort();
    http.end();
    return;
  }
  
  // ⚠️ QUAN TRỌNG: true = set boot partition to new firmware
  if (!Update.end(true)) {
    Serial.printf("[OTA] Error: %s\n", Update.errorString());
    http.end();
    return;
  }
  
  // Kiểm tra hoàn thành
  if (!Update.isFinished()) {
    Serial.println("[OTA] Update not finished!");
    http.end();
    return;
  }
  
  Serial.println("[OTA] SUCCESS! Rebooting...");
  http.end();
  delay(2000);
  ESP.restart();
}
```

### 2.5. Loop Function

```cpp
unsigned long lastCheck = 0;
const unsigned long checkInterval = 10000; // 10 giây

void loop() {
  // Check version định kỳ
  if (millis() - lastCheck > checkInterval) {
    lastCheck = millis();
    checkVersion();
  }
  
  // Logic khác của bạn...
}
```

---

## 3. Quy Trình OTA

### 3.1. Tạo Device Mới

```bash
POST /api/devices
{
  "name": "MY_DEVICE",
  "board": "esp32:esp32:esp32c3",
  "source_code": "... source code với OTA ...",
  "description": "Device description"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "key": "abc123...",
    "latest_version": "1",
    "firmware_folder_path": "/firmware_versions/MY_DEVICE"
  }
}
```

### 3.2. Flash Firmware Lần Đầu

**Option 1: USB Serial (Khuyên dùng)**
```bash
arduino-cli compile --fqbn "esp32:esp32:esp32c3:..." sketch.ino --upload --port COM3
```

**Option 2: esptool**
```bash
esptool.exe --chip esp32c3 --port COM3 --baud 921600 \
  write_flash 0x10000 firmware.bin
```

### 3.3. Upload Version Mới

```bash
POST /api/devices/123/versions
{
  "source_code": "... source code version 2 ..."
}
```

Backend sẽ:
1. Tăng version lên (1 → 2)
2. Thay placeholder `[VERSION]` = "2"
3. Build firmware với Arduino CLI
4. Lưu vào `firmware_versions/MY_DEVICE/2.bin`

### 3.4. Device Tự Động Update

1. Device check version mỗi 10 giây
2. Phát hiện version mới từ API
3. Download firmware từ server
4. Ghi vào partition app1 với `U_FLASH`
5. Set boot partition → reboot
6. ESP32 boot từ firmware mới

---

## 4. Lỗi Thường Gặp

### 4.1. Boot Loop (rst:0xc RTC_SW_CPU_RST)

**Nguyên nhân:**
- Thiếu `U_FLASH` trong `Update.begin()`
- Partition scheme không hỗ trợ OTA

**Giải pháp:**
```cpp
// ❌ SAI
Update.begin(contentLength);

// ✅ ĐÚNG
Update.begin(contentLength, U_FLASH);
```

### 4.2. Không Có Serial Output

**Nguyên nhân:**
- ESP32-C3 cần `CDCOnBoot=cdc`

**Giải pháp:**
- Thêm vào FQBN: `CDCOnBoot=cdc`
- Backend đã tự động cấu hình

### 4.3. Firmware Quá Lớn

**Nguyên nhân:**
- Partition scheme app size < firmware size
- Dùng partition scheme không phù hợp

**Giải pháp:**
- Dùng `min_spiffs` (1.9MB app)
- Nếu cần lớn hơn: `no_fs` (2MB) hoặc `huge_app` (3MB, không OTA)

### 4.4. OTA Failed - Not Enough Space

**Nguyên nhân:**
- Firmware > 1.9MB với `min_spiffs`

**Giải pháp:**
1. Tối ưu code, giảm kích thước
2. Xóa libraries không dùng
3. Đổi partition scheme:
   ```javascript
   PartitionScheme=no_fs  // 2MB app x2
   ```

---

## 5. Kiểm Tra & Debug

### 5.1. Check Binary Size

```powershell
Get-Item firmware_versions/MY_DEVICE/1.bin | Select-Object Length
```

**Giới hạn:**
- `min_spiffs`: ≤ 1,990,656 bytes (~1.9MB)
- `no_fs`: ≤ 2,097,152 bytes (2MB)

### 5.2. Monitor Serial Output

```bash
arduino-cli monitor --port COM3 --config baudrate=115200
```

**Output mẫu khi OTA thành công:**
```
[Check] Current: 1, New: 2
[Check] Update available! Path: /firmware_versions/MY_DEVICE/2.bin
[OTA] Starting update...
[OTA] Firmware size: 1094144 bytes
[OTA] Written: 1094144/1094144 bytes
[OTA] SUCCESS! Rebooting...

=== ESP32-C3 Version 2 ===
```

### 5.3. Test OTA Locally

```bash
# 1. Tạo device
POST /api/devices {...}

# 2. Flash firmware V1 qua USB

# 3. Upload version 2
POST /api/devices/{id}/versions {...}

# 4. Quan sát Serial Monitor
# Device sẽ tự động update trong 10 giây
```

---

## 6. Checklist Source Code

Trước khi tạo device, đảm bảo source code có:

- [ ] `#include <WiFi.h>`
- [ ] `#include <HTTPClient.h>`
- [ ] `#include <Update.h>`
- [ ] Biến `currentVersion = "[VERSION]"`
- [ ] Biến `deviceId = "[ID]"`
- [ ] Biến `deviceKey = "[KEY]"`
- [ ] URL `versionCheckUrl` với `?key=[KEY]&device_id=[ID]`
- [ ] Hàm `checkVersion()` gọi API check version
- [ ] Hàm `performOTA(String path)` với:
  - [ ] `Update.begin(contentLength, U_FLASH)`
  - [ ] `Update.writeStream(*stream)`
  - [ ] `Update.end(true)` ← **true** để set boot partition
  - [ ] `Update.isFinished()` check
  - [ ] `ESP.restart()` sau khi thành công
- [ ] Loop gọi `checkVersion()` định kỳ (5-30 giây)

---

## 7. Code Template Mẫu

File: `firmware_template.ino`

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <Update.h>

// WiFi
const char* ssid = "YOUR_WIFI";
const char* pass = "YOUR_PASSWORD";

// OTA Configuration
const char* deviceKey = "[KEY]";
const char* deviceId = "[ID]";
const char* versionCheckUrl = "http://YOUR_SERVER/api/devices/check-version?key=[KEY]&device_id=[ID]";
const char* firmwareBaseUrl = "http://YOUR_SERVER";
String currentVersion = "[VERSION]";

unsigned long lastCheck = 0;
const unsigned long checkInterval = 10000;

void setup() {
  Serial.begin(115200);
  delay(2000);
  
  Serial.println("\n=== Device Starting ===");
  Serial.println("Device ID: " + String(deviceId));
  Serial.println("Version: " + currentVersion);
  
  WiFi.begin(ssid, pass);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("\nWiFi Connected!");
  Serial.println("IP: " + WiFi.localIP().toString());
}

void performOTA(String path) {
  Serial.println("[OTA] Starting...");
  
  HTTPClient http;
  http.begin(String(firmwareBaseUrl) + path);
  int httpCode = http.GET();
  
  if (httpCode != HTTP_CODE_OK) {
    Serial.printf("[OTA] HTTP Error: %d\n", httpCode);
    http.end();
    return;
  }
  
  int contentLength = http.getSize();
  Serial.printf("[OTA] Size: %d bytes\n", contentLength);
  
  if (!Update.begin(contentLength, U_FLASH)) {
    Serial.println("[OTA] Not enough space!");
    http.end();
    return;
  }
  
  WiFiClient* stream = http.getStreamPtr();
  size_t written = Update.writeStream(*stream);
  Serial.printf("[OTA] Written: %d/%d\n", written, contentLength);
  
  if (written != contentLength) {
    Serial.println("[OTA] Write failed!");
    Update.abort();
    http.end();
    return;
  }
  
  if (!Update.end(true)) {
    Serial.printf("[OTA] Error: %s\n", Update.errorString());
    http.end();
    return;
  }
  
  if (!Update.isFinished()) {
    Serial.println("[OTA] Not finished!");
    http.end();
    return;
  }
  
  Serial.println("[OTA] SUCCESS! Rebooting...");
  http.end();
  delay(2000);
  ESP.restart();
}

void checkVersion() {
  if (WiFi.status() != WL_CONNECTED) return;
  
  HTTPClient http;
  http.begin(versionCheckUrl);
  int httpCode = http.GET();
  
  if (httpCode == HTTP_CODE_OK) {
    String response = http.getString();
    Serial.println("[Check] " + response);
    
    // Parse JSON đơn giản
    int versionPos = response.indexOf("\"version\":\"");
    if (versionPos > 0) {
      int start = versionPos + 11;
      int end = response.indexOf("\"", start);
      String newVer = response.substring(start, end);
      
      Serial.println("[Check] Current: " + currentVersion + ", New: " + newVer);
      
      if (newVer != currentVersion) {
        int pathPos = response.indexOf("\"firmware_path\":\"");
        if (pathPos > 0) {
          int pStart = pathPos + 17;
          int pEnd = response.indexOf("\"", pStart);
          String path = response.substring(pStart, pEnd);
          
          Serial.println("[Check] Update available!");
          performOTA(path);
        }
      } else {
        Serial.println("[Check] Already latest");
      }
    }
  }
  
  http.end();
}

void loop() {
  if (millis() - lastCheck > checkInterval) {
    lastCheck = millis();
    checkVersion();
  }
  
  // Your application logic here
  
  delay(1000);
}
```

---

## 8. Tóm Tắt

### Backend Cấu Hình
- FQBN đầy đủ với `CDCOnBoot=cdc` và `PartitionScheme=min_spiffs`
- Build command tự động với Arduino CLI

### Firmware Requirements
- 3 thư viện: WiFi, HTTPClient, Update
- 3 placeholder: [KEY], [ID], [VERSION]
- 2 hàm: checkVersion(), performOTA()
- **Quan trọng:** `Update.begin(size, U_FLASH)` và `Update.end(true)`

### Quy Trình
1. POST create device → nhận ID, key, version 1
2. Flash V1 qua USB
3. POST upload version 2
4. Device tự check → download → OTA → reboot → V2 running

**Đã test thành công:** ESP32-C3 OTA từ V1 → V2 qua backend Node.js + Arduino CLI ✅
