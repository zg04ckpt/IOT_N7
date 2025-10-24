import deviceRepository from "../repository/deviceRepository.js";

// Controller for device endpoints
// Handles business logic and responds to HTTP requests

export const getAllDevices = async (req, res) => {
  try {
    const devices = await deviceRepository.findAll();
    res.status(200).json({
      success: true,
      data: devices,
      message: "Devices retrieved successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getDeviceById = async (req, res) => {
  try {
    const { id } = req.params;
    const device = await deviceRepository.findById(id);

    if (!device) {
      return res.status(404).json({
        success: false,
        message: "Device not found",
      });
    }

    res.status(200).json({
      success: true,
      data: device,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getDevicesByLocation = async (req, res) => {
  try {
    const { location } = req.params;
    const devices = await deviceRepository.findByLocation(location);
    res.status(200).json({
      success: true,
      data: devices,
      message: "Devices retrieved by location",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createDevice = async (req, res) => {
  try {
    const device = await deviceRepository.create(req.body);
    res.status(201).json({
      success: true,
      data: device,
      message: "Device created successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateDevice = async (req, res) => {
  try {
    const { id } = req.params;
    const device = await deviceRepository.update(id, req.body);
    res.status(200).json({
      success: true,
      data: device,
      message: "Device updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteDevice = async (req, res) => {
  try {
    const { id } = req.params;
    await deviceRepository.delete(id);
    res.status(200).json({
      success: true,
      message: "Device deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export default {
  getAllDevices,
  getDeviceById,
  getDevicesByLocation,
  createDevice,
  updateDevice,
  deleteDevice,
};
