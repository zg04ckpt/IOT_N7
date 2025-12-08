import userService from "../services/user.service.js";
import { successResponse } from "../utils/api.util.js";
import dotenv from 'dotenv';

dotenv.config();

class UserController {
    async getAll(req, res, next) {
        try {
            const users = await userService.getAllUsers(req.query.page, req.query.size);
            return successResponse(res, '', users)
        } catch (error) {
            next(error);
        }
    }

    async getById(req, res, next) {
        try {
            const user = await userService.getUserById(req.params.id);
            return successResponse(res, '', user);
        } catch (error) {
            next(error);
        }
    }

    async register(req, res, next) {
        res.clearCookie('access_token');
        try {
            const user = await userService.register(req.body);
            return successResponse(res, 'Tạo thành công', user, 201);
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const user = await userService.createUser(req.body);
            return successResponse(res, 'Tạo thành công', user, 201);
        } catch (error) {
            next(error);
        }
    }

    async delete(req, res, next) {
        try {
            await userService.deleteUser(req.params.id);
            return successResponse(res, 'Xóa thành công', null);
        } catch (error) {
            next(error);
        }
    }

    async login(req, res, next) {
        try {
            const result = await userService.login(req.body.email, req.body.password);
            
            // Lưu access token ở cookie (chỉ bật secure trên production) và trả token về body để client có thể set header Authorization
            const cookieOptions = {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
                maxAge: 24 * 60 * 60 * 1000, // 24h
            };

            res.cookie('access_token', result.token, cookieOptions);
            
            return successResponse(res, 'Đăng nhập thành công', {
                user: result.user,
                token: result.token,
            });
        } catch (error) {
            next(error);
        }
    }

    async logout(req, res, next) {
        res.clearCookie('access_token');
        return successResponse(res, 'Đăng xuất thành công', null);
    }

    async getProfile(req, res, next) {
        try {
            const profile = await userService.getProfile(req.user.id);
            return successResponse(res, '', profile);
        } catch (error) {
            next(error);
        }
    }
}

export default new UserController();