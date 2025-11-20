import deviceService from '../services/device.service.js';
import { successResponse } from '../utils/api.util.js';

class DeviceController {
    async getAll(req, res, next) {
        try {
            const { page = 1, size = 10 } = req.query;
            const devices = await deviceService.getAllDevices(page, size);
            return successResponse(res, '', devices);
        } catch (error) {
            next(error);
        }
    }

    async getById(req, res, next) {
        try {
            const device = await deviceService.getDeviceById(req.params.id);
            return successResponse(res, '', device);
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const { name, board, source_code } = req.body;

            const device = await deviceService.createDevice(name, board, source_code);
            return successResponse(res, 'Tạo thiết bị thành công', device, 201);
        } catch (error) {
            next(error);
        }
    }

    async updateVersion(req, res, next) {
        try {
            const { id } = req.params;
            const { source_code } = req.body;
            const userId = req.user.id;

            const result = await deviceService.updateVersion(id, source_code, userId);
            return successResponse(res, 'Cập nhật firmware thành công', result);
        } catch (error) {
            next(error);
        }
    }

    async checkVersion(req, res, next) {
        try {
            const { device_id, key } = req.query;
            const result = await deviceService.checkVersion(device_id, key);
            return successResponse(res, '', result);
        } catch (error) {
            next(error);
        }
    }

    async updateStatus(req, res, next) {
        try {
            const { device_id, status, key } = req.body;
            const result = await deviceService.updateStatus(device_id, status, key);
            return successResponse(res, result.message, null);
        } catch (error) {
            next(error);
        }
    }

    async delete(req, res, next) {
        try {
            await deviceService.deleteDevice(req.params.id);
            return successResponse(res, 'Xóa thiết bị thành công', null);
        } catch (error) {
            next(error);
        }
    }
}

export default new DeviceController();
