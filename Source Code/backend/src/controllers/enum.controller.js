import { successResponse } from '../utils/api.util.js';
import Role from '../models/role.model.js';
import { CardType } from '../models/card.model.js';
import { SessionStatus } from '../models/session.model.js';
import { InvoiceSource, PricingConfig } from '../models/invoice.model.js';
import { BoardType, DeviceStatus } from '../models/device.model.js';

class EnumController {
    async getRoles(req, res, next) {
        try {
            return successResponse(res, '', Role);
        } catch (error) {
            next(error);
        }
    }

    async getCardTypes(req, res, next) {
        try {
            return successResponse(res, '', CardType);
        } catch (error) {
            next(error);
        }
    }

    async getSessionStatuses(req, res, next) {
        try {
            return successResponse(res, '', SessionStatus);
        } catch (error) {
            next(error);
        }
    }

    async getInvoiceSources(req, res, next) {
        try {
            return successResponse(res, '', InvoiceSource);
        } catch (error) {
            next(error);
        }
    }

    async getPricingConfig(req, res, next) {
        try {
            return successResponse(res, '', PricingConfig);
        } catch (error) {
            next(error);
        }
    }

    async getBoardTypes(req, res, next) {
        try {
            return successResponse(res, '', BoardType);
        } catch (error) {
            next(error);
        }
    }

    async getDeviceStatuses(req, res, next) {
        try {
            return successResponse(res, '', DeviceStatus);
        } catch (error) {
            next(error);
        }
    }

    async getAllEnums(req, res, next) {
        try {
            const enums = {
                roles: Role,
                cardTypes: CardType,
                sessionStatuses: SessionStatus,
                invoiceSources: InvoiceSource,
                pricingConfig: PricingConfig,
                boardTypes: BoardType,
                deviceStatuses: DeviceStatus
            };
            return successResponse(res, '', enums);
        } catch (error) {
            next(error);
        }
    }
}

export default new EnumController();
