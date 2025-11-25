import invoiceService from "../services/invoice.service.js";
import { successResponse } from "../utils/api.util.js";

class InvoiceController {
  async getAll(req, res, next) {
    try {
      const { page = 1, size = 10 } = req.query;
      const invoices = await invoiceService.getAllInvoices(page, size);
      return successResponse(res, "", invoices);
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const invoice = await invoiceService.getInvoiceById(req.params.id);
      return successResponse(res, "", invoice);
    } catch (error) {
      next(error);
    }
  }

  async getByDateRange(req, res, next) {
    try {
      const { startDate, endDate, page = 1, size = 10 } = req.query;
      const result = await invoiceService.getInvoicesByDateRange(
        startDate,
        endDate,
        page,
        size
      );
      return successResponse(res, "", result);
    } catch (error) {
      next(error);
    }
  }

  async getBySessionId(req, res, next) {
    try {
      const { sessionId } = req.params;
      const invoice = await invoiceService.getInvoiceBySessionId(sessionId);
      if (!invoice) {
        return successResponse(
          res,
          "Không tìm thấy hóa đơn cho session này",
          null
        );
      }
      return successResponse(res, "", invoice);
    } catch (error) {
      next(error);
    }
  }
}

export default new InvoiceController();
