// 20251119233611_create_sessions_tables.migration.js
// Migration: create sessions tables

import db from '../config/database.js';

const tableName = 'sessions';

export const up = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS ${tableName} (
      id INT AUTO_INCREMENT PRIMARY KEY,

      card_id INT NOT NULL,
      plate VARCHAR(32) NOT NULL,
      check_in_image_url VARCHAR(255) NOT NULL,
      check_out_image_url VARCHAR(255) DEFAULT NULL,
      check_in DATETIME NOT NULL,
      check_out DATETIME NULL,

      user_id INT DEFAULT NULL,

      status VARCHAR(20) NOT NULL DEFAULT 'packing',
      INDEX idx_card_id (card_id),
      INDEX idx_plate (plate),
      INDEX idx_user_id (user_id),

      CONSTRAINT fk_sessions_card FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `.trim();

  await db.execute(query);
  console.log(`Bảng "${tableName}" đã được tạo`);
};

export const down = async () => {
  await db.execute(`DROP TABLE IF EXISTS ${tableName}`);
  console.log(`Bảng "${tableName}" đã bị xóa`);
};
