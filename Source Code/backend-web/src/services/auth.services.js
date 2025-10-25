import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import adminRepository from "../repository/adminRepository.js";

/**
 * LOGIN - Kiểm tra username/password admin, generate JWT token
 * POST /api/auth/login
 * Body: { username: "admin", password: "123" }
 */
export const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username và password không được để trống",
      });
    }

    console.log(` Tìm admin với username: ${username}`);

    // Kiểm tra admin tồn tại
    const admin = await adminRepository.findByUsername(username);
    
    if (!admin) {
      console.log(` Admin không tồn tại: ${username}`);
      return res.status(404).json({
        success: false,
        message: "Username hoặc password không chính xác",
      });
    }

    //  Kiểm tra password với bcrypt
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    
    if (!isPasswordValid) {
      console.log(` Password sai cho admin: ${username}`);
      return res.status(401).json({
        success: false,
        message: "Username hoặc password không chính xác",
      });
    }

    console.log(` Password đúng cho admin: ${username}`);

    // Generate JWT token
    const tokenPayload = {
      id: admin.id,
      username: admin.username,
      role: "admin",
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET || "secret_key_123", {
      expiresIn: "24h", // Token hết hạn sau 24 giờ
    });

    console.log(` Token generated cho admin: ${username}`);

    res.status(200).json({
      success: true,
      message: "Đăng nhập thành công",
      data: {
        id: admin.id,
        username: admin.username,
        token: token,
        expiresIn: "24h",
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

/**
 * LOGOUT - Chỉ response success (client sẽ xóa token)
 * POST /api/auth/logout
 * Header: Authorization: Bearer <token>
 */
export const logoutAdmin = async (req, res) => {
  try {
    // Lấy thông tin admin từ req.user (đã verify bởi middleware)
    const admin = req.user;

    console.log(` Admin ${admin.username} đã logout`);

    res.status(200).json({
      success: true,
      message: "Đăng xuất thành công",
      data: {
        username: admin.username,
        message: "Vui lòng xóa token trên client",
      },
    });
  } catch (error) {
    console.error("Lỗi khi đăng xuất:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi máy chủ nội bộ",
    });
  }
};

export default {
  loginAdmin,
  logoutAdmin,
};
