# API Documentation

## User APIs

### 1. Đăng ký tài khoản
- **Endpoint:** `/users/register`
- **Tên mô tả:** Đăng ký người dùng mới
- **Kiểu:** POST
- **Loại:** JSON
- **Param:**
  - email (string)
  - password (string)
- **Ví dụ body:**
```json
{
  "email": "user@example.com",
  "password": "123456"
}
```
- **Ví dụ response:**
```json
{
  "success": true,
  "message": "Tạo thành công",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "role": "USER"
  }
}
```

---

### 2. Đăng nhập
- **Endpoint:** `/users/login`
- **Tên mô tả:** Đăng nhập người dùng
- **Kiểu:** POST
- **Loại:** JSON
- **Param:**
  - email (string)
  - password (string)
- **Ví dụ body:**
```json
{
  "email": "user@example.com",
  "password": "123456"
}
```
- **Ví dụ response:**
```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "role": "USER"
  }
}
```

---

### 3. Đăng xuất
- **Endpoint:** `/users/logout`
- **Tên mô tả:** Đăng xuất người dùng
- **Kiểu:** POST
- **Loại:** Không cần body
- **Param:** Không có
- **Ví dụ response:**
```json
{
  "success": true,
  "message": "Đăng xuất thành công",
  "data": null
}
```

---

### 4. Lấy danh sách người dùng
- **Endpoint:** `/users/`
- **Tên mô tả:** Lấy tất cả người dùng
- **Kiểu:** GET
- **Loại:** Không cần body
- **Param:** Không có
- **Ví dụ response:**
```json
{
  "success": true,
  "message": "",
  "data": [
    {
      "id": 1,
      "email": "user@example.com",
      "role": "USER"
    },
    {
      "id": 2,
      "email": "admin@example.com",
      "role": "ADMIN"
    }
  ]
}
```

---

### 5. Tạo người dùng (Admin)
- **Endpoint:** `/users/`
- **Tên mô tả:** Tạo người dùng mới (chỉ quản lý)
- **Kiểu:** POST
- **Loại:** JSON
- **Param:**
  - email (string)
  - password (string)
  - role (string: USER/GUARD)
- **Ví dụ body:**
```json
{
  "email": "guard@example.com",
  "password": "123456",
  "role": "GUARD"
}
```
- **Ví dụ response:**
```json
{
  "success": true,
  "message": "Tạo thành công",
  "data": {
    "id": 3,
    "email": "guard@example.com",
    "role": "GUARD"
  }
}
```

---

### 6. Lấy thông tin người dùng theo ID
- **Endpoint:** `/users/:id`
- **Tên mô tả:** Lấy thông tin người dùng
- **Kiểu:** GET
- **Loại:** Không cần body
- **Param:**
  - id (path param)
- **Ví dụ response:**
```json
{
  "success": true,
  "message": "",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "role": "USER"
  }
}
```

---

### 7. Xóa người dùng
- **Endpoint:** `/users/:id`
- **Tên mô tả:** Xóa người dùng
- **Kiểu:** DELETE
- **Loại:** Không cần body
- **Param:**
  - id (path param)
- **Ví dụ response:**
```json
{
  "success": true,
  "message": "Xóa thành công",
  "data": null
}
```

---

### 8. Kiểm tra sức khỏe API
- **Endpoint:** `/health`
- **Tên mô tả:** Kiểm tra trạng thái API
- **Kiểu:** GET
- **Loại:** Không cần body
- **Param:** Không có
- **Ví dụ response:**
```json
{
  "status": "API Running ...",
  "timestamp": "2025-11-18T13:27:12.000Z"
}
```

---

## Lưu ý
- Các endpoint `/users` (GET, POST, DELETE, GET/:id) yêu cầu quyền quản lý (ADMIN).
- Đăng ký, đăng nhập, đăng xuất không yêu cầu xác thực.
- Tất cả dữ liệu gửi lên đều ở dạng JSON.
