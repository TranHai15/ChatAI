import { useState, useEffect } from "react";
import axiosClient from "../../../../api/axiosClient";
import { useNavigate } from "react-router-dom";

import { showNotification } from "../../../../func";

const Account = () => {
  const [users, setUsers] = useState([]); // Dữ liệu người dùng
  const [filteredUsers, setFilteredUsers] = useState([]); // Dữ liệu sau khi lọc
  const [filters, setFilters] = useState({
    name: "",
    email: "",
    phong_ban: "",
    startDate: "",
    endDate: ""
  });
  const Navigator = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await axiosClient.get("/user/");
      setUsers(res.data);

      setFilteredUsers(res.data);
    };

    fetchUsers();
  }, []);

  // Hàm lọc dữ liệu
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
      const emailSearch = filters.phong_ban.toLowerCase().replace(/\s+/g, "");
      filtered = filtered.filter((user) =>
        user.phong_ban?.toLowerCase().replace(/\s+/g, "").includes(emailSearch)
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

    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [filters, users]);

  // Reset bộ lọc
  const handleReset = () => {
    setFilters({
      name: "",
      email: "",
      phong_ban: "",
      startDate: "",
      endDate: ""
    });
  };

  // Phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  const handelEdit = (id) => {
    Navigator(`/admin/editUser/${id}`);
  };

  // Hàm xóa người dùng
  const handleDelete = async (id) => {
    if (confirm("Bạn có chắc muốn xóa người dùng này?")) {
      try {
        const res = await axiosClient.delete(`/user/delete/${id}`);
        if (res.status == 200 || res.status == 201) {
          setUsers(users.filter((user) => user.id !== id));
          showNotification("Người dùng đã được xóa.");
        }
      } catch (error) {
        console.log("🚀 ~ handleDelete ~ error:", error);
        showNotification(
          "Không thể xóa người dùng. Vui lòng thử lại.",
          "error"
        );
      }
    }
  };
  const handleAdd = async () => {
    Navigator(`/admin/create`);
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
              placeholder="Tìm theo tên"
              value={filters.name}
              onChange={(e) => setFilters({ ...filters, name: e.target.value })}
              className="p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {/* <input
              type="text"
              placeholder="Tìm theo email"
              value={filters.email}
              onChange={(e) =>
                setFilters({ ...filters, email: e.target.value })
              }
              className="p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            /> */}
            <input
              type="text"
              placeholder="Tìm theo Phòng Ban"
              value={filters.phong_ban}
              onChange={(e) =>
                setFilters({ ...filters, phong_ban: e.target.value })
              }
              className="p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) =>
                setFilters({ ...filters, startDate: e.target.value })
              }
              className="p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) =>
                setFilters({ ...filters, endDate: e.target.value })
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
        <button
          onClick={handleAdd}
          className="px-6 py-2 mb-3 bg-green-400 text-black rounded-md hover:bg-green-600"
        >
          Thêm tài khoản
        </button>
        {/* Danh sách người dùng */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <table className="w-full text-left table-auto border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-3 border">#</th>
                <th className="p-3 border">Tên</th>
                <th className="p-3 border">Phòng Ban</th>
                <th className="p-3 border">Phân quyền</th>
                <th className="p-3 border">Ngày Tạo</th>
                <th className="p-3 border">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((user, index) => (
                <tr key={user.id} className="hover:bg-gray-100">
                  <td className="p-3 border">{index + 1}</td>
                  <td className="p-3 border max-w-32 overflow-hidden ">
                    {user.fullname}
                  </td>
                  <td className="p-3 border">{user.phong_ban}</td>

                  <td className="p-3 border max-w-8 overflow-hidden">
                    {user.role_id === 1 ? "Admin" : "User"}
                  </td>
                  <td className="p-3 border max-w-52 overflow-hidden">
                    {user.create_at}
                  </td>
                  <td className="p-3 border">
                    <button
                      onClick={() => handelEdit(user.id)}
                      className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 mr-2"
                    >
                      Chi tiết
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {currentItems.length === 0 && (
            <h1 className="font-bold text-center w-full">Không có dữ liệu</h1>
          )}
        </div>
      </div>
    </div>
  );
};

export default Account;
