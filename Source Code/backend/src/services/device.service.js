import deviceRepo from "../repositories/device.repo.js";
import { Device, DeviceStatus } from "../models/device.model.js";
import { buildFirmware } from "../utils/device.util.js";
import crypto from "crypto";
import fs from "fs/promises";
import path from "path";

const FIRMWARE_BASE_DIR = path.resolve("firmware_versions");

class DeviceService {
  async getAllDevices(page, size) {
    const devices = await deviceRepo.findAll(page, size);
    return devices.map((device) => device.toModel());
  }

  async getDeviceById(id) {
    const device = await deviceRepo.findById(id);
    if (!device) throw { statusCode: 404, message: "Thiết bị không tồn tại" };

    return device.toModel();
  }

  async createDevice(name, board, sourceCode) {
    // Validate
    if (!Device.isValidName(name))
      throw {
        statusCode: 400,
        message:
          "Tên thiết bị không hợp lệ (chỉ chứa chữ, số, gạch ngang và gạch dưới, tối đa 100 ký tự)",
      };

    if (!Device.isValidBoard(board))
      throw { statusCode: 400, message: "Board không hợp lệ" };

    if (await deviceRepo.nameExists(name))
      throw { statusCode: 400, message: "Tên thiết bị đã tồn tại" };

    if (!sourceCode || typeof sourceCode !== "string")
      throw { statusCode: 400, message: "Source code bắt buộc" };

    // Build firmware từ source code
    let result;
    try {
      result = await buildFirmware(sourceCode, name, board, 0);
    } catch (error) {
      throw {
        statusCode: 500,
        message: "Biên dịch firmware thất bại: " + error.message,
      };
    }

    // Tạo key duy nhất
    const key = crypto.randomBytes(32).toString("hex");

    // Lưu vào database
    const device = await deviceRepo.create({
      name,
      board,
      latest_version: result.version,
      curr_version: 1,
      total_versions: 1,
      firmware_folder_path: `/firmware_versions/${name}`,
      status: DeviceStatus.OFFLINE,
      key,
    });

    return device.toModel();
  }

  async updateVersion(deviceId, sourceCode, userId) {
    const device = await deviceRepo.findById(deviceId);
    if (!device) throw { statusCode: 404, message: "Thiết bị không tồn tại" };

    if (!sourceCode || typeof sourceCode !== "string")
      throw { statusCode: 400, message: "Source code bắt buộc" };

    // Build firmware version mới
    const currentVersion = parseInt(device.latest_version) || 0;
    let result;
    try {
      result = await buildFirmware(
        sourceCode,
        device.name,
        device.board,
        currentVersion
      );
    } catch (error) {
      throw {
        statusCode: 500,
        message: "Biên dịch firmware thất bại: " + error.message,
      };
    }

    // Cập nhật database
    await deviceRepo.updateVersion(
      deviceId,
      result.version,
      device.total_versions + 1
    );

    return {
      version: result.version,
      firmware_path: result.binPath,
    };
  }

  async checkVersion(deviceId, key) {
    const device = await deviceRepo.findById(deviceId);
    if (!device) throw { statusCode: 404, message: "Thiết bị không tồn tại" };

    if (device.key !== key)
      throw { statusCode: 403, message: "Key không hợp lệ" };

    return {
      version: device.latest_version,
      firmware_path: `${device.firmware_folder_path}/${device.latest_version}.bin`,
    };
  }

  async updateStatus(deviceId, status, key) {
    const device = await deviceRepo.findById(deviceId);
    if (!device) throw { statusCode: 404, message: "Thiết bị không tồn tại" };

    if (device.key !== key)
      throw { statusCode: 403, message: "Key không hợp lệ" };

    if (!Device.isValidStatus(status))
      throw { statusCode: 400, message: "Trạng thái không hợp lệ" };

    await deviceRepo.updateStatus(deviceId, status);

    return { message: "Cập nhật trạng thái thành công" };
  }

  async deleteDevice(id) {
    const device = await deviceRepo.findById(id);
    if (!device) throw { statusCode: 404, message: "Thiết bị không tồn tại" };

    // Xóa thư mục firmware
    const firmwarePath = path.resolve(device.firmware_folder_path);
    try {
      await fs.rm(firmwarePath, { recursive: true, force: true });
    } catch (error) {
      console.error("Không thể xóa thư mục firmware:", error);
    }

    if (!(await deviceRepo.delete(id)))
      throw { statusCode: 500, message: "Xóa thiết bị thất bại" };
  }
}

export default new DeviceService();
