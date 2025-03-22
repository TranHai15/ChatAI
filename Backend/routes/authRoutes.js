import express from "express";
const router = express.Router();

// import middlewares
import middlewares from "../middlewares/authenticateToken.js";

// import controller
import authController from "../controllers/authController.js";

// Định nghĩa route đăng ký người dùng
router.post("/register", authController.registerUser);

// Định nghĩa route đăng nhập
router.post("/login", authController.loginUser);

// Định nghĩa route để refresh token
router.post("/refresh", authController.requestRefreshToken);

// Định nghĩa route để logout
router.post("/logout", middlewares.verifyToken, authController.userLogout);

export default router;
