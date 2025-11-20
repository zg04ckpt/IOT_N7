import { errorResponse } from "../utils/api.util.js";
import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
    try {
        let access_token;

        if (req.headers.authorization?.startsWith('Bearer ')) {
            access_token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies?.access_token) {
            access_token = req.cookies.access_token;
        }

        if (!access_token) {
            return errorResponse(res, 'Vui lòng đăng nhập', 401);
        }

        // Thêm thông tin để phân quyền
        const decoded = jwt.verify(access_token, process.env.JWT_SECRET);
        req.user = {
            id: decoded.id,
            role: decoded.role
        };

        next();
    } catch (error) {
        return errorResponse(res, 'Token đã hết hạn hoặc không hợp lệ', 401);
    }
};

export default authMiddleware;