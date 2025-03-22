// # Route CRUD dữ liệu
// import express và sử dụng Router
import express from "express";
const router = express.Router(); // Tạo đối tượng router

// import middlewares
import middlewares from "../middlewares/authenticateToken.js";

// import file controller/authController
import dataController from "../controllers/dataController.js";

router.post("/chat", dataController.chatGPT);
router.get("/dashboard", dataController.getNumberAccount);
router.get("/userView/:id", dataController.getInfosUser);
router.post("/editUser", dataController.updateInfosUser);
router.get("/getDetailChat", dataController.getDetailChat);

export default router;
