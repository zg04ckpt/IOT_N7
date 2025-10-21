import { NotFoundError } from "../utils/error";

const notFound = (req, res, next) => {
  next(new NotFoundError(`Không tìm thấy - ${req.originalUrl}`));
};

const errorHanlder = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Lỗi Server không xác định.";

  if (err.name === "SequelizeUniqueConstraintError") {
    statusCode = 400;
    message = `Dữ liệu bị trùng lặp: ${Object.keys(err.fields)[0]} đã tồn tại.`;
  }

  res.status(statusCode);

  if (process.env.NODE_ENV === "development") {
    res.json({
      status: err.status,
      message: message,
      error: err,
      stack: err.stack,
    });
  } else
    res.json({
      status: err.isOperational ? err.status : "error",
      message: err.isOperational ? message : "Đã xảy ra lỗi nghiêm trọng.",
    });
};

export { notFound, errorHanlder };
