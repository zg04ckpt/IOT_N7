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
        // Lấy device hiện tại để merge data
        const currentDevice = await this.findById(id);
        if (!currentDevice) return null;

        // Chỉ update các field được truyền vào (khác undefined)
        const updates = [];
        const values = [];

        if (deviceData.name !== undefined) {
            updates.push('name = ?');
            values.push(deviceData.name);
        }
        if (deviceData.board !== undefined) {
            updates.push('board = ?');
            values.push(deviceData.board);
        }
        if (deviceData.latest_version !== undefined) {
            updates.push('latest_version = ?');
            values.push(deviceData.latest_version);
        }
        if (deviceData.curr_version !== undefined) {
            updates.push('curr_version = ?');
            values.push(deviceData.curr_version);
        }
        if (deviceData.total_versions !== undefined) {
            updates.push('total_versions = ?');
            values.push(deviceData.total_versions);
        }
        if (deviceData.status !== undefined) {
            updates.push('status = ?');
            values.push(deviceData.status);
        }

        if (updates.length === 0) {
            return currentDevice; // Không có gì để update
        }

        updates.push('updated_at = NOW()');
        values.push(id);

        const sql = `UPDATE devices SET ${updates.join(', ')} WHERE id = ?`;
        await db.execute(sql, values);
        
        return await this.findById(id);
    }

    async updateStatus(id, status, curr_version) {
        const [result] = await db.execute(
            'UPDATE devices SET status = ?, curr_version = ?, updated_at = NOW() WHERE id = ?',
            [status, curr_version, id]
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
