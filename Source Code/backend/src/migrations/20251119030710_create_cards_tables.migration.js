// 20251119030710_create_cards_tables.migration.js
// Migration: create cards tables

import db from '../config/database.js';

const tableName = 'cards';

export const up = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS ${tableName} (
      id INT AUTO_INCREMENT PRIMARY KEY,
      uid VARCHAR(64) NOT NULL UNIQUE,
      type VARCHAR(20) NOT NULL DEFAULT 'NORMAL',

      monthly_user_name VARCHAR(50) DEFAULT NULL,
      monthly_user_phone VARCHAR(15) DEFAULT NULL,
      monthly_user_expiry DATETIME DEFAULT NULL,
      monthly_user_address VARCHAR(100) DEFAULT NULL,

      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `.trim();

  await db.execute(query);
  console.log(`Bảng "${tableName}" đã được tạo`);
};

export const down = async () => {
  await db.execute(`DROP TABLE IF EXISTS ${tableName}`);
  console.log(`Bảng "${tableName}" đã bị xóa`);
};
