import db from '../config/database.js';

export async function up() {
  await db.execute(`ALTER TABLE devices ADD COLUMN latest_source_code LONGTEXT NULL AFTER \
    \`key\``);
}

export async function down() {
  await db.execute('ALTER TABLE devices DROP COLUMN latest_source_code');
}
