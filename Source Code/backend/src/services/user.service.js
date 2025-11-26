import jwt from 'jsonwebtoken';
import userRepo from '../repositories/user.repo.js';
import User from '../models/user.model.js';
import Role from '../models/role.model.js';
import { comparePassword, hashPassword } from '../utils/pass.util.js';

class UserService {
    async getAllUsers(page, size) {
        const users = await userRepo.findAll(page, size);
        return users.map(user => user.toModel());
    }

    async getUserById(id) {
        const user = await userRepo.findById(id);
        if (!user)
            throw { statusCode: 404, message: 'Người dùng không tồn tại' };
        
        return user.toModel();
    }

    async register(userData) {
        if (!User.isValidEmail(userData.email))
            throw { statusCode: 400, message: 'Email không hợp lệ' };
        if (!User.isValidPassword(userData.password))
            throw { statusCode: 400, message: 'Mật khẩu dài ít nhất 6 kí tự' };
        if (!User.isValidPhone(userData.phone))
            throw { statusCode: 400, message: 'Số điện thoại không hợp lệ' };
        if (userData.plate && !User.isValidPlate(userData.plate))
            throw { statusCode: 400, message: 'Biển số xe không hợp lệ' };
        if (await userRepo.emailExists(userData.email))
            throw { statusCode: 400, message: 'Email đã được sử dụng' };
        if (await userRepo.phoneExists(userData.phone))
            throw { statusCode: 400, message: 'Số điện thoại đã được sử dụng' };

        userData.password = await hashPassword(userData.password);
        userData.role = Role.USER;

        const user = await userRepo.create(userData);

        return user.toModel();
    }

    async createUser(userData) {
        if (!User.isValidEmail(userData.email))
            throw { statusCode: 400, message: 'Email không hợp lệ' };
        if (!User.isValidPhone(userData.phone))
            throw { statusCode: 400, message: 'Số điện thoại không hợp lệ' };
        if (await userRepo.phoneExists(userData.phone))
            throw { statusCode: 400, message: 'Số điện thoại đã được sử dụng' };
        if (!User.isValidPassword(userData.password))
            throw { statusCode: 400, message: 'Mật khẩu dài ít nhất 6 kí tự' };
        if (await userRepo.emailExists(userData.email))
            throw { statusCode: 400, message: 'Email đã được sử dụng' };
        if (!userData.role) 
            throw { statusCode: 400, message: 'Vui lòng chọn quyền' };
        if (!Object.values(Role).includes(userData.role))
            throw { statusCode: 400, message: 'Quyền không tồn tại' };
        if (userData.role == Role.ADMIN)
            throw { statusCode: 403, message: 'Không thể tạo tài khoản ADMIN' };
            
        userData.password = await hashPassword(userData.password);
        userData.plate = null;

        const user = await userRepo.create(userData);

        return user.toModel();
    }

    async deleteUser(id) {
        const user = await userRepo.findById(id)
        if (!user) 
            throw { statusCode: 404, message: 'Người dùng không tồn tại' };

        if (user.role == Role.ADMIN || user.role == Role.GUARD) {
            throw { statusCode: 403, message: 'Không được phép xóa tài khoản mặc định (ADMIN và GUARD)' };
        }

        if (!await userRepo.delete(id))
            throw { statusCode: 500, message: 'Xóa người dùng thất bại' };
    }

    async login(email, password) {
        if (!User.isValidEmail(email))
            throw { statusCode: 400, message: 'Email không hợp lệ' };

        const user = await userRepo.findByEmail(email);
        if (!user) 
            throw { statusCode: 401, message: 'Người dùng không tồn tại' };
        
        // Kiểm tra mật khẩu
        if (!await comparePassword(password, user.password)) 
            throw { statusCode: 401, message: 'Sai mật khẩu' };

        // Tạo jwt token
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        return {
            user: user.toModel(),
            token
        };
    }

    async getProfile(userId) {
        const user = await userRepo.findById(userId);
        if (!user)
            throw { statusCode: 404, message: 'Người dùng không tồn tại' };

        // Lấy thông tin thẻ tháng theo phone
        const monthlyCard = user.phone ? await userRepo.getMonthlyCardByPhone(user.phone) : null;

        // Lấy thông tin các phiên đỗ xe theo plate
        const parkingSessions = user.plate ? await userRepo.getParkingSessionsByPlate(user.plate) : [];

        return {
            user: user.toModel(),
            monthly_card: monthlyCard,
            parking_sessions: parkingSessions
        };
    }
}

export default new UserService();