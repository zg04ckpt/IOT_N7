// 20251120034006_create_devices_table.migration.js
// Migration: create devices table

import db from '../config/database.js';

const tableName = 'devices';

export const up = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS ${tableName} (
      id INT AUTO_INCREMENT PRIMARY KEY,
      
      name VARCHAR(100) NOT NULL UNIQUE,
      board VARCHAR(50) NOT NULL,
      
      latest_version VARCHAR(50) DEFAULT NULL,
      curr_version VARCHAR(50) DEFAULT NULL,
      total_versions INT DEFAULT 0,
      
      firmware_folder_path VARCHAR(255) NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'offline',
      \`key\` VARCHAR(64) NOT NULL UNIQUE,
      
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      
      INDEX idx_name (name),
      INDEX idx_key (\`key\`),
      INDEX idx_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `.trim();

  await db.execute(query);
  console.log(`Bảng "${tableName}" đã được tạo`);
};

export const down = async () => {
  await db.execute(`DROP TABLE IF EXISTS ${tableName}`);
  console.log(`Bảng "${tableName}" đã bị xóa`);
};
