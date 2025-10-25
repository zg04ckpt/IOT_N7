import jwt from "jsonwebtoken";

/**
 * Middleware để verify JWT token từ header Authorization
 * Sử dụng: router.get('/protected', verifyToken, controllerFunction)
 */
export const verifyToken = (req, res, next) => {
  try {
    // Lấy token từ header Authorization (format: "Bearer <token>")
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Thiếu token trong header Authorization",
      });
    }

    // Tách token từ "Bearer <token>"
    const token = authHeader.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token không hợp lệ (định dạng: Bearer <token>)",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret_key_123");
    
    console.log(`✅ Token verified cho admin:`, decoded.username);
    
    // Lưu thông tin admin vào req để sử dụng ở controller
    req.user = decoded;
    
    next();
  } catch (error) {
    console.error("❌ Lỗi verify token:", error.message);
    
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token đã hết hạn",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Token không hợp lệ",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || "Lỗi xác thực",
    });
  }
};

export default verifyToken;
