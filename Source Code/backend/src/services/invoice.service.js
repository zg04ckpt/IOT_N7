import invoiceRepo from "../repositories/invoice.repo.js";
import { Invoice, InvoiceSource } from "../models/invoice.model.js";
import userRepo from "../repositories/user.repo.js";
import sessionRepo from "../repositories/session.repo.js";

class InvoiceService {
  async getAllInvoices(page, size) {
    const invoices = await invoiceRepo.findAll(page, size);
    return invoices.map((invoice) => invoice.toModel());
  }

  async getInvoiceById(id) {
    const invoice = await invoiceRepo.findById(id);
    if (!invoice) throw { statusCode: 404, message: "Hóa đơn không tồn tại" };

    return invoice.toModel();
  }

  async getInvoicesByDateRange(startDate, endDate, page, size) {
    if (!startDate || !endDate)
      throw {
        statusCode: 400,
        message: "Vui lòng cung cấp khoảng thời gian (startDate, endDate)",
      };

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime()))
      throw { statusCode: 400, message: "Định dạng thời gian không hợp lệ" };

    if (start > end)
      throw { statusCode: 400, message: "startDate phải nhỏ hơn endDate" };

    const invoices = await invoiceRepo.findByDateRange(start, end, page, size);
    const stats = await invoiceRepo.getTotalByDateRange(start, end);
    const sourceStats = await invoiceRepo.getStatsBySource(start, end);

    return {
      invoices: invoices.map((invoice) => invoice.toModel()),
      summary: {
        total_amount: parseFloat(stats.total_amount),
        total_count: stats.total_count,
        by_source: sourceStats.map((s) => ({
          source: s.source,
          total_amount: parseFloat(s.total_amount),
          count: s.count,
        })),
      },
    };
  }

  async createSessionInvoice(sessionId, userId) {
    if (!(await userRepo.exists(userId)))
      throw { statusCode: 403, message: "Thông tin nhân viên không hợp lệ" };

    const session = await sessionRepo.findById(sessionId);
    if (!session) throw { statusCode: 404, message: "Session không tồn tại" };

    if (!session.check_in || !session.check_out)
      throw {
        statusCode: 400,
        message: "Session chưa hoàn thành (thiếu check-in hoặc check-out)",
      };

    const amount = Invoice.calculateSessionFee(
      session.check_in,
      session.check_out
    );

    const invoice = await invoiceRepo.create({
      amount,
      from: InvoiceSource.SESSION,
      user_id: userId,
      session_id: sessionId,
    });

    return invoice.toModel();
  }

  async createMonthlyCardInvoice(months, userId) {
    if (!(await userRepo.exists(userId)))
      throw { statusCode: 403, message: "Thông tin nhân viên không hợp lệ" };

    if (!months || months <= 0)
      throw { statusCode: 400, message: "Số tháng phải lớn hơn 0" };

    const amount = Invoice.calculateMonthlyFee(months);

    const invoice = await invoiceRepo.create({
      amount,
      from: InvoiceSource.MONTHLY_CARD,
      user_id: userId,
      session_id: null,
    });

    return invoice.toModel();
  }

  async deleteInvoice(id) {
    if (!(await invoiceRepo.exists(id)))
      throw { statusCode: 404, message: "Hóa đơn không tồn tại" };

    if (!(await invoiceRepo.delete(id)))
      throw { statusCode: 500, message: "Xóa hóa đơn thất bại" };
  }

  async getInvoiceBySessionId(sessionId) {
    const invoice = await invoiceRepo.findBySessionId(sessionId);
    if (!invoice) {
      // Trả về null nếu không có invoice (session chưa checkout hoặc chưa có invoice)
      return null;
    }
    return invoice.toModel();
  }
}

export default new InvoiceService();
