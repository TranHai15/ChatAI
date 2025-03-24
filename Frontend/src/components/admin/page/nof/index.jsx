import { useState, useEffect } from "react";
import axiosClient from "../../../../api/axiosClient";
import { useNavigate } from "react-router-dom";

const Nof = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filters, setFilters] = useState({
    name: "",
    email: "",
    phong_ban: "",
    startDate: "",
    endDate: "",
    readStatus: ""
  });
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axiosClient.get("/user/nof");
        setUsers(res.data.getChat);
        setFilteredUsers(res.data.getChat);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    let filtered = [...users];

    if (filters.name.trim()) {
      const nameSearch = filters.name.toLowerCase().replace(/\s+/g, "");
      filtered = filtered.filter((user) =>
        user.username?.toLowerCase().replace(/\s+/g, "").includes(nameSearch)
      );
    }
    if (filters.email.trim()) {
      const emailSearch = filters.email.toLowerCase().replace(/\s+/g, "");
      filtered = filtered.filter((user) =>
        user.email?.toLowerCase().replace(/\s+/g, "").includes(emailSearch)
      );
    }
    if (filters.phong_ban.trim()) {
      const phongBanSearch = filters.phong_ban
        .toLowerCase()
        .replace(/\s+/g, "");
      filtered = filtered.filter((user) =>
        user.phong_ban
          ?.toLowerCase()
          .replace(/\s+/g, "")
          .includes(phongBanSearch)
      );
    }
    if (filters.startDate) {
      filtered = filtered.filter(
        (user) => new Date(user.create_at) >= new Date(filters.startDate)
      );
    }
    if (filters.endDate) {
      filtered = filtered.filter(
        (user) => new Date(user.create_at) <= new Date(filters.endDate)
      );
    }
    if (filters.readStatus) {
      filtered = filtered.filter(
        (user) => user.read_status === filters.readStatus
      );
    }

    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [filters, users]);

  const handleReset = () => {
    setFilters({
      name: "",
      email: "",
      phong_ban: "",
      startDate: "",
      endDate: "",
      readStatus: ""
    });
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  return (
    <div className="flex justify-center">
      <div className="p-6 bg-gray-100 min-h-screen w-10/12">
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Bộ Lọc</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            <div>
              <label htmlFor="" className="pl-4">Tìm theo tên</label>
              <input
              type="text"
              placeholder="Tìm theo tên"
              value={filters.name}
              onChange={(e) => setFilters({ ...filters, name: e.target.value })}
              className="p-3 border rounded-md"
            />
            </div>
            <div>
              <label htmlFor="" className="pl-4">Tìm theo phòng ban</label>
              <input
              type="text"
              placeholder="Tìm theo Phòng Ban"
              value={filters.phong_ban}
              onChange={(e) =>
                setFilters({ ...filters, phong_ban: e.target.value })
              }
              className="p-3 border rounded-md"
            />
            </div>
            <div>
              <label htmlFor="" className="pl-4">Ngày bắt đầu</label>
              <input
              type="date"
              value={filters.startDate}
              onChange={(e) =>
                setFilters({ ...filters, startDate: e.target.value })
              }
              className="p-3 border rounded-md"
            />
            </div>
            <div>
              <label htmlFor="" className="pl-4">Ngày kết thúc</label>
              <input
              type="date"
              value={filters.endDate}
              onChange={(e) =>
                setFilters({ ...filters, endDate: e.target.value })
              }
              className="p-3 border rounded-md"
            />
            </div>
          </div>
          <button
            onClick={handleReset}
            className="px-6 py-2 bg-gray-300 mt-4 text-black rounded-md"
          >
            Đặt lại
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 shadow-lg bg-white">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-4 py-2">ID</th>
                  <th className="border px-4 py-2">Công việc</th>
                  <th className="border px-4 py-2">Nguời làm</th>
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
                    <tr key={index} className="text-center">
                      <td className="border px-4 py-2">{notif.user_id}</td>
                      <td className="border px-4 py-2 min-w-80 max-w-96 overflow-hidden">
                        {notif.task}
                      </td>
                      <td className="border px-4 py-2">{notif.username}</td>
                      <td className="border px-4 py-2">{notif.phong_ban}</td>
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
          <div className="flex justify-center mt-4">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`mx-1 px-3 py-2 ${
                  currentPage === i + 1
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200"
                } rounded-md`}
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
