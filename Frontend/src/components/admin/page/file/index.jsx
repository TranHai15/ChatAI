import { useState, useEffect } from "react";
import axiosClient from "../../../../api/axiosClient";
import { showNotification } from "../../../../func";
import LoadingBee from "../../../loading";
import DownloadAllFiles from "../../../../func/doawload";

// Component hiển thị danh sách file
const FileList = () => {
  const [files, setFiles] = useState([]); // file cha
  const [filesgoc, setFilesgoc] = useState([]); // file cha
  const [isSaving, setIsSaving] = useState(false); // trạng thái load khi upload
  const [fileDetails, setFileDetails] = useState(null); // Dữ liệu chi tiết của file khi nhấn "View"
  const [fileDetailsID, setFileDetailsID] = useState(null); // Dữ liệu chi tiết của file khi nhấn "View"
  const [file, setFile] = useState(null); // Trạng thái của file
  const [uploadStatus, setUploadStatus] = useState("idle");
  const [verdun, setVerdun] = useState(null);
  const [showDetails, setShowDetails] = useState(false); // Trạng thái hiển thị bảng chi tiết
  const [showDetailsFile, setShowDetailsFile] = useState(false); // Trạng thái hiển thị bảng chi tiết
  const [filesAdd, setFilesAdd] = useState([]);
  const [fileType, setFileType] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Lấy dữ liệu từ backend
  useEffect(() => {
    fetchFiles();
  }, []);
  const fetchFiles = async () => {
    try {
      const response = await axiosClient.get("/file"); // API để lấy danh sách file
      const dataNew = response.data.filter((e) => e.statusFile !== 0);

      setFilesgoc(response.data);
      setFiles(dataNew); // Gán dữ liệu file vào state
    } catch (error) {
      console.error("Error fetching files", error);
    }
  };
  const fetchFileDetails = async (fileId) => {
    try {
      const response = await axiosClient.get(`/file/get-file/${fileId}`);
      setFileDetails(response.data);
      // console.log("🚀 ~ fetchFileDetails ~ response.data:", response.data);
      setShowDetails(true);
    } catch (error) {
      console.error("Error fetching file details", error);
    }
  };
  // Xử lý xem file
  const handleViewFile = (file_id, count, path) => {
    fetchFileDetails(file_id);
    setFileDetailsID(file_id);
    setVerdun(count);
    setFileType((e) => [...e, path]);
  };
  const handleImport = () => {
    // console.log("🚀 ~ handleImport ~ fileId:", fileId);
    document.getElementById("fileInput").click();
  };
  const handleFileChangeOne = (e) => {
    setFileType((e) => [e[0]]);
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const extension = selectedFile.name.split(".").pop();
      setFileType((e) => [...e, "." + extension]);
      setUploadStatus("waiting");
    }
  };
  // Xử lý xóa file
  const handleDeleteFile = async (fileId) => {
    if (confirm("Ban có muốn xóa file không ??????????")) {
      try {
        await axiosClient.delete(`/file/delete/${fileId}`); // API xóa file
        setFiles(files.filter((file) => file.id !== fileId)); // Xóa file khỏi state
        fetchFiles();
        showNotification("Xóa file thành công");
      } catch (error) {
        console.error("Error deleting file", error);
        alert("Failed to delete file");
      }
    }
    return;
  };

  // Hàm xử lý khi chọn file
  // const handleFileChange = (e) => {
  //   setFilesAdd(e.target.files); // Lưu trữ các file người dùng chọn
  // };
  const handleFileChange = (event) => {
    const newFiles = Array.from(event.target.files);
    setFilesAdd((prevFiles) => [...prevFiles, ...newFiles]);
  };

  const handleRemoveFile = (index) => {
    const newFiles = [...filesAdd];
    newFiles.splice(index, 1);
    setFilesAdd(newFiles);
  };
  // Hàm gửi file lên backend
  const handleUpload = async () => {
    if (!filesAdd || filesAdd.length === 0) {
      // alert("Please select at least one file to upload.");
      showNotification("Vui Lòng chọn ít nhất 1 file", "warning");
      return;
    }

    const formData = new FormData();
    setIsSaving(true);
    // Thêm từng file vào FormData
    Array.from(filesAdd).forEach((file) => {
      formData.append("files", file); // Thêm mỗi file với key là 'files'
    });
    try {
      const response = await axiosClient.post("/file/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      // Kiểm tra phản hồi từ server
      if (response.status == 200 || response.status == 201) {
        setIsSaving(false);
        // alert(response.data.message || "Files uploaded successfully");
        showNotification("Thêm file thành công");
        setFilesAdd([]);
        fetchFiles(); // Gọi hàm cập nhật danh sách file
      } else {
        alert(response.data.message || "File upload failed, please try again.");
      }
    } catch (error) {
      console.error("Error uploading files:", error);
    }
  };
  function formatDate(dateString) {
    // Cắt phần '000Z' và thay 'T' bằng khoảng trắng
    const formattedDate = dateString.replace("T", " ").slice(0, -5);
    return formattedDate;
  }
  const closeDetails = () => {
    fetchFiles();
    setShowDetails(false);
    setFileDetails(null);
    setFile(null);
    setFileType([]);
  };

  const handleDownload = async (filePath, fileType) => {
    try {
      // Gọi API để tải file
      const response = await axiosClient.post(
        "/file/download",
        { file_path: filePath, file_type: fileType },
        {
          responseType: "blob" // Quan trọng: Đảm bảo file trả về dưới dạng binary data (blob)
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));

      // Tạo tên file động dựa trên file_type
      const fileName = filePath.split("/").pop(); // Lấy tên file từ đường dẫn
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName; // Dùng tên file thực tế thay vì "file.pdf"
      document.body.appendChild(a);
      a.click();

      // Xóa URL tạm thời sau khi tải xong
      window.URL.revokeObjectURL(url);
      showNotification("Download file thành công");
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };
  const handleUploadONE = async () => {
    if (file) {
      const one = fileType[0];
      const trues = fileType[1];
      if (one == trues) {
        setUploadStatus("uploading"); // Đang tải lên
        const formData = new FormData();
        formData.append("files", file);
        formData.append("id", fileDetailsID);
        formData.append("countFile", verdun);
        try {
          const response = await axiosClient.post("/file/uploadONE", formData, {
            headers: {
              "Content-Type": "multipart/form-data"
            }
          });

          // Kiểm tra phản hồi từ server
          if (response.status == 200 || response.status == 201) {
            // setIsSaving(false);
            // alert(response.data.message || "Files uploaded successfully");
            fetchFileDetails(fileDetailsID);
            showNotification("Đã Upload file thành công");
            setUploadStatus("s");
            setFile(null); // Đã tải lên
          } else {
            setUploadStatus("idle");
          }
        } catch (error) {
          setUploadStatus("idle"); // Nếu có lỗi, quay lại trạng thái ban đầu
          console.error("Error uploading file:", error);
        }
      } else {
        alert("Không đúng vs định dạng file ban đầu hãy chọn lại");
        handleImport();
      }
    }
  };
  const handleDeleteOne = async (id, activeId) => {
    if (activeId == 1) {
      showNotification(
        "File Này Đang Được Chọn Vui Lòng Select File Khác rồi xóa",
        "error"
      );
      return;
    }
    if (confirm("Ban có muốn xóa không??????????")) {
      try {
        await axiosClient.delete(`/file/deletes/${id}`); // API xóa file
        setFileDetails(files.filter((file) => file.id !== id)); // Xóa file khỏi state
        fetchFileDetails(fileDetailsID);
        showNotification("Xóa file thành công");
      } catch (error) {
        console.error("Error deleting file", error);
        alert("Failed to delete file");
      }
    }
    return;
  };
  const handleCheck = async (id, check) => {
    if (check == 1) {
      showNotification("File này đang được chọn rồi", "error");
    } else {
      if (confirm("Ban có muốn thay đổi ????")) {
        try {
          await axiosClient.post(`/file/updateCheck`, {
            id: id,
            fileDetailsID: fileDetailsID
          }); // API xóa file
          // Xóa file khỏi state
          fetchFileDetails(fileDetailsID);
          showNotification("Chọn file thành công");
        } catch (error) {
          console.error("Error deleting file", error);
          alert("Failed to delete file");
        }
      }
    }
    return;
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = files.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="container mx-auto p-4 relative min-h-screen ">
      <h1 className="text-2xl font-semibold text-center mb-6">Quản Lý File</h1>
      {isSaving ? (
        <LoadingBee />
      ) : (
        <div>
          <DownloadAllFiles />
          <div className="flex justify-end w-full">
            <div className="flex flex-col items-center space-y-4 ml-auto w-full ">
              <div className="relative w-full flex justify-end">
                <input
                  type="file"
                  id="filesCha"
                  onChange={handleFileChange}
                  multiple
                  className="absolute inset-0 opacity-0 cursor-pointer w-min"
                />
                <button
                  className=" text-black flex gap-4 bg-green-300 py-3 px-6 rounded-md  hover:bg-green-600"
                  onClick={() => document.getElementById("filesCha").click()}
                >
                  {filesAdd.length !== 0 ? "Thêm Files" : "Chọn Files"}
                  <img
                    className="w-5"
                    src="../../../src/assets/fileimport.svg"
                  />
                </button>
              </div>

              {/* Danh sách file đã chọn */}
              {filesAdd.length !== 0 && (
                <div className="space-y-2 w-full bg-slate-200 p-2">
                  {filesAdd.map((file, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center bg-gray-100 p-2 rounded-md shadow-md"
                    >
                      <span className="truncate">{file.name}</span>
                      <button
                        className="text-red-500 hover:text-red-600"
                        onClick={() => handleRemoveFile(index)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Nút Gửi */}
              {filesAdd.length !== 0 && (
                <button
                  onClick={handleUpload}
                  className={`w-full py-3 px-6 rounded-md ${
                    isSaving
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                  disabled={isSaving}
                >
                  <div>{isSaving ? "Xử Lý" : "Tải Lên"}</div>
                </button>
              )}
            </div>
          </div>
          <input
            id="fileInput"
            type="file"
            style={{ display: "none" }}
            onChange={handleFileChangeOne}
          />
          <table className="min-w-full table-auto border-collapse border border-gray-300 mt-6">
            <thead>
              <tr>
                <th className="border px-4 py-2">Tên File</th>
                <th className="border px-4 py-2">Dạng File</th>
                <th className="border px-4 py-2">Số Phiên Bản</th>
                <th className="border px-4 py-2">Người Thao tác</th>
                <th className="border px-4 py-2">Ngày </th>
                <th className="border px-4 py-2 flex gap-2">
                  <span> Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((file) => (
                <tr key={file.id}>
                  <td className="border px-4 py-2">{file.file_name}</td>
                  <td className="border px-4 py-2">{file.fileType}</td>
                  <td className="border px-4 py-2"> {file.version_count}</td>
                  <td className="border px-4 py-2">{file.fullname}</td>
                  <td className="border px-4 py-2">
                    {formatDate(file.created_at)}
                  </td>
                  {/* Cột ngày cập nhật */}
                  <td className="border px-4 py-2 flex space-x-2">
                    <>
                      <button
                        onClick={() =>
                          handleViewFile(
                            file.id,
                            file.version_count,
                            file.fileType
                          )
                        }
                        className="py-1 px-3 rounded hover:bg-blue-600 "
                      >
                        <img
                          className="w-5"
                          src="../../../../src/assets/view.svg"
                        />
                      </button>
                      <button
                        onClick={() => handleDeleteFile(file.id)}
                        className=" text-white py-1 px-3 rounded hover:bg-red-600"
                      >
                        <img
                          className="w-4"
                          src="../../../../src/assets/anfile.svg"
                        />
                      </button>
                    </>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/*  */}
          {showDetails && fileDetails && (
            <div className="absolute  bg-gray-600 bg-opacity-50 left-0 bottom-0 right-0 top-0 z-50">
              <div className="flex justify-center items-center h-full">
                <div className="bg-white p-6 rounded-lg shadow-lg max-w-6xl w-full relative ">
                  <h3 className="text-xl font-semibold mb-4">Chi Tiết File</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full table-auto border-collapse border border-gray-300 mt-6">
                      <thead>
                        <tr>
                          <th className="border px-4 py-2">Phiên Bản </th>
                          <th className="border px-4 py-2">Tên File</th>
                          <th className="border px-4 py-2">Người Làm</th>
                          <th className="border px-4 py-2">Ngày </th>
                          <th className="border px-4 py-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {fileDetails.map((file) => (
                          <tr key={file.id}>
                            <td className="border px-4 py-2">
                              {file.version_number}
                            </td>
                            <td className="border px-4 py-2">
                              {file.file_name}
                            </td>
                            <td className="border px-4 py-2">
                              {file.fullname}
                            </td>
                            <td className="border px-4 py-2">
                              {new Date(file.uploaded_at).toLocaleString()}
                            </td>
                            <td className="flex gap-2">
                              <button
                                onClick={() =>
                                  handleDownload(file.file_path, file.file_type)
                                }
                                className="bg-green-500 text-white py-1 px-3 rounded hover:bg-green-600"
                              >
                                <img
                                  className="w-4"
                                  src="../../../../src/assets/download.svg"
                                />
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteOne(file.id, file.is_active)
                                }
                                className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600"
                              >
                                <img
                                  className="w-4"
                                  src="../../../../src/assets/delete.svg"
                                />
                              </button>
                              <button
                                onClick={() =>
                                  handleCheck(file.id, file.is_active)
                                }
                                className={`py-1 px-3 rounded hover:bg-red-600 ${
                                  file.is_active == 1
                                    ? "bg-blue-500"
                                    : "bg-blue-100"
                                }`}
                              >
                                <img
                                  className="w-4"
                                  src="../../../../src/assets/check.svg"
                                />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <button
                    onClick={closeDetails}
                    className=" text-red-300 py-2 px-4  hover:bg-red-500 rounded absolute top-0 right-5 mt-4"
                  >
                    <img
                      className="w-8 h-6 rounded-md p-1  bg-red-500"
                      src="../../../../src/assets/coles.svg"
                    />
                  </button>
                  <div className="flex justify-end">
                    <div>
                      {file && uploadStatus === "waiting" && (
                        <div className="flex justify-end items-center gap-5">
                          <p>File đã chọn: {file.name}</p>
                          <div className="flex items-center gap-5">
                            <button
                              onClick={handleUploadONE}
                              className="bg-green-200 text-white py-2 px-4 rounded   hover:bg-green-500 mt-4 flex gap-2 items-center"
                            >
                              <span className="font-extrabold text-black">
                                Tải lên
                              </span>
                              <img
                                className="w-3"
                                src="../../../../src/assets/cloud.svg"
                              />
                            </button>
                            <button
                              onClick={() => handleImport(fileDetailsID)}
                              className="bg-green-200 text-white py-2 px-4 rounded   hover:bg-green-500 mt-4 flex gap-2 items-center "
                            >
                              <span className="font-extrabold text-black">
                                {" "}
                                Chọn Lại
                              </span>
                              <img
                                className="w-3"
                                src="../../../../src/assets/save.svg"
                              />
                            </button>
                          </div>
                        </div>
                      )}

                      {uploadStatus === "uploading" && <p>Đang tải lên...</p>}
                      {uploadStatus === "uploaded" && (
                        <p>File đã được tải lên!</p>
                      )}
                    </div>
                    {!file && (
                      <button
                        onClick={() => handleImport(fileDetailsID)}
                        className="bg-green-200 text-white py-2 px-4 rounded   hover:bg-green-500 mt-4 flex gap-2 items-center "
                      >
                        <span className="font-extrabold text-black">
                          {" "}
                          Import
                        </span>
                        <img
                          className="w-3"
                          src="../../../../src/assets/save.svg"
                        />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="mt-4 flex justify-center gap-4">
            {Array.from(
              { length: Math.ceil(files.length / itemsPerPage) },
              (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-4 py-2 rounded-md ${
                    currentPage === i + 1
                      ? "bg-blue-500 text-white"
                      : "bg-gray-300 text-black"
                  }`}
                >
                  {i + 1}
                </button>
              )
            )}
          </div>
          {currentItems.length === 0 && (
            <h1 className="font-bold text-center w-full">Không có dữ liệu</h1>
          )}
        </div>
      )}
    </div>
  );
};

export default FileList;
