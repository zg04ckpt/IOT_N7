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
        const { email, role, password, phone, plate } = userData;
        const [result] = await db.execute(
            'INSERT INTO users (email, role, password, phone, plate) VALUES (?, ?, ?, ?, ?)',
            [email, role, password, phone, plate ?? null]
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

    async getMonthlyCardByPhone(phone) {
        const [cards] = await db.execute(
            `SELECT * FROM cards 
             WHERE monthly_user_phone = ? AND type = 'MONTHLY' AND monthly_user_expiry > NOW() 
             ORDER BY monthly_user_expiry DESC LIMIT 1`,
            [phone]
        );
        return cards.length > 0 ? cards[0] : null;
    }

    async getParkingSessionsByPlate(plate, limit = 50) {
        const [sessions] = await db.execute(
            `SELECT s.*, i.amount as total_amount, i.id as invoice_id 
             FROM sessions s 
             LEFT JOIN invoices i ON i.session_id = s.id 
             WHERE s.plate = ? 
             ORDER BY s.check_in DESC 
             LIMIT ${limit}`,
            [plate]
        );
        return sessions;
    }
}

export default new UserRepo();