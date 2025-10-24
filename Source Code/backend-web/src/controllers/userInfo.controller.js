import userInfoRepository from "../repository/userInfoRepository.js";

// Controller for user info endpoints
// Handles business logic and responds to HTTP requests

export const getAllUserInfos = async (req, res) => {
  try {
    const userInfos = await userInfoRepository.findAll();
    res.status(200).json({
      success: true,
      data: userInfos,
      message: "User infos retrieved successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getUserInfoById = async (req, res) => {
  try {
    const { id } = req.params;
    const userInfo = await userInfoRepository.findById(id);

    if (!userInfo) {
      return res.status(404).json({
        success: false,
        message: "User info not found",
      });
    }

    res.status(200).json({
      success: true,
      data: userInfo,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getUserInfoByPhone = async (req, res) => {
  try {
    const { phone } = req.params;
    const userInfo = await userInfoRepository.findByPhone(phone);

    if (!userInfo) {
      return res.status(404).json({
        success: false,
        message: "User info not found",
      });
    }

    res.status(200).json({
      success: true,
      data: userInfo,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getUserInfoByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const userInfo = await userInfoRepository.findByEmail(email);

    if (!userInfo) {
      return res.status(404).json({
        success: false,
        message: "User info not found",
      });
    }

    res.status(200).json({
      success: true,
      data: userInfo,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createUserInfo = async (req, res) => {
  try {
    const userInfo = await userInfoRepository.create(req.body);
    res.status(201).json({
      success: true,
      data: userInfo,
      message: "User info created successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateUserInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const userInfo = await userInfoRepository.update(id, req.body);
    res.status(200).json({
      success: true,
      data: userInfo,
      message: "User info updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteUserInfo = async (req, res) => {
  try {
    const { id } = req.params;
    await userInfoRepository.delete(id);
    res.status(200).json({
      success: true,
      message: "User info deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export default {
  getAllUserInfos,
  getUserInfoById,
  getUserInfoByPhone,
  getUserInfoByEmail,
  createUserInfo,
  updateUserInfo,
  deleteUserInfo,
};
