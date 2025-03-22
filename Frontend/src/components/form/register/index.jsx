import React, { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../contexts/AuthContext";

export default function Register() {
  const Navigator = useNavigate();
  const { isLogin } = useContext(AuthContext);

  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  useEffect(() => {
    if (isLogin) {
      // Nếu đã login, điều hướng đến trang chủ
      Navigator("/");
    }
  }, [isLogin, Navigator]);

  const registerUser = async (userData) => {
    try {
      const response = await axios.post(
        "http://localhost:3000/auth/register",
        userData
      );
      console.log("Đăng ký thành công:", response.data);

      Navigator(`/login`);
    } catch (error) {
      setError(
        error.response ? error.response.data : "Don't have response from server"
      );
    }
  };

  const onSubmit = (data) => {
    registerUser({ data });
  };

  return (
    <div>
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4">
              <label
                htmlFor="username"
                className="block text-gray-700 font-medium"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                {...register("username", { required: "Username is required" })}
                className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200"
                placeholder="Enter your username"
              />
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.username.message}
                </p>
              )}
            </div>
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-gray-700 font-medium"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                    message: "Invalid email format",
                  },
                })}
                className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200"
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
              <p className="text-red-500 text-sm mt-1">{error}</p>
            </div>
            <div className="mb-6">
              <label
                htmlFor="password"
                className="block text-gray-700 font-medium"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                {...register("password", { required: "Password is required" })}
                className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200"
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>
            <button
              type="submit"
              className="w-full bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition"
            >
              Sign Up
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
