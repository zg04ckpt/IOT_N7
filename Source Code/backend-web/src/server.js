import express from "express";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";
import session from "express-session";
import MySQLStore from "express-mysql-session";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { notFound, errorHandler } from "./middlewares/errorMiddleware.js";
import userRoutes from "./routes/user.routes.js";
import parkingSessionRoutes from "./routes/parkingSession.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import cardRoutes from "./routes/card.routes.js";
import deviceRoutes from "./routes/device.routes.js";
import userInfoRoutes from "./routes/userInfo.routes.js";
import checkInRoutes from "./routes/check-in.routes.js";
import checkOutRoutes from "./routes/checkout.routes.js";
import monthlyCardRoutes from "./routes/monthlyCard.routes.js";
import viewReportRoutes from "./routes/viewReports.routes.js";
import searchRoutes from "./routes/searches.routes.js";
import authRoutes from "./routes/auth.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Global middleware

app.use(
  cors({
    origin: "*",
    credentials: true, // Cho phép gửi cookie/session
  })
);

// ✅ Serve static files từ thư mục data
app.use('/data', express.static('data'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const generalLimiiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Thời gian được lấy làm mốc để request
  max: 100, // Giới hạn mỗi IP là 100 request
  standardHeaders: true, // gửi các header theo tiêu chuẩn IETF Draft về giới hạn tốc độ
  legacyHeaders: false, // ngăn ko cho gửi các header giới hạn tốc độ cũ, đã từng là tiêu chuẩn không chính thức
});

app.use(generalLimiiter);

// Config session
const MySQLStoreSession = MySQLStore(session);

const sessionStore = new MySQLStoreSession({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  checkExpirationInterval: 900000, // Thời gian kiểm tra lại xem session hết hạn chưa
  expiration: 86400000, // Thời gian session hết hạn
  clearExpired: true,
  endConnectionOnClose: true,
});

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false, // Không lưu lại session nếu không có thay đổi
    saveUninitialized: false, // Không tạo session nếu chưa được sửa đổi
    cookie: {
      secure: process.env.NODE_ENV === "production", // Dùng HTTPS trong production
      httpOnly: true, // Ngăn chặn truy cập cookie bằng JS client-side
      maxAge: 86400000, // Hết hạn cookie sau 1 ngày
    },
  })
);

// ErrorHandler Middleware

// Mount routers (keep server.js minimal)
//  Auth routes (login/logout)
app.use('/api/auth', authRoutes);

app.use('/', userRoutes);
app.use('/api/check-in', checkInRoutes); //  Check-in route
app.use('/api/manage-sessions', parkingSessionRoutes); // manage sessions check-in
app.use('/api/admins', adminRoutes);
app.use('/api/manage-cards', cardRoutes);
app.use('/api/manage-devices', deviceRoutes);
app.use('/api/user-infos', userInfoRoutes);
app.use('/api/checkout', checkOutRoutes);
app.use('/api/monthly-cards', monthlyCardRoutes);
app.use('/api/view-reports', viewReportRoutes);
app.use('/api', searchRoutes); 
// Xử lý route không tồn tại
app.use(notFound);

// Xử lý lỗi toàn cục xảy ra trong controller hoặc middleware khác
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server đang chạy ở http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Lỗi khi khởi động server:", error.message);
    process.exit(1);
  }
};

startServer();
