import express from "express";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
