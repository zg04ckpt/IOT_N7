import db from '../config/database.js';
import User from '../models/user.model.js';

class UserRepo {
    async findAll() {
        const [rows] = await db.query('SELECT * FROM users');
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
        const { email, role, password } = userData;
        const [result] = await db.execute(
            'INSERT INTO users (email, role, password) VALUES (?, ?, ?)',
            [email, role, password]
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

    async exists(id) {
        const [rows] = await db.execute(
            'SELECT COUNT(*) as count FROM users WHERE id = ?',
            [id]
        );
        return rows[0].count > 0;
    }
}

export default new UserRepo();