import { useState, useEffect } from "react";
import axiosClient from "../../../../api/axiosClient";

const Nof = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filters, setFilters] = useState({
    fullname: "",
    ten_phong: "",
    startDate: "",
    endDate: ""
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch dữ liệu khi component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axiosClient.post("/user/nof", { id: 4 });
        setUsers(res.data.getChat);
        console.log("🚀 ~ fetchUsers ~ res.data.getChat:", res.data.getChat);
        setFilteredUsers(res.data.getChat);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  // Áp dụng bộ lọc khi filters hoặc users thay đổi
  useEffect(() => {
    let filtered = [...users];

    // Lọc theo fullname (chuyển thành chữ thường, bỏ khoảng trắng)
    if (filters.fullname.trim()) {
      const nameSearch = filters.fullname.toLowerCase().replace(/\s+/g, "");
      filtered = filtered.filter((user) =>
        user.fullname?.toLowerCase().replace(/\s+/g, "").includes(nameSearch)
      );
    }
    // Lọc theo tên phòng ban
    if (filters.ten_phong.trim()) {
      const phongBanSearch = filters.ten_phong
        .toLowerCase()
        .replace(/\s+/g, "");
      filtered = filtered.filter((user) =>
        user.ten_phong
          ?.toLowerCase()
          .replace(/\s+/g, "")
          .includes(phongBanSearch)
      );
    }
    // Lọc theo ngày bắt đầu
    if (filters.startDate) {
      filtered = filtered.filter(
        (user) => new Date(user.created_at) >= new Date(filters.startDate)
      );
    }
    // Lọc theo ngày kết thúc
    if (filters.endDate) {
      filtered = filtered.filter(
        (user) => new Date(user.created_at) <= new Date(filters.endDate)
      );
    }
    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [filters, users]);

  // Reset bộ lọc
  const handleReset = () => {
    setFilters({
      fullname: "",
      ten_phong: "",
      startDate: "",
      endDate: ""
    });
  };

  // Tính toán phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  return (
    <div className="flex justify-center">
      <div className="p-6 bg-gray-100 min-h-screen w-10/12">
        {/* Bộ lọc */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-2xl font-semibold mb-4">Bộ Lọc</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex flex-col">
              <label className="mb-1 font-medium">Tìm theo tên</label>
              <input
                type="text"
                placeholder="Nhập tên..."
                value={filters.fullname}
                onChange={(e) =>
                  setFilters({ ...filters, fullname: e.target.value })
                }
                className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-1 font-medium">Tìm theo phòng ban</label>
              <input
                type="text"
                placeholder="Nhập phòng ban..."
                value={filters.ten_phong}
                onChange={(e) =>
                  setFilters({ ...filters, ten_phong: e.target.value })
                }
                className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-1 font-medium">Ngày bắt đầu</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  setFilters({ ...filters, startDate: e.target.value })
                }
                className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-1 font-medium">Ngày kết thúc</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) =>
                  setFilters({ ...filters, endDate: e.target.value })
                }
                className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>
          <button
            onClick={handleReset}
            className="mt-4 px-6 py-2 bg-gray-300 text-black rounded-md hover:bg-gray-400 transition"
          >
            Đặt lại
          </button>
        </div>

        {/* Hiển thị dữ liệu */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-4 py-2">ID</th>
                  <th className="border px-4 py-2">Công việc</th>
                  <th className="border px-4 py-2">Người làm</th>
                  <th className="border px-4 py-2">Phòng ban</th>
                  <th className="border px-4 py-2">Trạng thái</th>
                  <th className="border px-4 py-2">Hạn chót</th>
                  <th className="border px-4 py-2">Đã đọc</th>
                  <th className="border px-4 py-2">Ngày tạo</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((notif, index) => (
                    <tr key={index} className="text-center hover:bg-gray-50">
                      <td className="border px-4 py-2">{notif.user_id}</td>
                      <td className="border px-4 py-2 min-w-[80px] max-w-[400px] overflow-hidden">
                        {notif.task}
                      </td>
                      <td className="border px-4 py-2">{notif.username}</td>
                      <td className="border px-4 py-2">{notif.ten_phong}</td>
                      <td className="border px-4 py-2">{notif.status}</td>
                      <td className="border px-4 py-2">{notif.deadline}</td>
                      <td className="border px-4 py-2">
                        {notif.is_read ? "✅" : "❌"}
                      </td>
                      <td className="border px-4 py-2">{notif.created_at}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center py-4 font-bold">
                      Không có dữ liệu
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Phân trang */}
          <div className="flex justify-center mt-4">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`mx-1 px-3 py-2 rounded-md transition ${
                  currentPage === i + 1
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Nof;
