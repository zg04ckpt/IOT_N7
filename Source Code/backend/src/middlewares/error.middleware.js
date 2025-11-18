import { errorResponse } from "../utils/api.util.js";

const errorMiddleware = (err, req, res, next) => {
    console.error('Error:', err);

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    return errorResponse(res, message, statusCode);
};

export default errorMiddleware;