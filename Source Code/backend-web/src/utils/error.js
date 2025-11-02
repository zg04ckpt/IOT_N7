class AppError extends Error {
  constructor(message, statusCode) {
    super(message); // Gọi constructor của lớp Error để gán Error.message = message

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";

    this.isOperational = true; // Đánh dấu là lỗi vận hành, không phải lỗi lập trình

    // Bắt lại Stack Trace
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Không tìm thấy tài nguyên.") {
    super(message, 404);
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Dữ liẹue yêu cầu không hợp lệ.") {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Truy cập bị từ chối") {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Bạn không có quyền truy cập") {
    super(message, 403);
  }
}

export default AppError;
