import cardService from "../services/card.service.js";
import { successResponse } from "../utils/api.util.js";

class CardController {
    async getAll(req, res, next) {
        try {
            const cards = await cardService.getAllCards(req.query.page, req.query.size);
            return successResponse(res, '', cards)
        } catch (error) {
            next(error);
        }
    }

    async getById(req, res, next) {
        try {
            const card = await cardService.getCardById(req.params.id);
            return successResponse(res, '', card)
        } catch (error) {
            next(error);
        }
    }

    async getByUid(req, res, next) {
        try {
            const card = await cardService.getCardByUid(req.query.uid);
            return successResponse(res, '', card)
        } catch (error) {
            next(error);
        }
    }

    async createCard(req, res, next) {
        try {
            const card = await cardService.createCard(req.body);
            return successResponse(res, 'Tạo thẻ tháng thành công', card)
        } catch (error) {
            next(error);
        }
    }

    async registerMonthlyCard(req, res, next) {
        try {
            const card = await cardService.updateCard(req.params.id, req.body);
            return successResponse(res, 'Đăng kí vé tháng thành công', card)
        } catch (error) {
            next(error);
        }
    }

    async unregisterMonthlyCard(req, res, next) {
        try {
            const card = await cardService.updateCard(req.params.id, null);
            return successResponse(res, 'Hủy đăng kí vé tháng thành công', card)
        } catch (error) {
            next(error);
        }
    }

    async deleteCard(req, res, next) {
        try {
            await cardService.deleteCard(req.params.id);
            return successResponse(res, 'Xóa thẻ thành công', null)
        } catch (error) {
            next(error);
        }
    }
}

export default new CardController();