import { Card, CardType } from "../models/card.model.js";
import cardRepo from "../repositories/card.repo.js";
import invoiceRepo from "../repositories/invoice.repo.js";
import { getDateAfferMonthsForSQL } from "../utils/time.util.js";
import { Invoice, InvoiceSource } from "../models/invoice.model.js";

class CardService {
    async getAllCards(page, size) {
        const cards = await cardRepo.findAll(page, size);
        return cards.map(card => card.toModel());
    }

    async getCardById(id) {
        if (!await cardRepo.exists(id))
            throw { statusCode: 400, message: 'Thẻ không tồn tại' };

        const card = await cardRepo.findById(id);
        return card.toModel();
    }

    async getCardByUid(uid) {
        if (!await cardRepo.uidExists(uid))
            throw { statusCode: 400, message: 'Thẻ không tồn tại' };

        const card = await cardRepo.findByUid(uid);
        return card.toModel();
    }

    async createCard(cardData) {
        if (!cardData.uid)
            throw { statusCode: 400, message: 'UID thẻ trống' };
        if (await cardRepo.uidExists(cardData.uid))
            throw { statusCode: 400, message: 'UID thẻ trùng lặp' };
        
        cardData.type = CardType.NORMAL;
        const card = await cardRepo.create(cardData);

        return card.toModel();
    }

    async updateCard(id, info, user_id) {
        const card = await cardRepo.findById(id);
        if (!card)
            throw { statusCode: 400, message: 'Thẻ không tồn tại' };

        // Chuyển về vé thường (hủy đăng kí)
        if (!info) {
            if (card.type == CardType.NORMAL)
                throw { statusCode: 400, message: 'Thẻ đã là vé lượt' };

            const updatedCard = await cardRepo.update(id, {
                type: CardType.NORMAL,
                monthly_user_name: null,
                monthly_user_phone: null,
                monthly_user_expiry: null,
                monthly_user_address: null
            });
            return updatedCard.toModel();
        }

        // Đăng kí vé tháng
        if (card.type == CardType.MONTHLY) 
            throw { statusCode: 400, message: 'Thẻ đã được đăng kí vé tháng' };
        if (!Card.isValidMonthlyUserName(info.name))
            throw { statusCode: 400, message: 'Tên người đăng kí vé tháng không hợp lệ (chỉ chứa chữ cái, không chứa số và kí tự đặc biệt, < 50 kí tự)' };
        if (!Card.isValidMonthlyUserPhone(info.phone))
            throw { statusCode: 400, message: 'Số điện thoại không hợp lệ' };
        if (!Card.isValidMonthlyUserExpiry(info.months))
            throw { statusCode: 400, message: 'Số tháng đăng kí không được <= 0' };
        if (!Card.isValidMonthlyUserAddress(info.address))
            throw { statusCode: 400, message: 'Địa chỉ không hợp lệ (Chỉ chứa chữ cái, không chứa số và kí tự đặc biệt, < 20 kí tự)' };
        
        const updatedCard = await cardRepo.update(id, {
            type: CardType.MONTHLY,
            monthly_user_name: info.name,
            monthly_user_phone: info.phone,
            monthly_user_expiry: getDateAfferMonthsForSQL(info.months),
            monthly_user_address: info.address
        });

        // Tự động tạo hóa đơn cho vé tháng
        const amount = Invoice.calculateMonthlyFee(info.months);
        await invoiceRepo.create({
            amount,
            from: InvoiceSource.MONTHLY_CARD,
            user_id: user_id,
            session_id: null
        });

        return updatedCard.toModel();
    }

    async deleteCard(id) {
        if (!await cardRepo.exists(id))
            throw { statusCode: 400, message: 'Thẻ không tồn tại' };

        if (!await cardRepo.delete(id))
            throw { statusCode: 500, message: 'Xóa thẻ thất bại' };
    }
}

export default new CardService();