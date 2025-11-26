import db from '../config/database.js';
import { Device } from '../models/device.model.js';

class DeviceRepo {
    async findAll(page = 1, size = 10) {
        page = parseInt(page);
        size = parseInt(size);
        const offset = (page - 1) * size;
        const [rows] = await db.execute(
            `SELECT * FROM devices ORDER BY created_at DESC LIMIT ${size} OFFSET ${offset}`,
        );
        return rows.map(row => new Device(row));
    }

    async findById(id) {
        const [rows] = await db.execute(
            'SELECT * FROM devices WHERE id = ?',
            [id]
        );
        return rows[0] ? new Device(rows[0]) : null;
    }

    async findByName(name) {
        const [rows] = await db.execute(
            'SELECT * FROM devices WHERE name = ?',
            [name]
        );
        return rows[0] ? new Device(rows[0]) : null;
    }

    async findByKey(key) {
        const [rows] = await db.execute(
            'SELECT * FROM devices WHERE `key` = ?',
            [key]
        );
        return rows[0] ? new Device(rows[0]) : null;
    }

    async create(deviceData) {
        const {
            name,
            board,
            latest_version,
            curr_version,
            total_versions,
            firmware_folder_path,
            status,
            key
        } = deviceData;

        const [result] = await db.execute(
            `INSERT INTO devices 
            (name, board, latest_version, curr_version, total_versions, firmware_folder_path, status, \`key\`) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, board, latest_version, curr_version, total_versions, firmware_folder_path, status, key]
        );
        return await this.findById(result.insertId);
    }

    async update(id, deviceData) {
        const {
            name,
            board,
            latest_version,
            curr_version,
            total_versions,
            status
        } = deviceData;

        const [result] = await db.execute(
            `UPDATE devices 
            SET 
                name = COALESCE(?, name),
                board = COALESCE(?, board),
                latest_version = COALESCE(?, latest_version),
                curr_version = COALESCE(?, curr_version),
                total_versions = COALESCE(?, total_versions),
                status = COALESCE(?, status),
                updated_at = NOW()
            WHERE id = ?`,
            [name, board, latest_version, curr_version, total_versions, status, id]
        );
        return await this.findById(id);
    }

    async updateStatus(id, status) {
        const [result] = await db.execute(
            'UPDATE devices SET status = ?, updated_at = NOW() WHERE id = ?',
            [status, id]
        );
        return result.affectedRows > 0;
    }

    async updateVersion(id, version, totalVersions) {
        const [result] = await db.execute(
            `UPDATE devices 
            SET latest_version = ?, total_versions = ?, updated_at = NOW() 
            WHERE id = ?`,
            [version, totalVersions, id]
        );
        return result.affectedRows > 0;
    }

    async delete(id) {
        const [result] = await db.execute('DELETE FROM devices WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

    async exists(id) {
        const [rows] = await db.execute(
            'SELECT COUNT(*) as count FROM devices WHERE id = ?',
            [id]
        );
        return rows[0].count > 0;
    }

    async nameExists(name) {
        const [rows] = await db.execute(
            'SELECT COUNT(*) as count FROM devices WHERE name = ?',
            [name]
        );
        return rows[0].count > 0;
    }

    async keyExists(key) {
        const [rows] = await db.execute(
            'SELECT COUNT(*) as count FROM devices WHERE `key` = ?',
            [key]
        );
        return rows[0].count > 0;
    }
}

export default new DeviceRepo();
