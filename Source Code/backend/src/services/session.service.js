import { Session, SessionStatus } from "../models/session.model.js";
import cardRepo from "../repositories/card.repo.js";
import sessionRepo from "../repositories/session.repo.js";
import userRepo from "../repositories/user.repo.js";
import invoiceRepo from "../repositories/invoice.repo.js";
import { saveFile } from "../utils/file.util.js";
import { getDateForSQL } from "../utils/time.util.js";
import { Invoice, InvoiceSource } from "../models/invoice.model.js";

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


        const session = await sessionRepo.findByCardIdAndPlate(plate, card.id, SessionStatus.PAKING);
        
        // Nếu session == null => CheckIn
        if (!session) {
            return await this.handleCheckIn(plate, card, image);
        }

        // Nếu session != null => CheckOut
        return await this.handleCheckOut(session, plate, card, image, user_id)
    }

    async handleCheckIn(plate, card, check_in_image) {
        const check_in_image_url = await saveFile(check_in_image);

        const session = await sessionRepo.create({
            card_id: card.id, 
            plate, check_in_image_url, 
            status: SessionStatus.PAKING,
            check_in: getDateForSQL()
        });
        return session.toModel();
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

        // Tự động tạo hóa đơn cho vé lượt
        const amount = Invoice.calculateSessionFee(updatedSession.check_in, updatedSession.check_out);
        await invoiceRepo.create({
            amount,
            from: InvoiceSource.SESSION,
            user_id: user_id,
            session_id: updatedSession.id
        });

        // Thêm thông tin số tiền
        const checkout = updatedSession.toModel();
        checkout.amount = amount;
        return checkout;
    }
}

export default new SessionService();