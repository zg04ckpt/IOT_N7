# 🔧 Debug Network Connection

## Vấn đề: "AxiosError: Network Error"

Lỗi này xảy ra vì mobile app không thể kết nối đến backend server.

## ✅ Giải pháp từng bước:

### 1. Kiểm tra Backend Server

Đảm bảo backend đang chạy:
```bash
cd backend-web
npm start
```

Backend phải hiển thị:
```
Server đang chạy ở http://localhost:4000
```

### 2. Kiểm tra IP của máy chủ

**Windows:**
```bash
ipconfig
```

**macOS/Linux:**
```bash
ifconfig
```

Tìm IP trong mạng local (thường bắt đầu với 192.168.x.x)

### 3. Cấu hình Mobile App

Mở `utils/axios.ts` và cập nhật BASE_URL:

**Cho Android Emulator:**
```typescript
const BASE_URL = "http://10.0.2.2:4000/api";
```

**Cho iOS Simulator:**
```typescript
const BASE_URL = "http://localhost:4000/api";
```

**Cho Device thật:**
```typescript
const BASE_URL = "http://192.168.1.100:4000/api"; // Thay đổi IP thực tế
```

### 4. Test kết nối

**Test từ browser:**
Mở browser và truy cập:
```
http://localhost:4000/api/search/active-vehicle
```

**Test từ mobile app:**
Thêm console.log để debug:
```typescript
console.log("BASE_URL:", BASE_URL);
console.log("Full URL:", `${BASE_URL}/active-vehicles`);
```

### 5. Kiểm tra CORS

Backend phải có cấu hình CORS đúng trong `server.js`:
```javascript
app.use(cors({
  origin: [
    "http://localhost:5173", // Web app
    "http://10.0.2.2:4000", // Android emulator
    "http://localhost:4000", // iOS simulator
    "http://192.168.1.100:4000", // Device thật
  ],
  credentials: true,
}));
```

### 6. Kiểm tra Firewall

**Windows:**
- Mở Windows Defender Firewall
- Cho phép Node.js qua firewall

**macOS:**
- System Preferences > Security & Privacy > Firewall
- Cho phép Node.js

### 7. Kiểm tra Port

Đảm bảo port 4000 không bị sử dụng bởi ứng dụng khác:
```bash
# Windows
netstat -ano | findstr :4000

# macOS/Linux
lsof -i :4000
```

## 🚨 Các lỗi thường gặp:

### "Network Error"
- **Nguyên nhân:** IP không đúng hoặc backend không chạy
- **Giải pháp:** Kiểm tra IP và restart backend

### "CORS Error"
- **Nguyên nhân:** CORS không được cấu hình đúng
- **Giải pháp:** Cập nhật origin trong server.js

### "Connection Refused"
- **Nguyên nhân:** Backend không chạy hoặc port bị chặn
- **Giải pháp:** Start backend và kiểm tra firewall

### "Timeout"
- **Nguyên nhân:** Mạng chậm hoặc server không phản hồi
- **Giải pháp:** Tăng timeout trong axios config

## 📱 Test trên các platform:

### Android Emulator
```typescript
const BASE_URL = "http://10.0.2.2:4000/api";
```

### iOS Simulator
```typescript
const BASE_URL = "http://localhost:4000/api";
```

### Real Device (Android/iOS)
```typescript
const BASE_URL = "http://YOUR_ACTUAL_IP:4000/api";
```

## 🔍 Debug Commands:

```bash
# Kiểm tra backend
curl http://localhost:4000/api/search/active-vehicle

# Kiểm tra từ mobile
adb shell
ping 10.0.2.2

# Kiểm tra port
telnet localhost 4000
```

## ✅ Checklist:

- [ ] Backend server đang chạy
- [ ] IP được cấu hình đúng
- [ ] CORS được cấu hình đúng
- [ ] Firewall cho phép port 4000
- [ ] Mobile app sử dụng đúng BASE_URL
- [ ] Network connection ổn định
