import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Spreadsheet from "react-spreadsheet";
const ViewFile = () => {
  const path = useLocation();

  const pathName = path.pathname;
  const idpath = path.search.split("=");
  const catpat = pathName.split("/");
  const id = idpath[1];
  const Namefile = catpat[3];

  const [spreadsheetData, setSpreadsheetData] = useState([]);
  const [type, setType] = useState("xlsx");

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
        // console.log("🚀 ~ fetchFile ~ fileBlob:", fileBlob);
        const data = fileBlob.content;
        console.log("🚀 ~ fetchFile ~ data:", data);
        setType(fileBlob.type);
        if (fileBlob.type === "xlsx") {
          const formattedData = convertDataToSpreadsheetFormat(data);
          setSpreadsheetData(formattedData);
        } else if (fileBlob.type === "txt") {
          setSpreadsheetData(data);
        } else if (fileBlob.type === "pdf") {
          const fileName = data.split("\\").pop();
          // console.log("🚀 ~ fetchFile ~ fileName:", fileName);
          const fileUrl = `http://localhost:3000/uploads/${fileName}`;
          window.location.href = fileUrl;
        }
      } catch (error) {
        console.error("Error fetching or processing file:", error);
      }
    };

    fetchFile();
  }, []);

  // console.log("message", type);

  // console.log("spreadsheetData", spreadsheetData);
  return (
    <div className="max-w-screen-xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center my-3">
        {Namefile && Namefile}
      </h1>

      {type === "txt" ? (
        <textarea
          className="w-full h-[30rem] p-4 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring focus:ring-blue-300"
          value={spreadsheetData}
          placeholder="Loading text data or no data available..."
          disabled
        ></textarea>
      ) : spreadsheetData.length > 0 ? (
        <div className="overflow-auto bg-white rounded-lg shadow-lg border border-gray-200">
          <Spreadsheet
            data={spreadsheetData}
            onChange={setSpreadsheetData}
            className="w-full text-sm"
          />
        </div>
      ) : (
        <p className="text-gray-500 text-center">Loading...</p>
      )}

      <div className="flex justify-center mt-6 fixed right-3 bottom-4"></div>
    </div>
  );
};

export default ViewFile;
