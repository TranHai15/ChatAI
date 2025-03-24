import { useForm } from "react-hook-form";
import { jwtDecode } from "jwt-decode";
import { useContext, useState, useEffect } from "react";
import "./style.css";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../../contexts/AuthContext";
import axios from "../../../api/axiosClient";
import { showNotification } from "../../../func";

export default function Login() {
  const { isLogin, isRole, Navigate, Location } = useContext(AuthContext);

  const [backendError, setBackendError] = useState({});
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  // Kiểm tra trạng thái login khi component được mount
  useEffect(() => {
    if (isLogin && isRole !== null) {
      // Nếu đã login, điều hướng đến trang chủ
      Navigate("/");
    }
  }, [isLogin, Location.pathname]);

  const loginUser = async (data) => {
    try {
      const response = await axios.post("auth/login", data);
      const dataLogin = response.data;
      localStorage.setItem(
        "active",
        JSON.stringify({
          isLogin: true,
          dataLogin
        })
      );
      Navigate("/");
      showNotification("Đăng nhập thành công!", "success");
    } catch (error) {
      if (error.response && error.response.data) {
        setBackendError(error.response.data);
      } else {
        setBackendError({ All: "Lỗi server. Vui lòng thử lại." });
      }
    }
  };

  const onSubmit = (data) => {
    setBackendError({}); // Clear backend errors on new submission
    loginUser(data);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-sm">
        <h2 className="text-2xl font-semibold text-center mb-6">Login</h2>
        {backendError.All && (
          <p className="text-red-500 text-center mb-4">{backendError.All}</p>
        )}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              {...register("username", {
                required: "Vui lòng nhập Username",
                minLength: {
                  value: 6,
                  message: "Username phải có ít nhất 6 ký tự"
                }
              })}
              placeholder="Enter your username"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {backendError.username ? (
              <p className="text-red-500 text-sm">{backendError.username}</p>
            ) : errors.username ? (
              <p className="text-red-500 text-sm">{errors.username.message}</p>
            ) : null}
          </div>
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              {...register("password", { required: "Vui lòng nhập Password" })}
              placeholder="Enter your password"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {backendError.password ? (
              <p className="text-red-500 text-sm">{backendError.password}</p>
            ) : errors.password ? (
              <p className="text-red-500 text-sm">{errors.password.message}</p>
            ) : null}
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Login
          </button>
        </form>

        {/* <Link
          to={"/signup"}
          className="text-blue-500 text-sm mt-4 inline-block"
        >
          Sign Up
        </Link> */}
      </div>
    </div>
  );
}
