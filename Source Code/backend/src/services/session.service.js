import { Session, SessionStatus } from "../models/session.model.js";
import cardRepo from "../repositories/card.repo.js";
import sessionRepo from "../repositories/session.repo.js";
import userRepo from "../repositories/user.repo.js";
import invoiceRepo from "../repositories/invoice.repo.js";
import { saveFile } from "../utils/file.util.js";
import { getDateForSQL } from "../utils/time.util.js";
import { Invoice, InvoiceSource } from "../models/invoice.model.js";
import { CardType } from "../models/card.model.js";

class SessionService {
    async getAllSessions(page, size) {
        const sessions = await sessionRepo.findAll(page, size);
        return sessions.map(session => session.toModel());
    }

    async check(plate, card_uid, image, user_id) {
        if (!Session.isValidPlate(plate)) 
            throw { statusCode: 400, message: 'Biển số xe không hợp lệ' };
        
        const card = await cardRepo.findByUid(card_uid);
        if (!card)
            throw { statusCode: 404, message: 'Thẻ gửi xe không tồn tại' };

        if (!image) {
            throw { statusCode: 400, message: 'Không nhận được ảnh kiểm tra' };
        }

        if (!await userRepo.exists(user_id))
            throw { statusCode: 403, message: 'Thông tin nhân viên không hợp lệ' };

        const session = await sessionRepo.findByCardId(card.id, SessionStatus.PAKING);
        
        if (!session) {
            return await this.handleCheckIn(plate, card, image);
        }

        if (session.plate !== plate) {
            return await this.handleCheckIn(plate, card, image);
            // throw { 
            //     statusCode: 403, 
            //     message: `Thẻ đã check-in với biển số ${session.plate}.` 
            // };
        }

        return await this.handleCheckOut(session, plate, card, image, user_id)
    }

    async handleCheckIn(plate, card, check_in_image) {
        // Kiểm tra vé tháng hết hạn
        if (card.type === 'monthly') {
            if (!card.monthly_user_expiry || new Date(card.monthly_user_expiry) < new Date()) {
                throw { statusCode: 403, message: 'Vé tháng đã hết hạn' };
            }
        }

        const check_in_image_url = await saveFile(check_in_image);

        const session = await sessionRepo.create({
            card_id: card.id, 
            plate, check_in_image_url, 
            status: SessionStatus.PAKING,
            check_in: getDateForSQL()
        });

        // Thêm thông tin thẻ tháng nếu có
        const checkin = session.toModel();
        if (card.type == CardType.MONTHLY) {
            checkin.info = {
                monthly_user_name: card.monthly_user_name,
                monthly_user_phone: card.monthly_user_phone,
                monthly_user_expiry: card.monthly_user_expiry,
                monthly_user_address: card.monthly_user_address,
            }
        }

        return checkin;
    }

    async handleCheckOut(session, plate, card, image, user_id) {
        if (session.plate != plate) 
            throw { statusCode: 403, message: 'Biển số xe không hợp lệ' };
        if (session.card_id != card.id)
            throw { statusCode: 403, message: 'Vé xe không hợp lệ' };

        if (!image) {
            throw { statusCode: 400, message: 'Ảnh check-out bắt buộc' };
        }

        session.check_out_image_url = await saveFile(image);
        session.status = SessionStatus.END;
        session.check_out = getDateForSQL();
        session.user_id = user_id;
        const updatedSession = await sessionRepo.update(session.id, session);

        // Tự động tạo hóa đơn (chỉ với vé thường, vé tháng không tính tiền)
        let amount = 0;
        if (card.type !== 'monthly') {
            amount = Invoice.calculateSessionFee(updatedSession.check_in, updatedSession.check_out);
            await invoiceRepo.create({
                amount,
                from: InvoiceSource.SESSION,
                user_id: user_id,
                session_id: updatedSession.id
            });
        }

        // Thêm thông tin số tiền
        const checkout = updatedSession.toModel();
        checkout.amount = amount;

        // Thêm thông tin thẻ tháng nếu có
        if (card.type == CardType.MONTHLY) {
            checkout.info = {
                monthly_user_name: card.monthly_user_name,
                monthly_user_phone: card.monthly_user_phone,
                monthly_user_expiry: card.monthly_user_expiry,
                monthly_user_address: card.monthly_user_address,
            }
        }

        return checkout;
    }
}

export default new SessionService();