import React, { useState } from "react";
import axios from "axios";
import axiosClient from "../../../../api/axiosClient";
import { useNavigate } from "react-router-dom";

export default function CreateAccount() {
  const Navigator = useNavigate();
  const [newUser, setNewUser] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    role: "2", // Mặc định là User
    phong_ban: ""
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");

  // Hàm kiểm tra xác thực từng trường
  const validateForm = () => {
    let formErrors = {};
    let isValid = true;

    if (!newUser.name) {
      formErrors.name = "Tên không được để trống!";
      isValid = false;
    }
    if (!newUser.username) {
      formErrors.username = "Full Tên không được để trống!";
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!newUser.email) {
      formErrors.email = "Email không được để trống!";
      isValid = false;
    } else if (!emailRegex.test(newUser.email)) {
      formErrors.email = "Email không hợp lệ!";
      isValid = false;
    }

    if (!newUser.password) {
      formErrors.password = "Mật khẩu không được để trống!";
      isValid = false;
    } else if (newUser.password.length < 6) {
      formErrors.password = "Mật khẩu phải có ít nhất 6 ký tự!";
      isValid = false;
    }

    if (!newUser.role) {
      formErrors.role = "Quyền không được để trống!";
      isValid = false;
    }

    setErrors(formErrors);
    return isValid;
  };

  // Hàm xử lý thay đổi các input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prevUser) => ({ ...prevUser, [name]: value }));
  };

  // Hàm xử lý khi nhấn nút tạo tài khoản
  const handleCreateAccount = async () => {
    if (validateForm()) {
      try {
        // console.log("🚀 ~ handleCreateAccount ~ newUser:", newUser);
        const res = await axiosClient.post("/auth/registerAdmin", newUser);
        if (res.status == 201 || res.status == 200) {
          alert("Tạo tài khoản thành công!");
          setNewUser({
            name: "",
            username: "",
            email: "",
            password: "",
            role: "2",
            phong_ban: ""
          });
          Navigator("/admin/users");
        } else {
          alert("Có lỗi xảy ra khi tạo tài khoản!");
        }
      } catch (error) {
        console.error("Lỗi khi gửi yêu cầu tạo tài khoản:", error);
        setError(
          error.response
            ? error.response.data
            : "Don't have response from server"
        );
      }
    }
  };

  return (
    <div className="container mx-auto p-6 relative">
      <h2 className="text-2xl font-semibold mb-4">Tạo Tài Khoản Mới</h2>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block font-medium">Tên</label>
            <input
              type="text"
              name="name"
              value={newUser.name}
              onChange={handleInputChange}
              className="mt-1 p-2 w-full border rounded-md"
            />
            {errors.name && (
              <div className="text-red-500 text-sm mt-1">{errors.name}</div>
            )}
            {error.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block font-medium">Full Tên</label>
            <input
              type="text"
              name="username"
              value={newUser.username}
              onChange={handleInputChange}
              className="mt-1 p-2 w-full border rounded-md"
            />
            {errors.username && (
              <div className="text-red-500 text-sm mt-1">{errors.username}</div>
            )}{" "}
            {error.username && (
              <p className="text-red-500 text-sm mt-1">
                {errors.username.message}
              </p>
            )}
          </div>

          <div>
            <label className="block font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={newUser.email}
              onChange={handleInputChange}
              className="mt-1 p-2 w-full border rounded-md"
            />
            {errors.email && (
              <div className="text-red-500 text-sm mt-1">{errors.email}</div>
            )}{" "}
            {error && <p className="text-red-500  text-sm mt-1">{error}</p>}
          </div>

          <div>
            <label className="block font-medium">Mật khẩu</label>
            <input
              type="password"
              name="password"
              value={newUser.password}
              onChange={handleInputChange}
              className="mt-1 p-2 w-full border rounded-md"
            />
            {errors.password && (
              <div className="text-red-500 text-sm mt-1">{errors.password}</div>
            )}{" "}
            {error.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label className="block font-medium">Quyền</label>
            <select
              name="role"
              value={newUser.role}
              onChange={handleInputChange}
              className="mt-1 p-2 w-full border rounded-md"
            >
              <option value="1">Admin</option>
              <option value="2">User</option>
              <option value="3">Khóa tài khoản</option>
            </select>
            {errors.role && (
              <div className="text-red-500 text-sm mt-1">{errors.role}</div>
            )}{" "}
            {error.role && (
              <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>
            )}
          </div>

          <div>
            <label className="block font-medium">Phòng Ban</label>
            <input
              type="text"
              name="phong_ban"
              value={newUser.phong_ban}
              onChange={handleInputChange}
              className="mt-1 p-2 w-full border rounded-md"
            />
            {error.phong_ban && (
              <p className="text-red-500 text-sm mt-1">
                {errors.phong_ban.phong_ban}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={handleCreateAccount}
            className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            Tạo tài khoản
          </button>
        </div>
      </div>
    </div>
  );
}
