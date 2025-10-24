import deviceRepository from "../repository/deviceRepository.js";

/**
 * QUẢN LÝ THIẾT BỊ (DEVICE)
 * Cung cấp các handler để thêm, sửa, xóa, lấy danh sách thiết bị
 */

// ========== GET ==========

/**
 * Lấy tất cả các thiết bị
 * GET /api/manage-devices/list
 */
export const getAllDevices = async (req, res) => {
  try {
    const devices = await deviceRepository.findAll();
    res.status(200).json({
      success: true,
      message: "Lấy danh sách thiết bị thành công",
      data: devices,
      total: devices.length,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách thiết bị:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi máy chủ nội bộ",
    });
  }
};

/**
 * Lấy chi tiết một thiết bị theo ID
 * GET /api/manage-devices/:id
 */
export const getDeviceById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin ID thiết bị",
      });
    }

    const device = await deviceRepository.findById(id);

    if (!device) {
      return res.status(404).json({
        success: false,
        message: "Thiết bị không tồn tại",
      });
    }

    res.status(200).json({
      success: true,
      message: "Lấy thông tin thiết bị thành công",
      data: device,
    });
  } catch (error) {
    console.error("Lỗi khi lấy thông tin thiết bị:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi máy chủ nội bộ",
    });
  }
};

/**
 * Lấy các thiết bị theo vị trí (location)
 * GET /api/manage-devices/location/:location
 */
export const getDevicesByLocation = async (req, res) => {
  try {
    const { location } = req.params;

    if (!location) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin vị trí",
      });
    }

    const devices = await deviceRepository.findByLocation(location);

    if (devices.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không có thiết bị tại vị trí này",
      });
    }

    res.status(200).json({
      success: true,
      message: "Lấy danh sách thiết bị theo vị trí thành công",
      data: devices,
      total: devices.length,
    });
  } catch (error) {
    console.error("Lỗi khi lấy thiết bị theo vị trí:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi máy chủ nội bộ",
    });
  }
};

// ========== POST (CREATE) ==========

/**
 * Thêm mới một thiết bị
 * POST /api/manage-devices
 * Body: { name, location, type, ipAddress, status }
 */
export const createDevice = async (req, res) => {
  try {
    const { name, location, type, ipAddress, status } = req.body;

    // Validation
    if (!name || !location) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin tên thiết bị hoặc vị trí",
      });
    }

    // Chuẩn bị dữ liệu
    const deviceData = {
      name: name.trim(),
      location: location.trim(),
      type: type || "camera", // Mặc định loại = camera
      ipAddress: ipAddress || null,
      status: status || "active", // Mặc định trạng thái = active
    };

    // Tạo thiết bị mới
    const newDevice = await deviceRepository.create(deviceData);

    res.status(201).json({
      success: true,
      message: "Thêm thiết bị mới thành công",
      data: newDevice,
    });
  } catch (error) {
    console.error("Lỗi khi thêm thiết bị:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi máy chủ nội bộ",
    });
  }
};

// ========== PUT (UPDATE) ==========

/**
 * Cập nhật thông tin thiết bị
 * PUT /api/manage-devices/:id
 * Body: { name, location, type, ipAddress, status }
 */
export const updateDevice = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location, type, ipAddress, status } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin ID thiết bị",
      });
    }

    // Kiểm tra thiết bị tồn tại
    const existingDevice = await deviceRepository.findById(id);
    if (!existingDevice) {
      return res.status(404).json({
        success: false,
        message: "Thiết bị không tồn tại",
      });
    }

    // Chuẩn bị dữ liệu cập nhật (chỉ cập nhật các trường được gửi)
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (location !== undefined) updateData.location = location.trim();
    if (type !== undefined) updateData.type = type;
    if (ipAddress !== undefined) updateData.ipAddress = ipAddress;
    if (status !== undefined) updateData.status = status;

    // Cập nhật
    const updatedDevice = await deviceRepository.update(id, updateData);

    res.status(200).json({
      success: true,
      message: "Cập nhật thiết bị thành công",
      data: updatedDevice,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật thiết bị:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi máy chủ nội bộ",
    });
  }
};

/**
 * Thay đổi trạng thái thiết bị (active/inactive)
 * PATCH /api/manage-devices/:id/status
 * Body: { status }
 */
export const updateDeviceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin ID thiết bị",
      });
    }

    if (!status || !["active", "inactive"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái không hợp lệ. Phải là 'active' hoặc 'inactive'",
      });
    }

    // Kiểm tra thiết bị tồn tại
    const existingDevice = await deviceRepository.findById(id);
    if (!existingDevice) {
      return res.status(404).json({
        success: false,
        message: "Thiết bị không tồn tại",
      });
    }

    // Cập nhật trạng thái
    const updatedDevice = await deviceRepository.update(id, { status });

    res.status(200).json({
      success: true,
      message: `Cập nhật trạng thái thiết bị thành ${status} thành công`,
      data: updatedDevice,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái thiết bị:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi máy chủ nội bộ",
    });
  }
};

// ========== DELETE ==========

/**
 * Xóa một thiết bị
 * DELETE /api/manage-devices/:id
 */
export const deleteDevice = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin ID thiết bị",
      });
    }

    // Kiểm tra thiết bị tồn tại
    const existingDevice = await deviceRepository.findById(id);
    if (!existingDevice) {
      return res.status(404).json({
        success: false,
        message: "Thiết bị không tồn tại",
      });
    }

    // Xóa thiết bị
    await deviceRepository.delete(id);

    res.status(200).json({
      success: true,
      message: "Xóa thiết bị thành công",
      data: { id, name: existingDevice.name },
    });
  } catch (error) {
    console.error("Lỗi khi xóa thiết bị:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi máy chủ nội bộ",
    });
  }
};

export default {
  getAllDevices,
  getDeviceById,
  getDevicesByLocation,
  createDevice,
  updateDevice,
  updateDeviceStatus,
  deleteDevice,
};
