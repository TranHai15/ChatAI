import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
// import "./redis.js"; // Nếu cần dùng Redis thì bật dòng này

dotenv.config(); // Đọc biến môi trường từ file .env

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Phục vụ các tệp tĩnh trong thư mục img
// app.use("/img", express.static(path.join(path.resolve(), "../img")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// Sử dụng cors
app.use(cookieParser()); // cookie
app.use(
  cors({
    origin: "http://localhost:5173", // Đảm bảo đúng domain của frontend
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true // Quan trọng: cho phép cookie được gửi đi
  })
);

// Sử dụng middleware cho JSON và URL-encoded
app.use(express.json());
app.use(express.urlencoded({ limit: "20mb", extended: true }));

// Import các router
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoter.js"; // Sửa lỗi chính tả ở đây
import dataRouter from "./routes/dataRoutes.js";
import fileRouter from "./routes/fileRouter.js";
import test from "./routes/testRouter.js";

app.get("/", (req, res) => {
  console.log("cookie", req.cookies); // In tất cả các cookies
  res.send("Hello, world!");
});

// Sử dụng authRouter cho các route bắt đầu bằng /auth
app.use("/auth", authRouter);
// Sử dụng userRouter cho các route bắt đầu bằng /user
app.use("/user", userRouter);
// Sử dụng dataRouter cho các route bắt đầu bằng /api
app.use("/api", dataRouter);
// Sử dụng fileRouter cho các route bắt đầu bằng /file
// app.use("/file", fileRouter);
app.use("/file", test);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
