import XLSX from "xlsx";
import puppeteer from "puppeteer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import connectDatabase from "../db.js";
import axios from "axios";
import FormData from "form-data";
import PDFMerger from "pdf-merger-js";
const merger = new PDFMerger();
// const { PDFDocument } = require("pdf-lib"); // Thư viện để làm việc với PDF
import { PDFDocument } from "pdf-lib";

// Convert import.meta.url to a filesystem path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class fileModel {
  constructor() {
    this.connection = null;
  }

  // Kết nối với cơ sở dữ liệu khi tạo đối tượng User
  async connect() {
    if (!this.connection) {
      this.connection = await connectDatabase();
      console.log("Database connected");
    }
  }

  // Đóng kết nối với cơ sở dữ liệu
  async closeConnection() {
    if (this.connection) {
      await this.connection.end();
      this.connection = null;
      console.log("Database connection closed");
    }
  }
  // Thêm file vào cơ sở dữ liệu
  static async insertFileDatabase(
    file_id,
    filePath,
    file_type,
    uploaded_by,
    version_number = 1,
    uploaded_at = new Date().toISOString().slice(0, 19).replace("T", " "),
    is_active = 1
  ) {
    // console.log("🚀 ~ fileModel ~ file_id:", file_id);
    // console.log("🚀 ~ fileModel ~ filePath:", filePath);
    // console.log("🚀 ~ fileModel ~ file_type:", file_type);
    // console.log("🚀 ~ fileModel ~ uploaded_by:", uploaded_by);
    // console.log("🚀 ~ fileModel ~ version_number:", version_number);
    // console.log("🚀 ~ fileModel ~ uploaded_at:", uploaded_at);
    // console.log("🚀 ~ fileModel ~  is_active :", is_active);
    const user = new fileModel();
    await user.connect();

    const insertQuery = `
    INSERT INTO file_versions (file_id, file_path, file_type, version_number, uploaded_by, uploaded_at, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

    try {
      const [result] = await user.connection.execute(insertQuery, [
        file_id,
        filePath,
        file_type,
        version_number,
        uploaded_by,
        uploaded_at,
        is_active
      ]);
      return result.insertId;
    } catch (error) {
      console.error("Lỗi khi thêm file vào database:", error);
      throw error;
    }
  }
  // console.log("🚀 ~ fileModel ~ version_number:", version_number)

  static async insertFiles(fileName, fileType) {
    const user = new fileModel();
    await user.connect();
    const insertQuery = `
      INSERT INTO files (file_name, fileType,statusFile,created_at)
      VALUES (?, ?,?,?)
    `;
    try {
      const created_at = new Date()
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");
      const statusFile = 1;
      const [result] = await user.connection.execute(insertQuery, [
        fileName,
        fileType,
        statusFile,
        created_at
      ]);
      return result.insertId;
    } catch (error) {
      console.error("Lỗi khi thêm file vào database:", error);
      throw error;
    }
  }

  static async InsertOneDB(file, id, idUser, count) {
    const filePath = path.join(__dirname, "../uploads", file.filename);
    const fileExt = path.extname(file.filename).toLowerCase();
    const sl = Number(count) + 1;
    const is_active = 0;
    const uploaded_at = new Date().toISOString().slice(0, 19).replace("T", " ");
    await fileModel.insertFileDatabase(
      id,
      filePath,
      fileExt,
      idUser,
      sl,
      uploaded_at,
      is_active
    );
    await fileModel.GetFileANDSenFile();
  }

  static async updateFileDatabase(fileName, filePath, fileType, id) {
    const user = new fileModel();
    await user.connect();

    const updateQuery = `
    UPDATE file_uploads
    SET file_name = ?, file_path = ?, file_type = ? 
    WHERE id = ?
  `;

    try {
      const [result] = await user.connection.execute(updateQuery, [
        fileName,
        filePath,
        fileType,
        id
      ]);

      // console.log("Cập nhật file thành công:", result.affectedRows); // Logs how many rows were updated

      if (result.affectedRows > 0) {
        return id; // Return the ID of the updated record
      } else {
        throw new Error("No rows were updated. Make sure the ID exists.");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật file vào database:", error);
      throw error;
    }
  }

  static async insertFilesANDFiles(fileName, filePath, fileType, id) {
    const idNew = await fileModel.insertFiles(fileName, fileType);
    await fileModel.insertFileDatabase(idNew, filePath, fileType, id);
  }

  static async updateFileOne(fileId, activeId) {
    const user = new fileModel();
    await user.connect();

    try {
      await user.connection.beginTransaction();

      // Cập nhật tất cả is_active về 0
      const updateAllQuery = `UPDATE file_versions SET is_active = 0 WHERE file_id = ?`;
      await user.connection.execute(updateAllQuery, [fileId]);
      console.log(`Đã cập nhật is_active = 0 cho file_id ${fileId}`);

      // Cập nhật is_active = 1 cho bản ghi cần kích hoạt
      const updateOneQuery = `UPDATE file_versions SET is_active = 1 WHERE id = ?`;
      const [updateOneResult] = await user.connection.execute(updateOneQuery, [
        activeId
      ]);

      if (updateOneResult.affectedRows === 0) {
        throw new Error(`Không tìm thấy file_version với id ${activeId}`);
      }

      console.log(`Đã kích hoạt phiên bản có id ${activeId}`);
      await user.connection.commit();
      await fileModel.GetFileANDSenFile();
    } catch (error) {
      await user.connection.rollback();
      console.error("Lỗi cập nhật:", error.message);
    } finally {
      await user.connection.end();
    }
  }

  // Xử lý file và chuyển đổi sang PDF
  static async processFilesAndConvertPDF(files, id) {
    let txtFiles = [];
    let xlsxFiles = [];
    let pdfFiles = [];

    // Phân loại file vào các mảng tương ứng (txt, xlsx, pdf)
    files.forEach((file) => {
      const fileExt = path.extname(file.filename).toLowerCase();
      if (fileExt === ".txt") {
        txtFiles.push(file);
      } else if (fileExt === ".xlsx" || fileExt === ".xls") {
        xlsxFiles.push(file);
      } else if (fileExt === ".pdf") {
        pdfFiles.push(file);
      }
    });

    // Xử lý file .xlsx và .xls
    if (xlsxFiles.length > 0) {
      for (const file of xlsxFiles) {
        const filePath = path.join(__dirname, "../uploads", file.filename);
        const fileExt = path.extname(file.filename).toLowerCase();
        await fileModel.insertFilesANDFiles(
          file.filename,
          filePath,
          fileExt,
          id
        );
      }
    } else {
      console.log("No .xlsx files to process");
    }

    // Xử lý file .txt
    if (txtFiles.length > 0) {
      let combinedData = ""; // Biến lưu trữ dữ liệu gộp từ tất cả các file .txt
      for (const file of txtFiles) {
        const filePath = path.join(__dirname, "../uploads", file.filename);
        const fileExt = path.extname(file.filename).toLowerCase();
        await fileModel.insertFilesANDFiles(
          file.filename,
          filePath,
          fileExt,
          id
        );
      }
    } else {
      console.log("No .txt files to process");
    }

    // Xử lý file .pdf
    if (pdfFiles.length > 0) {
      for (const file of pdfFiles) {
        const filePath = path.join(__dirname, "../uploads", file.filename);
        const fileExt = path.extname(file.filename).toLowerCase();
        await fileModel.insertFilesANDFiles(
          file.filename,
          filePath,
          fileExt,
          id
        );
      }
    } else {
      console.log("No .pdf files to process");
    }
    await fileModel.GetFileANDSenFile();
  }

  // Chuyển đổi dữ liệu Excel thành PDF
  static async convertExcelToPDF(fileData, pdfOutputPath) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Tạo nội dung HTML từ dữ liệu Excel dạng bảng
    let htmlContent = "<html><body>";

    // Tạo bảng với tiêu đề
    htmlContent += "<h2>Dữ liệu từ file Excel</h2>";

    // Tạo bảng HTML
    htmlContent +=
      "<table border='1' style='border-collapse: collapse; width: 100%;'>";

    // Lấy danh sách các keys từ row đầu tiên để tạo header
    const headers = Object.keys(fileData[0]);

    // Tạo header cho bảng
    htmlContent += "<thead><tr>";
    headers.forEach((header) => {
      htmlContent += `<th style='padding: 5px;'>${header}</th>`;
    });
    htmlContent += "</tr></thead>";

    // Tạo dữ liệu cho bảng
    htmlContent += "<tbody>";
    fileData.forEach((row) => {
      htmlContent += "<tr>";
      headers.forEach((header) => {
        htmlContent += `<td style='padding: 5px;'>${row[header] || "N/A"}</td>`; // Hiển thị giá trị mỗi cột
      });
      htmlContent += "</tr>";
    });
    htmlContent += "</tbody>";

    htmlContent += "</table>";
    htmlContent += "</body></html>";

    await page.setContent(htmlContent);

    // Tạo file PDF từ nội dung HTML đã định dạng
    await page.pdf({
      path: pdfOutputPath,
      format: "A4",
      printBackground: true
    });
    // console.log(
    //   "🚀 ~ fileModel ~ convertExcelToPDF ~ pdfOutputPath:",
    //   pdfOutputPath
    // );
    // await fileModel.sendFile(pdfOutputPath);
    await browser.close();
  }

  // Chuyển đổi nội dung văn bản thành PDF
  static async convertTextToPDF(textContent, pdfOutputPath) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const htmlContent = `<html><body><pre>${textContent}</pre></body></html>`;
    await page.setContent(htmlContent);

    await page.pdf({
      path: pdfOutputPath,
      format: "A4",
      printBackground: true
    });
    // await fileModel.sendFile(pdfOutputPath);
    await browser.close();
  }
  // Lấy toàn bộ file
  static async getAllFiles() {
    const user = new fileModel();
    await user.connect();
    const query = `SELECT 
    f.id, 
    f.file_name, 
    f.fileType, 
    f.created_at, 
    f.statusFile,
    COUNT(v.id) AS version_count, 
    u.username
    FROM files f
    LEFT JOIN file_versions v ON f.id = v.file_id 
    LEFT JOIN account u ON v.uploaded_by = u.id
    GROUP BY f.id, f.file_name, f.fileType, f.created_at, u.username;
;
  `;
    try {
      const [rows] = await user.connection.execute(query);
      return rows; // Trả về tất cả người dùng
    } catch (error) {
      console.error("Không lấy được dữ liệu người dùng:", error);
      throw error;
    } finally {
      await user.closeConnection(); // Đóng kết nối
    }
  }
  // lay mot file
  static async getOneFiles(id) {
    const user = new fileModel();
    await user.connect();
    const query = `SELECT fv.* , f.file_name , u.username
                    FROM file_versions fv
                    JOIN files f ON f.id=fv.file_id
                    JOIN account u ON u.id = fv.uploaded_by
                    WHERE file_id = ?;
  `;
    try {
      const [rows] = await user.connection.execute(query, [id]);
      return rows;
    } catch (error) {
      console.error("Không lấy được dữ liệu người dùng:", error);
      throw error;
    } finally {
      await user.closeConnection(); // Đóng kết nối
    }
  }
  // xoa file
  static async deleteFile(id) {
    const user = new fileModel();
    await user.connect();
    const param =
      "Select file_path ,file_type, id from file_versions where file_id = ?";
    try {
      const [result] = await user.connection.execute(param, [id]);
      console.log("🚀 ~ fileModel ~ deleteFile ~ result:", result);
      result.forEach(async (element, index) => {
        const query = `UPDATE file_versions SET is_active= 0 WHERE id=?`;
        try {
          const [results] = await user.connection.execute(query, [element.id]);
          console.log("File đã được An thành công! DB", index);
        } catch (error) {
          console.error("Lỗi khi An người dùng:", error);
          throw error;
        } finally {
          await user.closeConnection(); // Đóng kết nối
        }
      });
      const params = `UPDATE files SET statusFile= 0 WHERE id= ?`;
      try {
        const [res] = await user.connection.execute(params, [id]);
        // console.log("🚀 ~ fileModel ~ deleteFile ~ res:", res);
      } catch (error) {
        console.error("Lỗi khi xóa người dùng:", error);
        throw error;
      } finally {
        await user.closeConnection(); // Đóng kết nối
      }

      await fileModel.GetFileANDSenFile();
    } catch (error) {
      console.error("Lỗi khi xóa người dùng:", error);
      throw error;
    }
  }
  static async restFile(id) {
    const user = new fileModel();
    await user.connect();

    const param =
      "SELECT file_path, file_type, id FROM file_versions WHERE file_id = ?";
    try {
      const [result] = await user.connection.execute(param, [id]);

      for (let index = 0; index < result.length; index++) {
        const element = result[index];

        // Nếu là file cuối cùng, đặt is_active = 1, còn lại = 0
        const isActive = index === result.length - 1 ? 1 : 0;
        const query = `UPDATE file_versions SET is_active = ? WHERE id = ?`;
        try {
          await user.connection.execute(query, [isActive, element.id]);
          // console.log(
          //   `File ID: ${element.id} cập nhật is_active = ${isActive}`
          // );
        } catch (error) {
          console.error("Lỗi khi cập nhật is_active:", error);
          throw error;
        }
      }

      // Sau khi cập nhật xong, đổi statusFile = 1
      const params = `UPDATE files SET statusFile = 1 WHERE id = ?`;
      try {
        await user.connection.execute(params, [id]);
        console.log("Cập nhật statusFile = 1 thành công!");
      } catch (error) {
        console.error("Lỗi khi cập nhật statusFile:", error);
        throw error;
      }

      // Đóng kết nối sau khi hoàn tất
      await user.closeConnection();

      // Gọi hàm gửi file sau khi hoàn tất
      await fileModel.GetFileANDSenFile();
    } catch (error) {
      console.error("Lỗi khi xử lý file:", error);
      throw error;
    }
  }

  static async deleteFiles(id) {
    const user = new fileModel();
    await user.connect();
    const param =
      "Select file_path ,file_type, id from file_versions where id = ?";
    try {
      const [result] = await user.connection.execute(param, [id]);
      console.log("🚀 ~ fileModel ~ deleteFiles ~ result:", result);
      result.forEach(async (element, index) => {
        const query = `DELETE FROM file_versions WHERE id = ?`;
        try {
          const [results] = await user.connection.execute(query, [element.id]);
          console.log("File đã được xóa thành công! DB", index);
        } catch (error) {
          console.error("Lỗi khi xóa người dùng:", error);
          throw error;
        } finally {
          await user.closeConnection(); // Đóng kết nối
        }
        // sau khi xóa trong db xong thì xóa ở ngoài  PC
        fs.unlink(element.file_path, (err) => {
          if (err) {
            console.error("Lỗi khi xóa file:", err);
          } else {
            console.log("File đã được xóa thành công! PC");
          }
        });
      });
      await fileModel.GetFileANDSenFile();
    } catch (error) {
      console.error("Lỗi khi xóa người dùng:", error);
      throw error;
    }
  }
  static async GetFileANDSenFile() {
    const user = new fileModel();
    await user.connect();
    const param = `Select file_path , file_type  from file_versions where is_active = 1`;
    try {
      const [result] = await user.connection.execute(param);
      // console.log("🚀 ~ fileModel ~ GetFileANDSenFile ~ result:", result);
      await fileModel.processFiles(result);
    } catch (error) {
      console.error("Lỗi khi xóa người dùng:", error);
      throw error;
    }
  }

  static async processFiles(filePaths) {
    try {
      let txtFiles = [];
      let pdfFiles = [];
      let xlsxFiles = [];

      // Phân loại file theo định dạng
      for (const filePath of filePaths) {
        // console.log("🚀 ~ fileModel ~ processFiles ~ filePath:", filePath);
        const extname = filePath.file_type.toLowerCase();
        // console.log(
        //   "🚀 ~ fileModel ~ processFiles ~ filePath.file_type:",
        //   filePath.file_type
        // );
        // console.log("🚀 ~ fileModel ~ processFiles ~ extname:", extname);
        if (extname === ".txt") {
          txtFiles.push(filePath.file_path);
        } else if (extname === ".pdf") {
          pdfFiles.push(filePath.file_path);
        } else if (extname === ".xlsx") {
          xlsxFiles.push(filePath.file_path);
        }
      }

      let combinedPdfPath = null;

      // Xử lý file .txt → chuyển thành PDF
      if (txtFiles.length > 0) {
        let combinedData = "";

        for (const filePath of txtFiles) {
          const data = await fs.promises.readFile(filePath, "utf-8");
          combinedData += data.trim() + "\n\n";
        }

        const tempPdfPath = path.join(__dirname, "../temp", "combined_txt.pdf");
        await fileModel.convertTextToPDF(combinedData, tempPdfPath);
        combinedPdfPath = tempPdfPath;
      }

      let finalPdfPath = null;

      // Gộp file PDF nếu có
      if (pdfFiles.length > 0 || combinedPdfPath) {
        const pdfDoc = await PDFDocument.create();

        // Gộp các file PDF đầu vào
        for (const filePath of pdfFiles) {
          const existingPdfBytes = await fs.promises.readFile(filePath);
          const existingPdf = await PDFDocument.load(existingPdfBytes);
          const copiedPages = await pdfDoc.copyPages(
            existingPdf,
            existingPdf.getPageIndices()
          );
          copiedPages.forEach((page) => pdfDoc.addPage(page));
        }

        // Nếu có file TXT đã chuyển thành PDF, gộp vào
        if (combinedPdfPath) {
          const combinedPdfBytes = await fs.promises.readFile(combinedPdfPath);
          const combinedPdf = await PDFDocument.load(combinedPdfBytes);
          const copiedPages = await pdfDoc.copyPages(
            combinedPdf,
            combinedPdf.getPageIndices()
          );
          copiedPages.forEach((page) => pdfDoc.addPage(page));
        }

        // Lưu file PDF cuối cùng
        finalPdfPath = path.join(__dirname, "../final", "final_combined.pdf");
        const finalPdfBytes = await pdfDoc.save();
        await fs.promises.writeFile(finalPdfPath, finalPdfBytes);
      } else if (combinedPdfPath) {
        finalPdfPath = combinedPdfPath;
      }

      // Tạo formData để gửi file
      const formData = new FormData();

      if (finalPdfPath) {
        formData.append("file", fs.createReadStream(finalPdfPath));
      }

      for (const filePath of xlsxFiles) {
        formData.append("file", fs.createReadStream(filePath));
      }

      // Kiểm tra kích thước formData trước khi gửi
      const formDataLength = await new Promise((resolve, reject) => {
        formData.getLength((err, length) => {
          if (err) reject(err);
          resolve(length);
        });
      });

      if (formDataLength > 0) {
        await fileModel.sendFiles(formData);
      } else {
        console.log("Không có file nào để gửi.");
      }

      console.log("Quá trình xử lý hoàn tất!");
    } catch (error) {
      console.error("Lỗi trong quá trình xử lý file:", error.message);
      console.error(error.stack);
    }
  }

  static async sendFiles(formData) {
    try {
      const response = await axios.post(
        `${process.env.URL__AI}/upload`,
        formData,
        {
          headers: {
            ...formData.getHeaders() // Lấy headers của FormData
          }
        }
      );

      console.log("📤 File gửi thành công!", response.data);
    } catch (error) {
      console.error("❌ Lỗi khi gửi file:", error.message);
    }
  }
}

export default fileModel;
