// 20251120052826_profile_plate_field.migration.js
// Migration: profile plate field

import db from '../config/database.js';

const tableName = 'users';

export const up = async () => {
  const query = `
    ALTER TABLE ${tableName}
    ADD COLUMN plate VARCHAR(20) NULL COMMENT 'Biển số xe của user'
  `.trim();

  await db.execute(query);
  console.log(`Đã thêm cột "plate" vào bảng "${tableName}"`);
};

export const down = async () => {
  await db.execute(`ALTER TABLE ${tableName} DROP COLUMN plate`);
  console.log(`Đã xóa cột "plate" khỏi bảng "${tableName}"`);
};
