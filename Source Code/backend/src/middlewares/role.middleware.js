import { errorResponse } from "../utils/api.util.js";

const roleMiddleware = (...requiredRoles) => {
  if (Array.isArray(requiredRoles[0])) {
    requiredRoles = requiredRoles[0];
  }

  return (req, res, next) => {
    const userRole = req.user?.role;

    if (!userRole || !requiredRoles.includes(userRole)) {
      return errorResponse(res, "Không có quyền truy cập", 403);
    }

    next();
  };
};

export default roleMiddleware;