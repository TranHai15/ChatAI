import mysql from "mysql2/promise.js";
import dotenv from "dotenv";
dotenv.config();

const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT } = process.env;

async function connectDatabase() {
  try {
    // Kết nối đến MySQL
    const connection = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME, // Đảm bảo bạn có thêm trường database
      port: DB_PORT,
    });
    console.log("Connected to MySQL");
    return connection; // Trả về đối tượng kết nối
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error; // Ném lỗi để có thể xử lý ở nơi gọi hàm
  }
}

// Xuất hàm ra
export default connectDatabase;
