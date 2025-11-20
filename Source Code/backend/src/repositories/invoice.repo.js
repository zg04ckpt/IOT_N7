import db from '../config/database.js';
import { Invoice } from '../models/invoice.model.js';

class InvoiceRepo {
    async findAll(page = 1, size = 10) {
        page = parseInt(page);
        size = parseInt(size);
        const offset = (page - 1) * size;
        const [rows] = await db.execute(
            `SELECT * FROM invoices ORDER BY created_at DESC LIMIT ${size} OFFSET ${offset}`,
        );
        return rows.map(row => new Invoice(row));
    }

    async findById(id) {
        const [rows] = await db.execute(
            'SELECT * FROM invoices WHERE id = ?',
            [id]
        );
        return rows[0] ? new Invoice(rows[0]) : null;
    }

    async findByDateRange(startDate, endDate, page = 1, size = 10) {
        page = parseInt(page);
        size = parseInt(size);
        const offset = (page - 1) * size;
        
        const [rows] = await db.execute(
            `SELECT * FROM invoices 
            WHERE created_at >= ? AND created_at <= ? 
            ORDER BY created_at DESC 
            LIMIT ${size} OFFSET ${offset}`,
            [startDate, endDate]
        );
        return rows.map(row => new Invoice(row));
    }

    async getTotalByDateRange(startDate, endDate) {
        const [rows] = await db.execute(
            `SELECT 
                COALESCE(SUM(amount), 0) as total_amount,
                COUNT(*) as total_count
            FROM invoices 
            WHERE created_at >= ? AND created_at <= ?`,
            [startDate, endDate]
        );
        return rows[0];
    }

    async getStatsBySource(startDate, endDate) {
        const [rows] = await db.execute(
            `SELECT 
                \`from\` as source,
                COALESCE(SUM(amount), 0) as total_amount,
                COUNT(*) as count
            FROM invoices 
            WHERE created_at >= ? AND created_at <= ?
            GROUP BY \`from\``,
            [startDate, endDate]
        );
        return rows;
    }

    async create(invoiceData) {
        const { amount, from, user_id, session_id } = invoiceData;
        const [result] = await db.execute(
            'INSERT INTO invoices (amount, `from`, user_id, session_id) VALUES (?, ?, ?, ?)',
            [amount, from, user_id, session_id]
        );
        return await this.findById(result.insertId);
    }

    async delete(id) {
        const [result] = await db.execute('DELETE FROM invoices WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

    async exists(id) {
        const [rows] = await db.execute(
            'SELECT COUNT(*) as count FROM invoices WHERE id = ?',
            [id]
        );
        return rows[0].count > 0;
    }
}

export default new InvoiceRepo();
