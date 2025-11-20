### Chạy lần đầu
- Tạo file .env mới có nội dung giống hiện .env.example
- Điền các biến còn trống
- Tạo 1 schema mới trong MySQL có tên là iot2
- Chạy các lệnh sau
```bash
npm install
npm run migrate
npm run seed
npm run start
```