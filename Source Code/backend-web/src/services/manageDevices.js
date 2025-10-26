import deviceRepository from "../repository/deviceRepository.js";

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

export const createDevice = async (req, res) => {
  try {
    const { name, location, type, ipAddress, status } = req.body;

    if (!name || !location) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin tên thiết bị hoặc vị trí",
      });
    }

    const deviceData = {
      name: name.trim(),
      location: location.trim(),
      type: type || "camera",
      ipAddress: ipAddress || null,
      status: status || "active",
    };

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

    const existingDevice = await deviceRepository.findById(id);
    if (!existingDevice) {
      return res.status(404).json({
        success: false,
        message: "Thiết bị không tồn tại",
      });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (location !== undefined) updateData.location = location.trim();
    if (type !== undefined) updateData.type = type;
    if (ipAddress !== undefined) updateData.ipAddress = ipAddress;
    if (status !== undefined) updateData.status = status;

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

    const existingDevice = await deviceRepository.findById(id);
    if (!existingDevice) {
      return res.status(404).json({
        success: false,
        message: "Thiết bị không tồn tại",
      });
    }

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

export const deleteDevice = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin ID thiết bị",
      });
    }

    const existingDevice = await deviceRepository.findById(id);
    if (!existingDevice) {
      return res.status(404).json({
        success: false,
        message: "Thiết bị không tồn tại",
      });
    }

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
