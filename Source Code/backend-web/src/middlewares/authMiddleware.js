const protect = (req, res, next) => {
  if (req.session && req.session.adminId) {
    req.adminId = req.session.adminId;
    next();
  } else {
    return res.status(401).json({
      message: "Truy cập bị từ chối. Vui lòng đăng nhập với tài khoản Admin.",
    });
  }
};

export { protect };
