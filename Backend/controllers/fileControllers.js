import path from "path";
import fs from "fs";

import fileModel from "../models/Files.js";

const fileController = {
  // Xử lý việc tải file lên và gộp file
  uploadAndMergeFiles: async (req, res) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).send({ message: "No files uploaded" });
    }

    const id = req.headers["ms"];
    try {
      const mergedFilePath = await fileModel.processFilesAndConvertPDF(
        req.files,
        id
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
  insertOne: async (req, res) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).send({ message: "No files uploaded" });
    }
    try {
      const idUser = req.headers["ms"];
      const mergedFilePath = await fileModel.InsertOneDB(
        req.files[0],
        req.body.id,
        idUser,
        req.body.countFile
      );
      console.log(mergedFilePath);
      res.send({
        message: "Files uploaded and merged successfully",
        mergedFile: mergedFilePath
      });
      //   // await fileModel.updeteSenFile();
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .send({ message: "Error while merging files", error: error.message });
    }
  },

  // Tải file gộp về
  downloadMergedFile: (req, res) => {
    const { file_path, file_type } = req.body;
    // console.log("Received file path:", file_path);
    // console.log("🚀 ~ file_type:", file_type);

    // Kiểm tra nếu file tồn tại
    const resolvedFilePath = path.resolve(file_path);

    if (fs.existsSync(resolvedFilePath)) {
      // Xác định Content-Type dựa trên định dạng file
      let contentType = "application/octet-stream"; // Mặc định là binary stream

      if (file_type === ".pdf") {
        contentType = "application/pdf";
      } else if (file_type === ".xlsx") {
        contentType =
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      } else if (file_type === ".txt") {
        contentType = "text/plain";
      }

      res.setHeader("Content-Type", contentType); // Thiết lập Content-Type
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${path.basename(resolvedFilePath)}"`
      ); // Tên file tải xuống

      // Gửi file cho client
      res.download(resolvedFilePath, (err) => {
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
    // console.log("🚀 ~ getOneFile: ~ fileId:", fileId);

    const results = await fileModel.getOneFiles(fileId);

    if (results) {
      return res.status(200).json(results);
    }
    return res.status(400).send("Unsupported file type");
  },
  deleteFile: async (req, res) => {
    try {
      const idUser = req.params.id; // Lấy id từ req.params thay vì req.body
      //   console.log("🚀 ~ deleteFile: ~ idUser:", idUser);
      if (!idUser) {
        return res.status(400).json("ID người dùng là bắt buộc."); // Kiểm tra ID
      }

      const deleteCount = await fileModel.deleteFile(idUser); // Gọi hàm delete

      // if (deleteCount > 0) {
      return res
        .status(200)
        .json({ message: "Ẩn thành công", deletedCount: deleteCount });
      // } else {
      //   return res.status(404).json("Không tìm thấy người dùng để xóa.");
      // }
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Lỗi xóa người dùng", error: error.message });
    }
  },
  resetFile: async (req, res) => {
    try {
      const idUser = req.params.id; // Lấy id từ req.params thay vì req.body
      //   console.log("🚀 ~ deleteFile: ~ idUser:", idUser);
      if (!idUser) {
        return res.status(400).json("ID người dùng là bắt buộc."); // Kiểm tra ID
      }

      const deleteCount = await fileModel.restFile(idUser); // Gọi hàm delete

      // if (deleteCount > 0) {
      return res
        .status(200)
        .json({ message: "Ẩn thành công", deletedCount: deleteCount });
      // } else {
      //   return res.status(404).json("Không tìm thấy người dùng để xóa.");
      // }
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Lỗi xóa người dùng", error: error.message });
    }
  },
  deleteFiles: async (req, res) => {
    try {
      const idUser = req.params.id;
      console.log("🚀 ~ deleteFile: ~ idUser:", idUser);
      if (!idUser) {
        return res.status(400).json("ID người dùng là bắt buộc."); // Kiểm tra ID
      }

      const deleteCount = await fileModel.deleteFiles(idUser); // Gọi hàm delete

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
  updateCheck: async (req, res) => {
    try {
      const id = req.body.id;
      const idFile = req.body.fileDetailsID;
      //   console.log("🚀 ~ updateCheck: ~ idFile:", idFile);
      //   console.log("🚀 ~ updateCheck: ~ id:", id);

      const mergedFilePath = await fileModel.updateFileOne(idFile, id);

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
