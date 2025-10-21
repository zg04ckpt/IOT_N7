Thực hiện theo các bước sau để thiết lập môi trường và chạy ứng dụng cục bộ.

### 1. Yêu cầu Tiên quyết

Bạn cần cài đặt các phần mềm sau trên máy tính của mình:

- **Node.js** (Phiên bản LTS)
- **MySQL**

### 2. Cài đặt Dependencies

Mở terminal tại thư mục gốc của dự án và chạy lệnh sau để cài đặt tất cả các thư viện cần thiết:

```bash
npm install
```

### 3. Thiết lập Biến Môi trường (.env)

Copy file .env.example và đổi tên thành **.env**, điền giá trị của các biến cần thiết

Lưu ý: Có thể sinh chuỗi SESSION_SECRET bằng lệnh trong terminal:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Migrate DB

```bash
npm run migrate
```

### 5. Chạy dự án với nodemon

```bash
npm run dev
```
