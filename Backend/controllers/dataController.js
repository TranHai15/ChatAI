import User from "../models/User.js";

import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
const dataController = {
  // Xử lý API ChatGPT
  chatGPT: async (req, res) => {
    const { message } = req.body;

    // For testing purpose, returning markdown text
    const test = `
 | Cột 1  Cột 1  | Cột 2 Cột 1   | Cột 3  Cột 1  | Cột 4 Cột 1  | Cột 5 Cột 1   | Cột 6  Cột 1  | Cột 7  Cột 1  | Cột 8 Cột 1  | Cột 9 Cột 1  | Cột 10 Cột 1  | Cột 11 | Cột 12 |
|--------|--------|--------|--------|--------|--------|--------|--------|--------|--------|--------|--------|
| Dữ liệu 1 | Dữ liệu 2 | Dữ liệu 3 | Dữ liệu 4 | Dữ liệu 5 | Dữ liệu 6 | Dữ liệu 7 | Dữ liệu 8 | Dữ liệu 9 | Dữ liệu 10 | Dữ liệu 11 | Dữ liệu 12 |
| Dữ liệu 1 | Dữ liệu 2 | Dữ liệu 3 | Dữ liệu 4 | Dữ liệu 5 | Dữ liệu 6 | Dữ liệu 7 | Dữ liệu 8 | Dữ liệu 9 | Dữ liệu 10 | Dữ liệu 11 | Dữ liệu 12 |
| Dữ liệu 1 | Dữ liệu 2 | Dữ liệu 3 | Dữ liệu 4 | Dữ liệu 5 | Dữ liệu 6 | Dữ liệu 7 | Dữ liệu 8 | Dữ liệu 9 | Dữ liệu 10 | Dữ liệu 11 | Dữ liệu 12 |

    `;

    // Simulate delay and return test markdown content
    setTimeout(() => {
      res.status(200).json({ message: test });
    }, 2000);

    // Uncomment this section when connecting to OpenAI API
    /*
    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: message }],
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
        }
      );

      const reply = response.data.choices[0].message.content;

      res.status(200).json({ success: true, reply });
    } catch (error) {
      console.error("Error:", error);

      if (error.response) {
        res.status(error.response.status).json({
          success: false,
          error: error.response.data.error.message || "Lỗi từ OpenAI API",
        });
      } else if (error.request) {
        res.status(500).json({
          success: false,
          error: "Không thể kết nối tới OpenAI API",
        });
      } else {
        res.status(500).json({
          success: false,
          error: "Đã xảy ra lỗi không xác định",
        });
      }
    }
    */
  },

  // Lấy thông tin số lượng tài khoản và lịch sử trò chuyện
  getNumberAccount: async (req, res) => {
    try {
      const day = req.query.days;

      const numberHistoryChat = await User.getHistoryChat(day);

      res.status(200).json(numberHistoryChat);
    } catch (error) {
      console.error("Error fetching account data:", error);
      res.status(500).json({
        success: false,
        error: "Có lỗi xảy ra khi lấy thông tin tài khoản."
      });
    }
  },
  getDetailChat: async (req, res) => {
    try {
      const day = req.query.days;

      const numberHistoryChat = await User.getInfosUserChatDetail(day);

      res.status(200).json(numberHistoryChat);
    } catch (error) {
      console.error("Error fetching account data:", error);
      res.status(500).json({
        success: false,
        error: "Có lỗi xảy ra khi lấy thông tin tài khoản."
      });
    }
  },
  getInfosUser: async (req, res) => {
    try {
      const id = await req.params.id;
      console.log("🚀 ~ getInfosUser: ~ id:", id);
      const numberHistoryChat = await User.getInfosUser(id);
      res.status(200).json(numberHistoryChat);
    } catch (error) {
      console.error("Error fetching account data:", error);
      res.status(500).json({
        success: false,
        error: "Có lỗi xảy ra khi lấy thông tin tài khoản."
      });
    }
  },
  updateInfosUser: async (req, res) => {
    try {
      const {
        username,
        fullname,
        email,
        password,
        role,
        phong_ban,
        createdAt,
        id
      } = req.body;
      const salt = await bcryptjs.genSalt(10);
      const hashedPassword = await bcryptjs.hash(password, salt);
      const numberHistoryChat = await User.updateUser(
        username,
        fullname,
        email,
        hashedPassword,
        role,
        phong_ban,
        createdAt,
        id
      );
      if (numberHistoryChat > 0) {
        res.status(200).json({ message: "Update thành công" });
      }
    } catch (error) {
      console.error("Error fetching account data:", error);
      res.status(500).json({
        success: false,
        error: "Có lỗi xảy ra khi lấy thông tin tài khoản."
      });
    }
  }
};

export default dataController;
