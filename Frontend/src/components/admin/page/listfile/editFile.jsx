import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Spreadsheet from "react-spreadsheet";

const EditFile = () => {
  const [spreadsheetData, setSpreadsheetData] = useState([]);
  const [type, setType] = useState("xlsx");
  const [isSaving, setIsSaving] = useState(false);
  const [files, setFiles] = useState([]); // For handling multiple file uploads
  const path = useLocation();

  const pathName = path.pathname;
  const idpath = path.search.split("=");
  const catpat = pathName.split("/");
  const id = idpath[1];
  // console.log("🚀 ~ EditFile ~ id:", id);
  const Namefile = catpat[3];

  const convertDataToSpreadsheetFormat = (data) => {
    if (!data || data.length === 0) return [];
    const headers = Object.keys(data[0]);
    const rows = data.map((row) =>
      headers.map((header) => ({ value: row[header] || "" }))
    );

    const formattedData = [
      headers.map((header) => ({ value: header })), // Tiêu đề
      ...rows
    ];

    return formattedData;
  };

  const convertSpreadsheetToJson = (spreadsheet) => {
    if (!spreadsheet || spreadsheet.length <= 1) return [];
    const headers = spreadsheet[0].map((cell) => cell.value);
    const rows = spreadsheet.slice(1);
    const json = rows.map((row) => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index]?.value || null;
      });
      return obj;
    });
    return json;
  };

  useEffect(() => {
    const fetchFile = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/file/get-file/${id}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch file");
        }
        const fileBlob = await response.json();
        const data = fileBlob.content;
        setType(fileBlob.type);

        // Use if-else to handle file type
        if (fileBlob.type === "xlsx") {
          const formattedData = convertDataToSpreadsheetFormat(data);
          setSpreadsheetData(formattedData);
        } else if (fileBlob.type === "txt") {
          setSpreadsheetData(data);
        } else if (fileBlob.type === "pdf") {
          setFiles([]);
        }
      } catch (error) {
        console.error("Error fetching or processing file:", error);
      }
    };

    fetchFile();
  }, [id]);

  const handleChange = (e) => {
    setSpreadsheetData(e.target.value); // Update state with new content
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
  };

  const handleSubmitFile = async () => {
    if (files.length === 0) {
      alert("Vui lòng chọn ít nhất một tệp để tải lên!");
      return;
    }

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    // Lấy id từ URL query string

    if (!id) {
      alert("Không có ID để gửi!");
      return;
    }

    formData.append("id", id);
    try {
      const response = await fetch("http://localhost:3000/file/uploadPDF", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        throw new Error("Failed to upload files");
      }

      const data = await response.json();
      alert("Tải lên tệp thành công!");
    } catch (error) {
      console.error("Error uploading files:", error);
      alert("Đã xảy ra lỗi trong quá trình tải lên.");
    }
  };

  const saveDataToDatabase = async () => {
    try {
      setIsSaving(true);
      let jsonData = "";
      if (type === "txt") {
        jsonData = JSON.stringify(spreadsheetData);
      } else {
        jsonData = convertSpreadsheetToJson(spreadsheetData);
      }

      const payload = {
        fileId: id,
        type: type,
        data: jsonData // New data
      };

      const response = await fetch(`http://localhost:3000/file/save-file`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Failed to save data");
      }

      alert("Dữ liệu đã được lưu thành công!");
    } catch (error) {
      console.error("Error saving data:", error);
      alert("Lưu dữ liệu thất bại. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-screen-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 text-center">
        {Namefile && type === "pdf"
          ? "Ban dang sua file " + Namefile
          : Namefile}
      </h1>

      {/* Conditionally render content based on file type */}
      {type === "txt" ? (
        <textarea
          className="w-full h-[30rem] p-4 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring focus:ring-blue-300"
          value={spreadsheetData}
          onChange={handleChange}
          placeholder="Loading text data or no data available..."
        ></textarea>
      ) : type === "xlsx" ? (
        spreadsheetData.length > 0 ? (
          <div className="overflow-auto bg-white rounded-lg shadow-lg border border-gray-200">
            <Spreadsheet
              data={spreadsheetData}
              onChange={setSpreadsheetData}
              className="w-full text-sm"
            />
          </div>
        ) : (
          <p className="text-gray-500 text-center">Loading...</p>
        )
      ) : type === "pdf" ? (
        <div className="text-center">
          <p className="mb-4">Chọn các tệp PDF để tải lên:</p>
          <input
            type="file"
            accept="application/pdf"
            multiple={false}
            onChange={handleFileChange}
            className="border p-2 rounded-md"
          />
          {files.length > 0 && (
            <div className="mt-4">
              <p>Tệp đã chọn:</p>
              <ul>
                {files.map((file, index) => (
                  <li key={index}>{file.name}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <p className="text-gray-500 text-center">
          File type not supported or loading...
        </p>
      )}

      <div className="flex justify-center mt-6 fixed right-3 bottom-4"></div>

      <div className="flex justify-center mt-6 fixed right-3 bottom-4">
        {type == "xlsx" || type == "txt" ? (
          <button
            className={`px-6 py-3 font-semibold rounded-lg ${
              isSaving
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
            onClick={saveDataToDatabase}
            disabled={isSaving}
          >
            {isSaving ? (
              <div className="flex items-center">
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.963 7.963 0 014 12H0c0 2.314.786 4.429 2.091 6.125l2.909-2.834z"
                  ></path>
                </svg>
                Đang lưu...
              </div>
            ) : (
              "Lưu dữ liệu"
            )}
          </button>
        ) : (
          ""
        )}

        {type === "pdf" && (
          <button
            onClick={handleSubmitFile}
            className="ml-4 px-6 py-3 font-semibold rounded-lg bg-green-500 text-white hover:bg-green-600"
          >
            Tải lên tệp
          </button>
        )}
      </div>
    </div>
  );
};

export default EditFile;
