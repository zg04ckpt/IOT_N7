import { SessionStatus } from "../models/session.model.js";
import sessionService from "../services/session.service.js";
import { successResponse } from "../utils/api.util.js";

class SessionController {
    async getAll(req, res, next) {
        try {
            const sessions = await sessionService.getAllSessions(req.query.page, req.query.size);
            return successResponse(res, '', sessions)
        } catch (error) {
            next(error);
        }
    }

    async check(req, res, next) {
        try {
            const image = req.file;
            const session = await sessionService.check(
                req.body.plate,
                req.body.card_uid,
                image,
                req.user.id
            );
            return successResponse(
                res, 
                session.status == SessionStatus.PAKING? 'Checkin thành công':'Checkout thành công', 
                session, 
                session.status == SessionStatus.PAKING? 201:200);
        } catch (error) {
            next(error);
        }
    }
}

export default new SessionController();