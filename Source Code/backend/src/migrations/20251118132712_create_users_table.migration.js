// 20251118132712_create_users_table.migration.js
// Migration: create users table


import db from '../config/database.js';

const tableName = 'users';

export const up = async () => {
	const query = `
    CREATE TABLE IF NOT EXISTS ${tableName} (
		id INT AUTO_INCREMENT PRIMARY KEY,
		role VARCHAR(255) NOT NULL,
		email VARCHAR(255) NOT NULL UNIQUE,
		phone VARCHAR(255) NOT NULL UNIQUE,
		password VARCHAR(255) NOT NULL,
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