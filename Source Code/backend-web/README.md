Thực hiện theo các bước sau để thiết lập môi trường và chạy ứng dụng cục bộ.

### 1. Yêu cầu Tiên quyết

Bạn cần cài đặt các phần mềm sau trên máy tính của mình:

- **Node.js** (Phiên bản LTS)
- **MySQL Server**

### 2. Cài đặt Dependencies

Mở terminal tại thư mục gốc của dự án và chạy lệnh sau để cài đặt tất cả các thư viện cần thiết:

```bash
npm install
```

### 3. Thiết lập Biến Môi trường (.env)

Copy file .env.example và đổi tên thành **.env**, điền giá trị của các biến cần thiết

### 4. Migrate DB

```bash
npx sequelize-cli db:migrate
```

### 5. Chạy dự án với nodemon

```bash
npm run dev
```
