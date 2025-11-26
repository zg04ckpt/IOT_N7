export const successResponse = (res, message, data = null, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

export const errorResponse = (res, message, code) => {
  return res.status(code).json({
    success: false,
    message: message 
  });
};