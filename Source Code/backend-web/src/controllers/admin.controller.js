import adminRepository from "../repository/adminRepository.js";

// Controller for admin endpoints
// Handles business logic and responds to HTTP requests

export const getAllAdmins = async (req, res) => {
  try {
    const admins = await adminRepository.findAll();
    res.status(200).json({
      success: true,
      data: admins,
      message: "Admins retrieved successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAdminById = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await adminRepository.findById(id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    res.status(200).json({
      success: true,
      data: admin,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAdminByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const admin = await adminRepository.findByEmail(email);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    res.status(200).json({
      success: true,
      data: admin,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createAdmin = async (req, res) => {
  try {
    const admin = await adminRepository.create(req.body);
    res.status(201).json({
      success: true,
      data: admin,
      message: "Admin created successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await adminRepository.update(id, req.body);
    res.status(200).json({
      success: true,
      data: admin,
      message: "Admin updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    await adminRepository.delete(id);
    res.status(200).json({
      success: true,
      message: "Admin deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export default {
  getAllAdmins,
  getAdminById,
  getAdminByEmail,
  createAdmin,
  updateAdmin,
  deleteAdmin,
};
