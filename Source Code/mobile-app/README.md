# Mobile App - Smart Parking System

## Tổng quan

Ứng dụng mobile để tra cứu thông tin xe đỗ trong hệ thống bãi đỗ xe thông minh.

## Tính năng chính

- **Tra cứu xe theo biển số**: Nhập biển số xe để xem thông tin chi tiết
- **Hiển thị hình ảnh**: Xem hình ảnh biển số xe với loading states và error handling
- **Thông tin chi tiết**: 
  - Thông tin cơ bản: Biển số, loại thẻ, thời gian vào, thời gian đã gửi (phút/giây)
  - Số tiền phải trả (đối với vé thường)
  - Thông tin vé tháng (nếu có): Tên chủ xe, ngày bắt đầu/kết thúc, số ngày còn lại
- **Giao diện đẹp**: Card-based design với animations mượt mà
- **Error handling**: Xử lý lỗi và hiển thị thông báo phù hợp

## 🛠 Prerequisites

Ensure you have the following software installed on your development machine:

- **Node.js** (LTS version) and **npm**
- The **Expo Go** app on your physical mobile device (iOS/Android) OR
- **Android Studio** with a configured Android Emulator (AVD) OR **Xcode** (on macOS) with an iOS Simulator.

---

## 🚀 Installation and Startup Guide

Follow these steps to set up and run the Expo project locally.

### 1. Install Dependencies

Navigate to the project directory (`mobile-app`) and install the necessary packages using npm:

```bash
cd mobile-app
npm install
```

### 2. Configure Environment Variables

Create a **.env** file in the root directory. Copy the required variables from **.env.example** and fill in your values. Remember to use the **EXPO_PUBLIC** prefix for any variables you need access to in the client code.

# Example content for .env:

# EXPO_PUBLIC_API_URL=[http://your.iot.backend.com/api](http://your.iot.backend.com/api)

# EXPO_PUBLIC_MQTT_HOST=mqtt.broker.com

### 3. Start the Development Server

Run the following command to start the Expo Metro Bundler:

```bash
npm start
```

# OR

```bash
npx expo start
```

### 4. Run the Application

Once the server is running and the QR code is displayed, use one of the following methods to view the app:

- Scan QR Code: Must have Expo Go app installed.
- Press **a**: Requires Android Studio and a running Emulator.
- Press **i**: Requires macOS and Xcode installation.
- Press **w**: Opens in your default web browser.
