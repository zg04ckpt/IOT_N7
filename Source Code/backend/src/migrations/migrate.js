import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../config/database.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Migration {
    constructor() {
        this.migrationsPath = __dirname;
    }

    async createMigrationsTable() {
        const query = `
            CREATE TABLE IF NOT EXISTS migrations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL UNIQUE,
                executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `;
        await db.query(query);
    }

    async getExecutedMigrations() {
        const [rows] = await db.query('SELECT name FROM migrations ORDER BY id');
        return rows.map(row => row.name);
    }

    async getMigrationFiles() {
        const files = fs.readdirSync(this.migrationsPath);
        return files
            .filter(file => file.endsWith('.migration.js'))
            .sort();
    }

    async recordMigration(name) {
        await db.query('INSERT INTO migrations (name) VALUES (?)', [name]);
    }

    async removeMigration(name) {
        await db.query('DELETE FROM migrations WHERE name = ?', [name]);
    }

    async up() {
        try {
            console.log('Starting migrations...\n');

            await this.createMigrationsTable();

            const executedMigrations = await this.getExecutedMigrations();
            const migrationFiles = await this.getMigrationFiles();

            const pendingMigrations = migrationFiles.filter(
                file => !executedMigrations.includes(file)
            );

            if (pendingMigrations.length === 0) {
                console.log('No pending migrations');
                return;
            }

            console.log(`Found ${pendingMigrations.length} pending migration(s):\n`);

            for (const file of pendingMigrations) {
                console.log(`Migrating...: ${file}`);

                const migrationPath = path.join(this.migrationsPath, file);
                const migration = await import(`file://${migrationPath}`);

                await migration.up();
                await this.recordMigration(file);

                console.log(`Migrated: ${file}\n`);
            }

            console.log('All migrations completed successfully!');
        } catch (error) {
            console.error('Migration failed:', error);
            throw error;
        }
    }

    async down(steps = 1) {
        try {
            console.log(`Rolling back ${steps} migration(s)...\n`);

            await this.createMigrationsTable();

            const executedMigrations = await this.getExecutedMigrations();

            if (executedMigrations.length === 0) {
                console.log('No migrations to rollback');
                return;
            }

            const migrationsToRollback = executedMigrations
                .slice(-steps)
                .reverse();

            console.log(`Found ${migrationsToRollback.length} migration(s) to rollback:\n`);

            for (const file of migrationsToRollback) {
                console.log(`Rolling back: ${file}`);

                const migrationPath = path.join(this.migrationsPath, file);
                const migration = await import(`file://${migrationPath}`);

                await migration.down();
                await this.removeMigration(file);

                console.log(`Rolled back: ${file}\n`);
            }

            console.log('Rollback completed successfully!');
        } catch (error) {
            console.error('Rollback failed:', error);
            throw error;
        }
    }

    async status() {
        try {
            await this.createMigrationsTable();

            const executedMigrations = await this.getExecutedMigrations();
            const migrationFiles = await this.getMigrationFiles();

            console.log('\nMigration Status:\n');
            console.log('═'.repeat(60));

            if (migrationFiles.length === 0) {
                console.log('No migration files found');
                return;
            }

            migrationFiles.forEach(file => {
                const status = executedMigrations.includes(file) ? 'Executed' : 'Pending';
                console.log(`${status} - ${file}`);
            });

            console.log('═'.repeat(60));
            console.log(`\nTotal: ${migrationFiles.length} | Executed: ${executedMigrations.length} | Pending: ${migrationFiles.length - executedMigrations.length}\n`);
        } catch (error) {
            console.error('Status check failed:', error);
            throw error;
        }
    }
}

const runner = new Migration();
const command = process.argv[2];

(async () => {
  try {
    switch (command) {
      case 'migrate':
        await runner.up();
        break;
        
      case 'rollback':
        await runner.down();
        break;
        
      case 'status':
        await runner.status();
        break;
        
      default:
        console.log(`
Migration Commands:
  npm run migrate              - Run all pending migrations
  npm run migrate:rollback     - Rollback last migration
  npm run migrate:status       - Show migration status
  npm run migrate:create       - Create new migration file
`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();

