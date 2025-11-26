// 20251120020304_create_invoices_table.migration.js
// Migration: create invoices table

import db from '../config/database.js';

const tableName = 'invoices';

export const up = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS ${tableName} (
      id INT AUTO_INCREMENT PRIMARY KEY,
      
      amount DECIMAL(10, 2) NOT NULL,
      \`from\` VARCHAR(20) NOT NULL,
      
      user_id INT NOT NULL,
      session_id INT DEFAULT NULL,
      
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      
      INDEX idx_user_id (user_id),
      INDEX idx_session_id (session_id),
      INDEX idx_from (\`from\`),
      INDEX idx_created_at (created_at),
      
      CONSTRAINT fk_invoices_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
      CONSTRAINT fk_invoices_session FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE SET NULL ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `.trim();

  await db.execute(query);
  console.log(`Bảng "${tableName}" đã được tạo`);
};

export const down = async () => {
  await db.execute(`DROP TABLE IF EXISTS ${tableName}`);
  console.log(`Bảng "${tableName}" đã bị xóa`);
};
