import bcrypt from "bcrypt";
import adminRepository from "../repository/adminRepository.js";

export const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username và password không được để trống",
      });
    }

    console.log(` Tìm admin với username: ${username}`);

    const admin = await adminRepository.findByUsername(username);

    if (!admin) {
      console.log(` Admin không tồn tại: ${username}`);
      return res.status(404).json({
        success: false,
        message: "Username hoặc password không chính xác",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      console.log(` Password sai cho admin: ${username}`);
      return res.status(401).json({
        success: false,
        message: "Username hoặc password không chính xác",
      });
    }

    console.log(` Password đúng cho admin: ${username}`);

    req.session.adminId = admin.id;
    req.session.username = admin.username;
    req.session.role = "admin";

    console.log(` Session created cho admin: ${username}`);

    res.status(200).json({
      success: true,
      message: "Đăng nhập thành công",
      data: {
        id: admin.id,
        username: admin.username,
        message: "Session đã được tạo",
      },
    });
  } catch (error) {
    console.error("Lỗi khi đăng nhập:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi máy chủ nội bộ",
    });
  }
};

export const logoutAdmin = async (req, res) => {
  try {
    const username = req.session.username;

    req.session.destroy((err) => {
      if (err) {
        console.error("Lỗi khi hủy session:", err);
        return res.status(500).json({
          success: false,
          message: "Lỗi khi đăng xuất",
        });
      }

      console.log(` Admin ${username} đã logout`);

      res.status(200).json({
        success: true,
        message: "Đăng xuất thành công",
        data: {
          username: username,
          message: "Session đã được hủy",
        },
      });
    });
  } catch (error) {
    console.error("Lỗi khi đăng xuất:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi máy chủ nội bộ",
    });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    if (!req.session.adminId) {
      return res.status(401).json({
        success: false,
        message: "Chưa đăng nhập",
      });
    }

    const admin = await adminRepository.findById(req.session.adminId);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thông tin admin",
      });
    }

    res.status(200).json({
      success: true,
      message: "Lấy thông tin user thành công",
      data: {
        id: admin.id,
        username: admin.username,
        role: "admin",
      },
    });
  } catch (error) {
    console.error("Lỗi khi lấy thông tin user:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi máy chủ nội bộ",
    });
  }
};

export default {
  loginAdmin,
  logoutAdmin,
  getCurrentUser,
};
