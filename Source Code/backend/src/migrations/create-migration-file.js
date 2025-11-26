// create-migration.js (ĐÃ SỬA HOÀN HẢO)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const migrationName = process.argv[2];

if (!migrationName) {
  console.error('Vui lòng cung cấp tên migration');
  console.log('Cách dùng: npm run migrate:create <tên_migration>');
  console.log('Ví dụ: npm run migrate:create create_users_table');
  process.exit(1);
}

// Tạo timestamp chuẩn (YYYYMMDDHHmmss)
const timestamp = new Date()
  .toISOString()
  .replace(/[-T:]/g, '')
  .slice(0, 14); // 20251118123456

const fileName = `${timestamp}_${migrationName}.migration.js`;

// Tạo trong thư mục migrations (chuẩn nhất)
const migrationsDir = path.join(__dirname);
const filePath = path.join(migrationsDir, fileName);

// Tạo thư mục nếu chưa có
if (!fs.existsSync(migrationsDir)) {
  fs.mkdirSync(migrationsDir, { recursive: true });
}

// Template ĐÚNG 100% – không lỗi string, không lỗi biến
const template = `// ${fileName}
// Migration: ${migrationName.replace(/_/g, ' ')}

import db from '../config/database.js';

const tableName = '';

export const up = async () => {
  const query = \`
    CREATE TABLE IF NOT EXISTS \${tableName} (
      id INT AUTO_INCREMENT PRIMARY KEY,
      -- Thêm các cột ở đây
      
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  \`.trim();

  await db.execute(query);
  console.log(\`Bảng "\${tableName}" đã được tạo\`);
};

export const down = async () => {
  await db.execute(\`DROP TABLE IF EXISTS \${tableName}\`);
  console.log(\`Bảng "\${tableName}" đã bị xóa\`);
};
`;

fs.writeFileSync(filePath, template.trim() + '\n');

console.log('Tạo migration thành công!');
console.log(`File: ${fileName}`);
console.log(`Đường dẫn: ${filePath}`);
console.log('\nTiếp theo:');
console.log('1. Mở file migration vừa tạo và thêm các cột');
console.log('2. Chạy: node migrate.js hoặc npm run migrate');