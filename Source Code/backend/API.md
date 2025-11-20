# API Documentation

## Tổng quan
Hệ thống API quản lý bãi đỗ xe thông minh với xác thực JWT, hỗ trợ quản lý người dùng, thẻ xe, phiên gửi xe, hóa đơn, thiết bị IoT và cập nhật firmware OTA. API phân quyền theo 3 vai trò: USER (người dùng), GUARD (bảo vệ), ADMIN (quản trị viên).

---

## User APIs
**Dành cho:** Tất cả người dùng (đăng ký/đăng nhập), ADMIN (quản lý user)  
**Mục đích:** Xác thực, quản lý tài khoản người dùng trong hệ thống

- `POST /api/users/register` - Đăng ký tài khoản USER mới với email và password, phone và plate (tùy chọn)
- `POST /api/users/login` - Đăng nhập và nhận JWT token trong httpOnly cookie
- `POST /api/users/logout` - Đăng xuất và xóa token cookie
- `POST /api/users/profile` - [Auth] Lấy thông tin profile (user info, thẻ tháng theo phone, phiên đỗ xe theo plate)
- `GET /api/users` - [ADMIN] Lấy danh sách tất cả người dùng với phân trang
- `POST /api/users` - [ADMIN] Tạo tài khoản USER/GUARD mới
- `GET /api/users/:id` - [ADMIN] Lấy thông tin chi tiết 1 người dùng
- `DELETE /api/users/:id` - [ADMIN] Xóa người dùng khỏi hệ thống
- `GET /api/health` - Kiểm tra trạng thái hoạt động của API server

---

## Card APIs
**Dành cho:** GUARD (tạo thẻ), ADMIN (quản lý thẻ), USER (xem thẻ của mình)  
**Mục đích:** Quản lý thẻ xe (thẻ thường, thẻ tháng) với UID RFID và thông tin chủ sở hữu

- `GET /api/cards` - [Auth] Lấy danh sách thẻ xe với phân trang
- `GET /api/cards/info?uid={uid}` - [Auth] Lấy thông tin thẻ theo UID RFID
- `GET /api/cards/:id` - [Auth] Lấy thông tin chi tiết thẻ theo ID
- `POST /api/cards` - [Auth] Tạo thẻ xe mới (NORMAL/MONTHLY) với thông tin chủ xe
- `PUT /api/cards/:id/register-monthly` - [Auth] Đăng ký thẻ tháng, tạo invoice và cập nhật expiry_date
- `PUT /api/cards/:id/unregister-monthly` - [Auth] Hủy đăng ký thẻ tháng, chuyển về NORMAL
- `DELETE /api/cards/:id` - [Auth] Xóa thẻ xe khỏi hệ thống

---

## Session APIs
**Dành cho:** GUARD (check-in/out), ADMIN (xem tất cả), USER (xem phiên của mình)  
**Mục đích:** Quản lý phiên gửi xe với ảnh biển số, tính toán thời gian và tự động tạo hóa đơn khi checkout

- `POST /api/sessions/check` - [Auth] Check-in hoặc check-out (upload ảnh biển số), tự động tạo invoice khi checkout
- `GET /api/sessions` - [Auth] Lấy danh sách phiên gửi xe với phân trang

---

## Invoice APIs
**Dành cho:** ADMIN (quản lý), GUARD (xem), USER (xem hóa đơn của mình)  
**Mục đích:** Quản lý hóa đơn phí gửi xe (theo giờ 5000đ/h) và phí thẻ tháng (100000đ/tháng), hỗ trợ thống kê doanh thu

- `GET /api/invoices` - [ADMIN/GUARD] Lấy danh sách hóa đơn với phân trang
- `GET /api/invoices/stats?from={date}&to={date}` - [ADMIN/GUARD] Thống kê doanh thu theo khoảng thời gian
- `GET /api/invoices/:id` - [ADMIN/GUARD] Lấy chi tiết hóa đơn theo ID

---

## Device APIs
**Dành cho:** ADMIN (quản lý thiết bị, build firmware), Thiết bị IoT (check version, update status)  
**Mục đích:** Quản lý thiết bị ESP32/ESP8266, biên dịch firmware từ source code Arduino, hỗ trợ OTA update với versioning

- `GET /api/devices/check-version?device_id={id}&key={key}` - [Public] Thiết bị kiểm tra version firmware mới nhất
- `POST /api/devices/update-status` - [Public] Thiết bị cập nhật trạng thái (RUNNING/UPDATING/OFFLINE)
- `GET /api/devices` - [ADMIN] Lấy danh sách thiết bị với phân trang
- `GET /api/devices/:id` - [ADMIN] Lấy thông tin chi tiết thiết bị
- `POST /api/devices` - [ADMIN] Tạo thiết bị mới, biên dịch firmware từ source code Arduino
- `POST /api/devices/:id/versions` - [ADMIN] Build và push firmware version mới cho thiết bị
- `DELETE /api/devices/:id` - [ADMIN] Xóa thiết bị và toàn bộ firmware versions

---

## Enum APIs
**Dành cho:** Public (tất cả)  
**Mục đích:** Cung cấp danh sách các giá trị enum cố định (roles, card types, board types, device statuses, pricing config) cho frontend/thiết bị

- `GET /api/enums` - Lấy tất cả enums trong 1 response
- `GET /api/enums/roles` - Lấy danh sách vai trò (USER/GUARD/ADMIN)
- `GET /api/enums/card-types` - Lấy loại thẻ (NORMAL/MONTHLY)
- `GET /api/enums/session-statuses` - Lấy trạng thái phiên (PARKING/END)
- `GET /api/enums/invoice-sources` - Lấy nguồn hóa đơn (SESSION/MONTHLY_CARD)
- `GET /api/enums/pricing-config` - Lấy cấu hình giá (HOURLY_RATE: 5000, MONTHLY_CARD_FEE: 100000)
- `GET /api/enums/board-types` - Lấy loại board (ESP32/ESP32_C3/ESP32_S2/ESP32_S3/ESP8266)
- `GET /api/enums/device-statuses` - Lấy trạng thái thiết bị (RUNNING/UPDATING/OFFLINE)

---

## Static Files
- `/uploads/{filename}` - Ảnh biển số từ check-in/check-out sessions
- `/firmware_versions/{device_name}/{version}.bin` - Firmware binaries cho OTA updates

---

## Lưu ý
- **Authentication:** JWT token trong httpOnly cookie, header `Authorization: Bearer {token}` không được hỗ trợ
- **Phân quyền:** ADMIN > GUARD > USER. Các endpoint có `[ADMIN]` chỉ ADMIN mới truy cập được
- **Response format:** Tất cả response có dạng `{ success: boolean, message: string, data: any }`
- **Pagination:** Query params `?page=1&size=10` cho các endpoint danh sách
- **Date format:** ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ) với timezone UTC+7
