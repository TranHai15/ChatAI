// Import các module cần thiết
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import fileController from "../controllers/fileControllers.js";

// Đảm bảo thư mục "uploads" tồn tại
const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình lưu trữ với multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Thư mục lưu trữ file
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);

    // Chuyển tên file thành chữ thường và loại bỏ dấu
    const newBaseName = baseName
      .toLowerCase() // Chuyển sang chữ thường
      .normalize("NFD") // Chuyển thành dạng phân tách
      .replace(/[\u0300-\u036f]/g, "") // Loại bỏ các dấu
      .replace(/[^a-z0-9]/g, "-"); // Thay thế ký tự không phải chữ và số bằng dấu gạch ngang

    // Thêm thời gian thực (timestamp) vào cuối tên file
    const timestamp = Date.now();
    const newFileName = `${newBaseName}-${timestamp}${ext}`; // Đặt tên file mới

    cb(null, newFileName);
  }
});

// Hàm fileFilter để chỉ cho phép file .xlsx, .pdf, .txt
const fileFilter = (req, file, cb) => {
  const allowedExtensions = [".xlsx", ".pdf", ".txt"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Chỉ cho phép file xlsx, pdf và txt!"), false);
  }
};

// Khởi tạo multer với storage và fileFilter
const upload = multer({ storage: storage, fileFilter: fileFilter });

const router = express.Router();

// Route xử lý file upload và gộp file
router.post(
  "/upload",
  upload.array("files", 10), // Cho phép upload tối đa 10 file
  fileController.uploadAndMergeFiles
);

router.post("/uploadONE", upload.array("files", 1), fileController.insertOne);

router.get("/", fileController.getFile);

// Endpoint lấy file và trả lại dữ liệu để frontend mở
router.get("/get-file/:id", fileController.getOneFile);

// Route tải xuống file gộp
router.post("/download", fileController.downloadMergedFile);
router.post("/updateCheck", fileController.updateCheck);
router.delete("/deletes/:id", fileController.deleteFile);
router.get("/reset/:id", fileController.resetFile);
router.delete("/delete/:id", fileController.deleteFiles);

export default router;
