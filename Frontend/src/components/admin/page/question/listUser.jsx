import React, { useState, useEffect, useContext } from "react";
import axiosClient from "../../../../api/axiosClient";
import { useNavigate, useLocation } from "react-router-dom";

import { showNotification } from "../../../../func";
import { ChatContext } from "../../../../contexts/ChatContext";
const ListAccount = () => {
  const [users, setUsers] = useState([]); // Dữ liệu người dùng
  const [filteredUsers, setFilteredUsers] = useState([]); // Dữ liệu sau khi lọc
  const [filters, setFilters] = useState({
    name: "",
    email: "",
    status: "all",
    startDate: "",
    endDate: ""
  });
  const { listUser, SetlistUser } = useContext(ChatContext);
  const Navigator = useNavigate();
  //   const path = useLocation();
  //   console.log("🚀 ~ ListAccount ~ path:", path.search);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    // console.log("🚀 ~ useEffect ~ listUser:", listUser);
    // setFilteredUsers(listUser);
    // console.log("filteredUsers", filteredUsers);
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

    if (filters.status !== "all") {
      if (filters.status === "null") {
        filtered = filtered.filter((user) => user.statuss == null);
      } else {
        filtered = filtered.filter((user) => user.statuss !== null);
      }
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
      status: "all",
      startDate: "",
      endDate: ""
    });
  };

  // Phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = listUser.slice(indexOfFirstItem, indexOfLastItem);

  const handelEdit = (id) => {
    Navigator(`/admin/editUser/${id}`);
  };

  // Hàm xóa người dùng
  const handleDelete = async (id) => {
    if (confirm("Bạn có chắc muốn xóa người dùng này?")) {
      try {
        await axiosClient.delete(`/user/delete/${id}`);
        setUsers(users.filter((user) => user.id !== id));
        showNotification("Người dùng đã được xóa.");
      } catch (error) {
        console.log("🚀 ~ handleDelete ~ error:", error);
        showNotification("Không thể xóa người dùng. Vui lòng thử lại.");
      }
    }
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
            <input
              type="text"
              placeholder="Tìm theo email"
              value={filters.email}
              onChange={(e) =>
                setFilters({ ...filters, email: e.target.value })
              }
              className="p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="o">Đang hoạt động</option>
              <option value="null">Không hoạt động</option>
            </select>
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

        {/* Danh sách người dùng */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <table className="w-full text-left table-auto border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-3 border">#</th>
                <th className="p-3 border">Tên</th>
                <th className="p-3 border">Email</th>
                <th className="p-3 border">Phân quyền</th>
                <th className="p-3 border">Trạng thái</th>
                <th className="p-3 border">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((user, index) => (
                <tr key={user.id} className="hover:bg-gray-100">
                  <td className="p-3 border">{index + 1}</td>
                  <td className="p-3 border">{user.username}</td>
                  <td className="p-3 border">{user.email}</td>
                  <td className="p-3 border">
                    {user.role_id === 1 ? "Admin" : "User"}
                  </td>
                  <td className="p-3 border">
                    {user.statuss ? "Đang hoạt động" : "Không hoạt động"}
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

export default ListAccount;
