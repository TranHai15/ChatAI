import express from "express";
import multer from "multer";
import path from "path";

const router = express.Router();
import middlewares from "../middlewares/authenticateToken.js";

// Import file controller/userController
import dataUser from "../controllers/userController.js";

// Lấy toàn bộ người dùng
router.get("/", dataUser.getAllUsers);

router.get("/", dataUser.getAllUsers);

export default router;
