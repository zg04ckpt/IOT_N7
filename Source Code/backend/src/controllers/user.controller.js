import userService from "../services/user.service.js";
import { successResponse } from "../utils/api.util.js";
import dotenv from 'dotenv';

dotenv.config()

class UserController {
    async getAll(req, res, next) {
        try {
            const users = await userService.getAllUsers();
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
            
            // Lưu access token ở cookie
            res.cookie('access_token', result.token, { 
                httpOnly: true,     
                secure: process.env.NODE_ENV == 'development'? false:true,      
                sameSite: 'strict', 
                maxAge: 24 * 60 * 60 * 1000 // 24h
            });
            
            return successResponse(res, 'Đăng nhập thành công', result.user);
        } catch (error) {
            next(error);
        }
    }

    async logout(req, res, next) {
        res.clearCookie('access_token');
        return successResponse(res, 'Đăng xuất thành công', null);
    }
}

export default new UserController();