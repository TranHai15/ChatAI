import path from "path";
import fs from "fs";
import XLSX from "xlsx";

import fileModel from "../models/File.js";

const fileController = {
  // Xử lý việc tải file lên và gộp file
  uploadAndMergeFiles: async (req, res) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).send({ message: "No files uploaded" });
    }
    try {
      const mergedFilePath = await fileModel.processFilesAndConvertPDF(
        req.files
      );
      res.send({
        message: "Files uploaded and merged successfully",
        mergedFile: mergedFilePath
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .send({ message: "Error while merging files", error: error.message });
    }
  },

  // Tải file gộp về
  downloadMergedFile: (req, res) => {
    const filePath = path.join(__dirname, "../uploads", "merged_data.pdf");

    // Kiểm tra nếu file tồn tại
    if (fs.existsSync(filePath)) {
      res.download(filePath, "merged_data.pdf", (err) => {
        if (err) {
          console.error("Error downloading the file", err);
          res.status(500).send("Error downloading the file");
        }
      });
    } else {
      res.status(404).send("File not found");
    }
  },
  getFile: async (req, res) => {
    try {
      const dataFile = await fileModel.getAllFiles();
      res.status(200).json(dataFile);
    } catch (error) {
      console.log(error);
    }
  },
  getOneFile: async (req, res) => {
    const fileId = await req.params.id;
    console.log("🚀 ~ getOneFile: ~ fileId:", fileId);

    const results = await fileModel.getOneFiles(fileId);
    // console.log("🚀 ~ getOneFile: ~ results:", results);
    // Truy vấn thông tin file từ cơ sở dữ liệu

    const file = results[0];
    const filePath = file.file_path;
    // console.log("🚀 ~ getOneFile: ~ filePath:", filePath);

    // Nếu là file Excel, đọc và trả về dữ liệu cho frontend
    if (file.file_type === ".xlsx") {
      const workbook = XLSX.readFile(filePath);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet);
      return res.json({ type: "xlsx", content: jsonData });
    }

    // // Nếu là file TXT, đọc và trả lại nội dung cho frontend
    if (file.file_type === ".txt") {
      const fileContent = fs.readFileSync(filePath, "utf-8");
      return res.json({ type: "txt", content: fileContent });
    }
    if (file.file_type === ".pdf") {
      return res.json({ type: "pdf", content: filePath });
    }

    // Nếu không phải loại file hỗ trợ, trả lỗi
    return res.status(400).send("Unsupported file type");
  },
  saveFile: async (req, res) => {
    try {
      const { fileId, type, data } = req.body;

      // Lấy đường dẫn file dựa trên fileId
      const filePa = await fileModel.getFilePathById(fileId);
      // console.log("🚀 ~ saveFile: ~ filePa:", filePa);
      const filePath = filePa[0].file_path;
      if (!filePath || typeof filePath !== "string") {
        return res.status(404).json({ message: "Invalid file path" });
      }

      const absolutePath = path.resolve(filePath);
      if (type === "txt") {
        let formattedData;
        if (typeof data === "string") {
          // console.log("string");
          // console.log("Trước khi thay thế:", JSON.stringify(data));

          formattedData = data.replace(/\\n/g, "/\n").replace(/\\t/g, "");
        } else if (typeof data === "object") {
          // Nếu là object, giả sử object chứa chuỗi JSON hoặc SQL
          if (data.payload && typeof data.payload === "string") {
            formattedData = data.payload
              .replace(/\n/g, "<br>")
              .replace(/\t/g, "<br>")
              .replace(/VALUES/g, "<br>")
              .replace(/\),/g, "),\n");
          } else {
            // console.log("oject");
            // Nếu không, chuyển thành chuỗi JSON đẹp
            formattedData = JSON.stringify(data, null, 2);
          }
        } else {
          // console.log("kihac");
          // Nếu là dữ liệu dạng khác, chuyển sang chuỗi
          formattedData = String(data);
        }
        formattedData = formattedData.replace(/\//g, "").replace(/^"|"$/g, "");
        // console.log("dulieusau", formattedData);

        fs.writeFile(absolutePath, formattedData, "utf8", (err) => {
          if (err) {
            console.error("Error writing file:", err);
            return res.status(500).json({ message: "Failed to save file" });
          }
          // ddd
          res.status(200).json({ message: "File saved successfully!" });
        });
      } else {
        // Chuyển đổi dữ liệu JSON thành bảng
        const worksheet = XLSX.utils.json_to_sheet(data); // chuyển đổi JSON thành sheet
        const workbook = XLSX.utils.book_new(); // tạo workbook mới
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1"); // thêm sheet vào workbook

        // Ghi workbook vào file Excel
        XLSX.writeFile(workbook, absolutePath); // lưu vào file với đường dẫn xác định
        res.status(200).json({ message: "Luu file thanh cong" });
      }
      await fileModel.updeteSenFile();
    } catch (error) {
      console.error("Error saving file:", error);
      res.status(500).json({ message: "Failed to update file" });
    }
  },
  deleteFile: async (req, res) => {
    try {
      const idUser = req.params.id; // Lấy id từ req.params thay vì req.body
      console.log("🚀 ~ deleteFile: ~ idUser:", idUser);
      if (!idUser) {
        return res.status(400).json("ID người dùng là bắt buộc."); // Kiểm tra ID
      }

      const deleteCount = await fileModel.deleteFile(idUser); // Gọi hàm delete

      // if (deleteCount > 0) {
      return res
        .status(200)
        .json({ message: "Xóa thành công", deletedCount: deleteCount });
      // } else {
      //   return res.status(404).json("Không tìm thấy người dùng để xóa.");
      // }
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Lỗi xóa người dùng", error: error.message });
    }
  },
  uploadsPDF: async (req, res) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).send({ message: "No files uploaded" });
    }

    try {
      const id = req.body.id;
      const mergedFilePath = await fileModel.updatePDF(req.files, id);
      console.log(mergedFilePath);
      res.send({
        message: "Files uploaded and merged successfully",
        mergedFile: mergedFilePath
      });
      // await fileModel.updeteSenFile();
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .send({ message: "Error while merging files", error: error.message });
    }
  }
};

export default fileController;
