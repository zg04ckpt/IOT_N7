import { Session, SessionStatus } from "../models/session.model.js";
import db from '../config/database.js';

class SessionRepo {
    async findAll(page = 1, size = 10) {
        page = parseInt(page);
        size = parseInt(size);
        const offset = (page - 1) * size;
        const [rows] = await db.execute(
            `SELECT * FROM sessions ORDER BY check_in DESC LIMIT ${size} OFFSET ${offset}`,
        );
        return rows.map(row => new Session(row));
    }

    async findById(id) {
        const [rows] = await db.execute(
            'SELECT * FROM sessions WHERE id = ?',
            [id]
        );
        return rows[0] ? new Session(rows[0]) : null;
    }

    async findByCardIdAndPlate(plate, card_id, status) {
        const [rows] = await db.execute(
            'SELECT * FROM sessions WHERE plate = ? AND card_id = ? AND status = ?',
            [plate, card_id, status]
        );
        return rows[0] ? new Session(rows[0]) : null;
    }

    async findByCardId(card_id, status) {
        const [rows] = await db.execute(
            'SELECT * FROM sessions WHERE card_id = ? AND status = ? LIMIT 1',
            [card_id, status]
        );
        return rows[0] ? new Session(rows[0]) : null;
    }

    async create(data) {
        const { card_id, plate, check_in_image_url, status, check_in } = data;
        const [result] = await db.execute(
            `INSERT INTO sessions 
            (card_id, plate, check_in_image_url, status, check_in) 
            VALUES (?, ?, ?, ?, ?)`,
            [card_id, plate, check_in_image_url, status, check_in]
        );
        return await this.findById(result.insertId);
    }

    async update(id, data) {
        const {
            status,
            check_out,
            check_out_image_url,
            user_id
        } = data;

        const [result] = await db.execute(
            `UPDATE sessions 
            SET 
                status = ?, 
                check_out = ?, 
                check_out_image_url = ?,
                user_id = ?
            WHERE id = ?`,
            [
                status,
                check_out,
                check_out_image_url,
                user_id,
                id
            ]
        );
        return await this.findById(id);
    }
}

export default new SessionRepo();