import jwt from "jsonwebtoken";
const middlewares = {
  // Kiểm tra trạng thái đăng nhập
  verifyToken: (req, res, next) => {
    const token = req.headers.authorization;

    if (token) {
      const accessToken = token.split(" ")[1]; // Lấy token từ "Bearer <token>"

      jwt.verify(accessToken, process.env.JWT_ACCESS_TOKEN, (error, user) => {
        if (error) {
          if (error.name === "TokenExpiredError") {
            // console.log("message", error);
            return res.status(401).json({
              message: "Token đã hết hạn.",
              errorCode: "TOKEN_EXPIRED",
            });
          } else if (error.name === "JsonWebTokenError") {
            // console.log("message", error);
            return res.status(401).json({
              message: "Token không hợp lệ.",
              errorCode: "INVALID_TOKEN",
            });
          } else if (error.name === "NotBeforeError") {
            return res.status(401).json({
              message: "Token chưa có hiệu lực.",
              errorCode: "TOKEN_NOT_ACTIVE",
            });
          } else {
            return res.status(400).json({
              message: "Lỗi xác thực token.",
              error: error.message,
            });
          }
        }

        req.user = user; // Token hợp lệ, gán user vào req
        next();
      });
    } else {
      return res.status(401).json({
        message: "Bạn chưa đăng nhập.",
        errorCode: "NO_TOKEN",
      });
    }
  },

  // Kiểm tra xem người dùng có phải là admin hay không
  verifyTokenAdmin: (req, res, next) => {
    middlewares.verifyToken(req, res, () => {
      if (req.user && req.user.role === 1) {
        next(); // Tiếp tục nếu là admin
      } else {
        return res.status(403).json({
          message: "Bạn không có quyền truy cập.",
          errorCode: "NOT_ADMIN",
        });
      }
    });
  },
};

export default middlewares;
