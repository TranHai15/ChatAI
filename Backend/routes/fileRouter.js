// Import các module cần thiết
import express from "express";
import multer from "multer";
import path from "path";
import fileController from "../controllers/FileController.js";

// Cấu hình lưu trữ với multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Thư mục lưu trữ file
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); // Lấy phần mở rộng (ví dụ: .xlsx)
    const baseName = path.basename(file.originalname, ext); // Lấy tên file gốc

    // Chuyển tên file thành chữ thường và loại bỏ dấu
    const newBaseName = baseName
      .toLowerCase() // Chuyển sang chữ thường
      .normalize("NFD") // Chuyển thành dạng phân tách
      .replace(/[\u0300-\u036f]/g, "") // Loại bỏ các dấu
      .replace(/[^a-z0-9]/g, "-"); // Thay thế ký tự không phải chữ và số bằng dấu gạch ngang

    // Thêm thời gian thực (timestamp) vào cuối tên file
    const timestamp = Date.now();
    const newFileName = `${newBaseName}-${timestamp}${ext}`; // Đặt tên file mới

    cb(null, newFileName); // Đặt tên file mới
  }
});

const upload = multer({ storage: storage });

const router = express.Router();

// Route xử lý file upload và gộp file
router.post(
  "/upload",
  upload.array("files", 10), // Cho phép upload tối đa 10 file
  fileController.uploadAndMergeFiles
);
router.post(
  "/uploadPDF",
  upload.array("files", 10), // Cho phép upload tối đa 10 file
  fileController.uploadsPDF
);

router.get("/", fileController.getFile);

// Endpoint lấy file và trả lại dữ liệu để frontend mở
router.get("/get-file/:id", fileController.getOneFile);

// Route tải xuống file gộp
router.get("/download", fileController.downloadMergedFile);
router.post("/save-file", fileController.saveFile);
router.delete("/delete/:id", fileController.deleteFile);

export default router;
