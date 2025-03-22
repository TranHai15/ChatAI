import { useState, useEffect, useContext } from "react";
import axiosClient from "../../../../api/axiosClient";
import "./style.css";
import { useNavigate } from "react-router-dom";
import { ChatContext } from "../../../../contexts/ChatContext";
const Question = () => {
  const [questions, setQuestions] = useState([]);
  // console.log("🚀 ~ Question ~ questions:", questions);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [filters, setFilters] = useState({
    content: "",
    startDate: "",
    endDate: ""
  });
  const Navigate = useNavigate();
  const { listUser, SetlistUser } = useContext(ChatContext);
  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
  const [questionsPerPage] = useState(10); // Số lượng câu hỏi mỗi trang

  useEffect(() => {
    const fetchData = async () => {
      const res = await axiosClient.post("/user/topQues");
      setQuestions(res.data.getChatTop);
      setFilteredQuestions(res.data.getChatTop);
    };
    fetchData();
  }, []);

  useEffect(() => {
    let filtered = [...questions];

    if (filters.content.trim()) {
      filtered = filtered.filter((q) =>
        q.content.toLowerCase().includes(filters.content.toLowerCase())
      );
    }

    if (filters.startDate) {
      const start = new Date(filters.startDate).getTime();
      filtered = filtered.filter(
        (q) => new Date(q.createdAt).getTime() >= start
      );
    }

    if (filters.endDate) {
      const end = new Date(filters.endDate).getTime();
      filtered = filtered.filter((q) => new Date(q.createdAt).getTime() <= end);
    }

    setFilteredQuestions(filtered);
  }, [filters, questions]);

  const handleReset = () => {
    setFilters({ content: "", startDate: "", endDate: "" });
  };

  const formatDate = (dateString) => {
    return dateString.replace("T", " ").slice(0, -5);
  };

  // Tính toán câu hỏi cần hiển thị
  const indexOfLastQuestion = currentPage * questionsPerPage;
  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
  const currentQuestions = filteredQuestions.slice(
    indexOfFirstQuestion,
    indexOfLastQuestion
  );

  // Tính số trang
  const totalPages = Math.ceil(filteredQuestions.length / questionsPerPage);

  // Hàm thay đổi trang
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const hendleViet = async (content) => {
    // console.log("🚀 ~ hendleViet ~ content:", content);
    const res = await axiosClient.get(`/api/getDetailChat?days=${content}`);
    // console.log("🚀 ~ hendleViet ~ res:", res);
    SetlistUser(res.data);

    // console.log("🚀 ~ hendleViet ~ listUser:", listUser);
    Navigate(`/admin/viewChat`);
  };
  return (
    <div className="flex justify-center">
      <div className="p-6 bg-gray-100 min-h-screen w-10/12">
        {/* Bộ lọc */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Bộ Lọc</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Lọc theo chủ đề"
              value={filters.content}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, content: e.target.value }))
              }
              className="p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, startDate: e.target.value }))
              }
              className="p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, endDate: e.target.value }))
              }
              className="p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mt-4 flex gap-4">
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-gray-300 text-black rounded-md hover:bg-gray-400"
            >
              Đặt lại
            </button>
          </div>
        </div>

        {/* Danh sách câu hỏi */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <table className="w-full text-left table-auto border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-3 border">#</th>
                <th className="p-3 border">Câu hỏi</th>
                <th className="p-3 border">Lượt hỏi</th>
                <th className="p-3 border">Ngày tạo</th>
                <th className="p-3 border">Chi tiết</th>
              </tr>
            </thead>

            <tbody>
              {currentQuestions.map((question, index) => (
                <tr key={index} className="hover:bg-gray-100">
                  <td className="p-3 border-none">{question.id}</td>
                  <td className="limit-lines border-none">
                    {question.content}
                  </td>
                  <td className="p-3 border min-w-max border-none">
                    {question.frequency}
                  </td>
                  <td className="p-3 border min-w-24 border-none">
                    {formatDate(question.first_asked_at)}
                  </td>
                  <td className="p-3 border limit-lines border-none">
                    <button
                      onClick={() => hendleViet(question.content)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 min-w-max border-none"
                    >
                      Chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredQuestions.length === 0 && (
            <h1 className="font-bold text-center w-full">Không có dữ liệu</h1>
          )}

          {/* Phân trang */}
          <div className="mt-6 flex justify-center gap-4">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-300 text-black rounded-md disabled:opacity-50"
            >
              Trang trước
            </button>
            {[...Array(totalPages).keys()].map((page) => (
              <button
                key={page}
                onClick={() => paginate(page + 1)}
                className={`px-4 py-2 ${
                  currentPage === page + 1
                    ? "bg-blue-500 text-white"
                    : "bg-gray-300 text-black"
                } rounded-md`}
              >
                {page + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-300 text-black rounded-md disabled:opacity-50"
            >
              Trang tiếp theo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Question;
