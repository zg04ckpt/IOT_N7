import { Sequelize } from "sequelize";
import "dotenv/config";

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT,
    logging: false, // Tắt ghi nhật ký các câu lệnh SQL thực hiện ra console
  }
);

const connectDB = async () => {
  try {
    // Cố gắng thiết lập kết nối tới cơ sở dưx liệu MYSQL
    await sequelize.authenticate();
    console.log("MYSQL connected.");
  } catch (error) {
    console.error("Unable to connect to DB:", error.message);
    // Dừng ứng dụng và thoát ra với mã lỗi 1
    process.exit(1);
  }
};

export { sequelize, connectDB };
