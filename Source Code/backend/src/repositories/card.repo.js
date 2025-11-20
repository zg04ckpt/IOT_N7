import db from '../config/database.js';
import { Card } from '../models/card.model.js';

class CardRepo {
    async findAll(page = 1, size = 10) {
        page = parseInt(page);
        size = parseInt(size);
        const offset = (page - 1) * size;
        const [rows] = await db.execute(
            `SELECT * FROM cards ORDER BY created_at DESC LIMIT ${size} OFFSET ${offset}`,
        );
        return rows.map(row => new Card(row));
    }

    async findById(id) {
        const [rows] = await db.execute(
            'SELECT * FROM cards WHERE id = ?',
            [id]
        );
        return rows[0] ? new Card(rows[0]) : null;
    }

    async findByUid(uid) {
        const [rows] = await db.execute(
            'SELECT * FROM cards WHERE uid = ?',
            [uid]
        );
        return rows[0] ? new Card(rows[0]) : null;
    }

    async create(cardData) {
        const { uid, type } = cardData;
        const [result] = await db.execute(
            'INSERT INTO cards (uid, type) VALUES (?, ?)',
            [uid, type]
        );
        return await this.findById(result.insertId);
    }

    async update(cardId, cardData) {
        const { 
            type, 
            monthly_user_name, 
            monthly_user_phone, 
            monthly_user_expiry, 
            monthly_user_address 
        } = cardData;

        console.log(cardData)

        const [result] = await db.execute(
            `UPDATE cards 
            SET 
                type = ?, 
                monthly_user_name = ?, 
                monthly_user_phone = ?, 
                monthly_user_expiry = ?, 
                monthly_user_address = ?, 
                updated_at = NOW()
            WHERE id = ?`,
            [
                type,
                monthly_user_name,
                monthly_user_phone,
                monthly_user_expiry,
                monthly_user_address,
                cardId
            ]
        );
        return await this.findById(cardId);
    }

    async delete(id) {
        const [result] = await db.execute('DELETE FROM cards WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

    async exists(id) {
        const [rows] = await db.execute(
            'SELECT COUNT(*) as count FROM cards WHERE id = ?',
            [id]
        );
        return rows[0].count > 0;
    }

    async uidExists(uid) {
        const [rows] = await db.execute(
            'SELECT COUNT(*) as count FROM cards WHERE uid = ?',
            [uid]
        );
        return rows[0].count > 0;
    }
}

export default new CardRepo();