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
  static async insertFileDatabase(fileName, filePath, fileType) {
    const user = new fileModel();
    await user.connect();
    const insertQuery = `
      INSERT INTO file_uploads (file_name, file_path, file_type)
      VALUES (?, ?, ?)
    `;
    try {
      const [result] = await user.connection.execute(insertQuery, [
        fileName,
        filePath,
        fileType
      ]);
      // console.log("Thêm file gốc thành công:", result.insertId);
      return result.insertId; // Trả về ID của file đã thêm vào database
    } catch (error) {
      console.error("Lỗi khi thêm file vào database:", error);
      throw error;
    }
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

  // Xử lý file và chuyển đổi sang PDF
  static async processFilesAndConvertPDF(files) {
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
        await fileModel.insertFileDatabase(file.filename, filePath, fileExt);
        // await fileModel.sendFile(filePath);
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
        await fileModel.insertFileDatabase(file.filename, filePath, fileExt);

        const data = fs.readFileSync(filePath, "utf-8");
        const content = data
          .split("\n")
          .map((row) => row.trim())
          .join("\n");

        // Gộp dữ liệu từ tất cả các file .txt
        combinedData += content + "\n\n";
      }

      // Nếu có dữ liệu gộp được, chuyển thành PDF
      if (combinedData) {
        const pdfFilePath = path.join(
          __dirname,
          "../merge",
          "combined_output.txt.pdf" // Tên file PDF đầu ra
        );

        // Chuyển đổi dữ liệu đã gộp thành PDF
        await fileModel.convertTextToPDF(combinedData, pdfFilePath);
      }
    } else {
      console.log("No .txt files to process");
    }

    // Xử lý file .pdf
    if (pdfFiles.length > 0) {
      for (const file of pdfFiles) {
        const filePath = path.join(__dirname, "../uploads", file.filename);
        const fileExt = path.extname(file.filename).toLowerCase();

        await fileModel.insertFileDatabase(file.filename, filePath, fileExt);
        // Thêm file PDF vào merger

        await merger.add(filePath);
      }

      // Tạo file PDF gộp hoàn chỉnh
      const mergedPDFPath = path.join(
        __dirname,
        "../mergepdf",
        "combined_output.pdf"
      );
      await merger.save(mergedPDFPath);
    } else {
      console.log("No .pdf files to process");
    }
    await fileModel.updeteSenFile();
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
    const query = `SELECT * FROM file_uploads;
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
    const query = `SELECT * FROM file_uploads where id =?;
  `;
    try {
      const [rows] = await user.connection.execute(query, [id]);
      return rows; // Trả về tất cả người dùng
    } catch (error) {
      console.error("Không lấy được dữ liệu người dùng:", error);
      throw error;
    } finally {
      await user.closeConnection(); // Đóng kết nối
    }
  }
  // lay mot file
  static async getFilePathById(id) {
    const user = new fileModel();
    await user.connect();
    const query = `SELECT file_path FROM file_uploads where id = ?`;
    try {
      const [rows] = await user.connection.execute(query, [id]);
      // console.log("🚀 ~ fileModel ~ getFilePathById ~ rows:", rows);
      return rows; // Trả về tất cả người dùng
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
    // câu lệnh để lấy ra id file muốn xóa
    const param = "Select file_path ,file_type from file_uploads where id = ?";
    try {
      const [result] = await user.connection.execute(param, [id]);
      // sau khi lấy ra đc xóa trong db luôn
      const query = `DELETE FROM file_uploads WHERE id = ?`;
      try {
        const [results] = await user.connection.execute(query, [id]);
        console.log("File đã được xóa thành công! DB", results.affectedRows);
        // return results.affectedRows; // Trả về số bản ghi đã xóa
      } catch (error) {
        console.error("Lỗi khi xóa người dùng:", error);
        throw error;
      } finally {
        await user.closeConnection(); // Đóng kết nối
      }
      // sau khi xóa trong db xong thì xóa ở ngoài dule PC
      fs.unlink(result[0].file_path, (err) => {
        if (err) {
          console.error("Lỗi khi xóa file:", err);
        } else {
          console.log("File đã được xóa thành công! PC");
        }
      });
      // xóa file ở PC
      // console.log("🚀 ~ fileModel ~ deleteFile ~ result:", result[0].file_path);
      await fileModel.updeteSenFile();
    } catch (error) {
      console.error("Lỗi khi xóa người dùng:", error);
      throw error;
    }
  }
  static async updeteSenFile() {
    const user = new fileModel();
    await user.connect();
    const param = `Select file_path , file_type  from file_uploads where file_type = ".pdf" OR file_type = ".txt" OR file_type = ".xlsx"`;
    try {
      const [result] = await user.connection.execute(param);
      await fileModel.processFiles(result);
    } catch (error) {
      console.error("Lỗi khi xóa người dùng:", error);
      throw error;
    }
  }

  //
  static async sendFile(
    pdfFilePath,
    uploadUrl = `${process.env.URL__AI}/upload`
  ) {
    try {
      // Kiểm tra xem file có tồn tại không
      if (!fs.existsSync(pdfFilePath)) {
        console.error("File không tồn tại:", pdfFilePath);
        return; // Dừng lại nếu file không tồn tại
      }

      // Mở stream file PDF
      const fileStream = fs.createReadStream(pdfFilePath);

      // Tạo đối tượng FormData để gửi file
      const formData = new FormData();

      // Thêm file vào FormData, gửi dưới tên trường 'file' và tên file gốc
      formData.append("file", fileStream);

      // Gửi yêu cầu POST đến API đích
      const response = await axios.post(uploadUrl, formData, {
        headers: {
          ...formData.getHeaders() // Đảm bảo gửi đúng headers cho FormData
        }
      });

      // Trả về response nếu thành công
      console.log("gui file thanh cong", response.data);
      return response.data;
    } catch (error) {
      // Xử lý lỗi nếu có
      console.error("Error uploading file:", error);
      // throw error; // Ném lại lỗi để xử lý ở nơi gọi hàm
    }
  }
  static async updatePDF(files, id) {
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

        await fileModel.insertFileDatabase(file.filename, filePath, fileExt);

        if (fileExt === ".xlsx" || fileExt === ".xls") {
          const workbook = XLSX.readFile(filePath);
          const sheetNames = workbook.SheetNames;

          sheetNames.forEach(async (sheetName) => {
            const sheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(sheet, { defval: "" }); // defval: "" để đảm bảo các ô trống là chuỗi rỗng

            if (data.length > 0) {
              // Tạo đường dẫn PDF cho từng file
              const pdfFilePath = path.join(
                __dirname,
                "../pdf",
                `${file.filename}_output.pdf`
              );

              // Chuyển dữ liệu của từng file thành PDF
              // await fileModel.convertExcelToPDF(data, pdfFilePath);
            }
          });
        }
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
        await fileModel.insertFileDatabase(file.filename, filePath, fileExt);

        const data = fs.readFileSync(filePath, "utf-8");
        const content = data
          .split("\n")
          .map((row) => row.trim())
          .join("\n");

        // Gộp dữ liệu từ tất cả các file .txt
        combinedData += content + "\n\n";
      }

      // Nếu có dữ liệu gộp được, chuyển thành PDF
      if (combinedData) {
        const pdfFilePath = path.join(
          __dirname,
          "../merge",
          "combined_output.txt.pdf" // Tên file PDF đầu ra
        );

        // Chuyển đổi dữ liệu đã gộp thành PDF
        await fileModel.convertTextToPDF(combinedData, pdfFilePath);
      }
    } else {
      console.log("No .txt files to process");
    }

    // Xử lý file .pdf
    if (pdfFiles.length > 0) {
      for (const file of pdfFiles) {
        const filePath = path.join(__dirname, "../uploads", file.filename);
        const fileExt = path.extname(file.filename).toLowerCase();

        await fileModel.updateFileDatabase(
          file.filename,
          filePath,
          fileExt,
          id
        );
        // Thêm file PDF vào merger

        await merger.add(filePath);
      }

      // Tạo file PDF gộp hoàn chỉnh
      const mergedPDFPath = path.join(
        __dirname,
        "../mergepdf",
        "combined_output.pdf"
      );
      await merger.save(mergedPDFPath);
      // await fileModel.sendFile(mergedPDFPath);
      await fileModel.updeteSenFile();
    } else {
      console.log("No .pdf files to process");
    }
  }

  // static async processFiles(filePaths) {
  //   // console.log("🚀 ~ fileModel ~ processFiles ~ filePaths:", filePaths);
  //   try {
  //     let txtFiles = [];
  //     let pdfFiles = [];
  //     let xlsxFiles = [];

  //     // Lọc các file .txt và .pdf
  //     filePaths.forEach((filePath) => {
  //       // console.log("🚀 ~ fileModel ~ filePaths.forEach ~ filePath:", filePath);
  //       const extname = filePath.file_type.toLowerCase();
  //       // console.log("🚀 ~ fileModel ~ filePaths.forEach ~ extname:", extname);
  //       if (extname === ".txt") {
  //         txtFiles.push(filePath.file_path);
  //       } else if (extname === ".pdf") {
  //         pdfFiles.push(filePath.file_path);
  //       } else if (extname === ".xlsx") {
  //         xlsxFiles.push(filePath.file_path);
  //       }
  //     });

  //     let combinedPdfPath = null;

  //     // Xử lý các file .txt (đọc và gộp thành PDF)
  //     if (txtFiles.length > 0) {
  //       let combinedData = ""; // Biến lưu trữ dữ liệu gộp từ tất cả các file .txt

  //       for (const filePath of txtFiles) {
  //         const data = fs.readFileSync(filePath, "utf-8");
  //         const content = data
  //           .split("\n")
  //           .map((row) => row.trim())
  //           .join("\n");
  //         combinedData += content + "\n\n";
  //       }

  //       // Tạo file PDF từ dữ liệu gộp lại
  //       const tempPdfPath = path.join(
  //         __dirname,
  //         "../temp",
  //         "combined_output.txt.pdf"
  //       );
  //       await fileModel.convertTextToPDF(combinedData, tempPdfPath); // Chuyển .txt thành PDF

  //       combinedPdfPath = tempPdfPath; // Đường dẫn file PDF tạm
  //     } else {
  //       console.log("No .txt files to process");
  //     }

  //     // Xử lý các file .pdf (gộp các file PDF lại)
  //     if (pdfFiles.length > 0 || combinedPdfPath) {
  //       let finalPdfPath = null;

  //       if (pdfFiles.length > 0) {
  //         const pdfDoc = await PDFDocument.create(); // Tạo một file PDF mới

  //         //  1. Gộp tất cả các file PDF
  //         for (const filePath of pdfFiles) {
  //           const existingPdfBytes = fs.readFileSync(filePath);
  //           const existingPdf = await PDFDocument.load(existingPdfBytes);
  //           const copiedPages = await pdfDoc.copyPages(
  //             existingPdf,
  //             existingPdf.getPageIndices()
  //           );
  //           copiedPages.forEach((page) => pdfDoc.addPage(page));
  //         }

  //         // 2. Lưu file PDF đã gộp
  //         const mergedPdfPath = path.join(
  //           __dirname,
  //           "../mergepdf",
  //           "combined_output.pdf"
  //         );
  //         const mergedPdfBytes = await pdfDoc.save();
  //         fs.writeFileSync(mergedPdfPath, mergedPdfBytes);

  //         // 3. Nếu có file .txt (đã chuyển thành PDF), gộp vào PDF đã có
  //         if (combinedPdfPath) {
  //           const combinedPdfBytes = fs.readFileSync(combinedPdfPath);
  //           const mergedPdf = await PDFDocument.load(combinedPdfBytes);
  //           const mergedPdfDoc = await PDFDocument.load(mergedPdfBytes);
  //           const copiedPages = await mergedPdfDoc.copyPages(
  //             mergedPdf,
  //             mergedPdf.getPageIndices()
  //           );
  //           copiedPages.forEach((page) => mergedPdfDoc.addPage(page));

  //           // 4. Lưu file PDF cuối cùng
  //           finalPdfPath = path.join(
  //             __dirname,
  //             "../final",
  //             "final_combined_output.pdf"
  //           );
  //           const finalPdfBytes = await mergedPdfDoc.save();
  //           fs.writeFileSync(finalPdfPath, finalPdfBytes);
  //         } else {
  //           finalPdfPath = mergedPdfPath; // Chỉ có file PDF gộp
  //         }
  //       } else if (combinedPdfPath) {
  //         // Nếu không có file PDF nhưng có file TXT chuyển thành PDF
  //         finalPdfPath = combinedPdfPath;
  //       }

  //       // 5. Gửi file PDF cuối cùng nếu có
  //       if (finalPdfPath) {
  //         console.log(" Đang gửi file PDF:", finalPdfPath);
  //         await fileModel.sendFile(finalPdfPath);
  //       } else {
  //         console.log(" Không có file PDF để gửi.");
  //       }
  //     } else {
  //       console.log(" Không có file .pdf hoặc .txt nào để xử lý.");
  //     }

  //     if (xlsxFiles.length > 0) {
  //       console.log("🚀 ~ fileModel ~ processFiles ~ xlsxFiles:", xlsxFiles);
  //       for (const file of xlsxFiles) {
  //         await fileModel.sendFile(file);
  //       }
  //     } else {
  //       console.log("No .xlsx files to process");
  //     }
  //     console.log("Quá trình xử lý hoàn tất!");
  //   } catch (error) {
  //     console.error("Lỗi trong quá trình xử lý file:", error.message);
  //     console.error(error.stack);
  //   }
  // }

  static async processFiles(filePaths) {
    try {
      let txtFiles = [];
      let pdfFiles = [];
      let xlsxFiles = [];

      // Phân loại file theo định dạng
      for (const filePath of filePaths) {
        const extname = filePath.file_type.toLowerCase();
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
