import db from '../config/database.js';
import User from '../models/user.model.js';

class UserRepo {
    async findAll(page = 1, size = 10) {
        page = parseInt(page);
        size = parseInt(size);
        const offset = (page - 1) * size;
        const [rows] = await db.execute(
            `SELECT * FROM users ORDER BY created_at DESC LIMIT ${size} OFFSET ${offset}`,
        );
        return rows.map(row => new User(row));
    }

    async findById(id) {
        const [rows] = await db.execute(
            'SELECT * FROM users WHERE id = ?',
            [id]
        );
        return rows[0] ? new User(rows[0]) : null;
    }

    async findByEmail(email) {
        const [rows] = await db.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        return rows[0] ? new User(rows[0]) : null;
    }

    async create(userData) {
        const { email, role, password, phone } = userData;
        const [result] = await db.execute(
            'INSERT INTO users (email, role, password, phone) VALUES (?, ?, ?, ?)',
            [email, role, password, phone]
        );
        return await this.findById(result.insertId);
    }

    async delete(id) {
        const [result] = await db.execute('DELETE FROM users WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

    async emailExists(email) {
        const [rows] = await db.execute(
            'SELECT COUNT(*) as count FROM users WHERE email = ?',
            [email]
        );
        return rows[0].count > 0;
    }

    async phoneExists(phone) {
        const [rows] = await db.execute(
            'SELECT COUNT(*) as count FROM users WHERE phone = ?',
            [phone]
        );
        return rows[0].count > 0;
    }

    async exists(id) {
        const [rows] = await db.execute(
            'SELECT COUNT(*) as count FROM users WHERE id = ?',
            [id]
        );
        return rows[0].count > 0;
    }
}

export default new UserRepo();