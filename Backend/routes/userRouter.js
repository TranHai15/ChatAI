// Import express và sử dụng Router
import express from "express";
const router = express.Router(); // Tạo đối tượng router

// Import middlewares
import middlewares from "../middlewares/authenticateToken.js";

// Import file controller/userController
import dataUser from "../controllers/userController.js";

// Lấy toàn bộ người dùng
router.get("/", dataUser.getAllUsers);
//  lấy toàn bộ thông báo
router.post("/notifications", dataUser.getAllNotification);

// Lấy lịch sử chat của người dùng
router.post("/chat/", dataUser.getAllChat);
router.get("/nof/", dataUser.getAllNof);
router.get("/oneData/:id", dataUser.getOneChat);
router.post("/historyChat", dataUser.getAllChatByIdRoom);

//
router.post("/addNof", dataUser.addNof);

// Thêm dữ liệu vào database
router.post("/send/", middlewares.verifyToken, dataUser.insertMessageChat);

// Xóa người dùng
router.delete("/delete/:id", middlewares.verifyToken, dataUser.deleteUser);

// Điều hướng bất đăng nhập
// router.get("/lichsu", middlewares.verifyToken);

export default router;
