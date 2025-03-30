import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authController = {
  // Phương thức tạo tài khoản
  registerUser: async (req, res) => {
    const { username, email, password } = req.body.data;

    if (!username || !email || !password) {
      return res.status(400).json("Tên, email và mật khẩu là bắt buộc.");
    }

    try {
      const emailExists = await User.checkEmailExists(email);
      if (emailExists) {
        return res.status(400).json("Email đã được sử dụng.");
      }

      const salt = await bcryptjs.genSalt(10);
      const hashedPassword = await bcryptjs.hash(password, salt);

      const userId = await User.insertUser(username, hashedPassword, email, 2);
      // console.log(userId);
      if (userId) {
        res
          .status(200)
          .json({ message: "Người dùng đã được thêm thành công!", userId });
      } else {
        res.status(500).json("Không thể thêm người dùng.");
      }
    } catch (error) {
      res.status(500).json("Đã xảy ra lỗi.");
    }
  },
  registerUserAdmin: async (req, res) => {
    const { name, username, password, role, phong_ban, oldPassword } = req.body;
    console.log("🚀 ~ registerUserAdmin: ~ oldPassword:", oldPassword);

    if (!password || !username) {
      return res.status(400).json("Tên, và mật khẩu là bắt buộc.");
    }

    try {
      const emailExists = await User.checkEmailExists(username);
      if (emailExists) {
        return res.status(400).json("Tên đã được sử dụng.");
      }

      const salt = await bcryptjs.genSalt(10);
      const hashedPassword = await bcryptjs.hash(password, salt);

      const userId = await User.insertUseradmin(
        name,
        username,
        hashedPassword,
        role,
        phong_ban
      );
      // console.log(userId);
      if (userId) {
        res
          .status(200)
          .json({ message: "Người dùng đã được thêm thành công!", userId });
      } else {
        res.status(500).json("Không thể thêm người dùng.");
      }
    } catch (error) {
      res.status(500).json("Đã xảy ra lỗi.");
    }
  },

  // Tạo access token
  createAccessToken: (user) => {
    return jwt.sign(
      { id: user.id, role_id: user.role_id },
      process.env.JWT_ACCESS_TOKEN,
      { expiresIn: "1h" }
    );
  },

  // Tạo refresh token
  createRefreshToken: (user) => {
    return jwt.sign(
      { id: user.id, role_id: user.role_id },
      process.env.JWT_REFRESH_TOKEN,
      { expiresIn: "365d" }
    );
  },

  // Phương thức đăng nhập
  loginUser: async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        All: "Email và mật khẩu là bắt buộc.",
        email: "",
        password: ""
      });
    }

    try {
      const user = await User.checkEmailExists(username, true);
      if (!user) {
        return res.status(400).json({
          All: "",
          username: "username không tồn tại.",
          password: ""
        });
      }
      const isPasswordValid = await bcryptjs.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          All: "",
          username: "",
          password: "Mật khẩu sai"
        });
      }

      const session = await User.getSessionByUserId(user.id, true);

      let accessToken, refreshToken;

      if (session.length > 0) {
        accessToken = authController.createAccessToken(user);
        refreshToken = session[0].refresh_token;
        const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
        await User.updateSession(user.id, accessToken, refreshToken, expiresAt);
      } else {
        accessToken = authController.createAccessToken(user);
        refreshToken = authController.createRefreshToken(user);
        const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
        await User.insertSession(user.id, accessToken, refreshToken, expiresAt);
      }

      const {
        password: pwd,
        role_id,
        update_at,
        create_at,
        email,
        ...userData
      } = user;

      // console.log({ userData });
      res.status(200).json({
        dataUser: userData,
        accessToken: accessToken,
        refreshToken: refreshToken
      });
    } catch (error) {
      // console.log(error);
      res.status(500).json({ All: "Đã xảy ra lỗi, vui lòng thử lại sau" });
    }
  },

  requestRefreshToken: async (req, res) => {
    const refreshToken = req.body.refreshToken;
    if (!refreshToken) {
      return res
        .status(401)
        .json({ code: "NO_REFRESH_TOKEN", message: "Bạn chưa đăng nhập." });
    }

    try {
      const session = await User.getSessionByUserId(req.body.id, true);
      const tokenExists = session[0]?.refresh_token === refreshToken;
      if (!tokenExists) {
        return res.status(403).json({
          code: "INVALID_REFRESH_TOKEN",
          message: "Token này không phải là của tôi."
        });
      }

      jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_TOKEN,
        async (error, user) => {
          if (error) {
            console.log(error);
            return res.status(403).json({
              code: "REFRESH_TOKEN_EXPIRED",
              message: "Refresh token không hợp lệ hoặc đã hết hạn."
            });
          }

          // Tạo mới AccessToken và RefreshToken
          console.log("user", user);
          const newAccessToken = authController.createAccessToken(user);
          const newRefreshToken = authController.createRefreshToken(user);
          // console.log("🚀 ~ newRefreshToken:", newRefreshToken);

          // Cập nhật RefreshToken mới vào database
          await User.updateRefreshToken(user.id, newRefreshToken);

          res.status(200).json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
          });
        }
      );
    } catch (error) {
      console.error("Lỗi khi refresh token:", error);
      res.status(500).json({
        code: "SERVER_ERROR",
        message: "Đã xảy ra lỗi khi yêu cầu refresh token."
      });
    }
  },

  // Logout
  userLogout: async (req, res) => {
    // console.log(req);
    const { id } = req.body;
    console.log(id);
    await User.deleteSession(id);
    // res.clearCookie("refreshToken");
    res.status(200).json("Đăng xuất thành công.");
  }
};

export default authController;
