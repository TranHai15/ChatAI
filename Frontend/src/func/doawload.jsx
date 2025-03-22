const DownloadAllFiles = () => {
  const handleDownload = () => {
    const files = [
      "Danh sách các thành viên trong CLB BeeIT.xlsx",
      "WEB2033 - LAB6.pdf"
    ];

    files.forEach((file) => {
      const link = document.createElement("a");
      link.href = `/public/${file}`;
      link.download = file;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  return (
    <button
      onClick={handleDownload}
      className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
    >
      Tải tất cả file test
    </button>
  );
};

export default DownloadAllFiles;
