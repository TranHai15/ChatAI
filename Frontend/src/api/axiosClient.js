import axios from "axios";
import { useNavigate } from "react-router-dom";

const refreshAccessToken = async () => {
  const activeUser = JSON.parse(localStorage.getItem("active"));
  const id = activeUser?.dataLogin?.dataUser?.id;
  const refreshToken = activeUser?.dataLogin?.refreshToken;

  if (!id || !refreshToken) {
    console.error("ID or refreshToken is missing in localStorage");
    return null;
  }

  try {
    // console.log("cap lai token");
    const response = await axiosClient.post("/auth/refresh", {
      id: id,
      refreshToken: refreshToken
    });

    if (response.status !== 200) {
      console.error(`Failed to refresh token: ${response.statusText}`);
      return null;
    }

    const { accessToken, refreshToken: newRefreshToken } = response.data;
    // console.log("🚀 ~ refreshAccessToken ~ newRefreshToken:", newRefreshToken);
    // console.log("🚀 ~ refreshAccessToken ~ response:", response.data);

    // Cập nhật lại dữ liệu trong localStorage
    const updatedUserData = {
      isLogin: true,
      dataLogin: {
        dataUser: activeUser.dataLogin.dataUser,
        accessToken: accessToken,
        refreshToken: newRefreshToken
      }
    };
    localStorage.setItem("active", JSON.stringify(updatedUserData));

    return { accessToken, newRefreshToken }; // Trả về cả accessToken và refreshToken mới
  } catch (error) {
    // console.error("Error refreshing token:", error);
    // console.log(error.response.data.code);
    if (error.response.data.code === "REFRESH_TOKEN_EXPIRED") {
      alert("vui long dang nhap lai");
      localStorage.removeItem("active");

      window.location.href = "/login";
      console.log("vui long dang nhap lai");
    }
    return null;
  }
};

const axiosClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_BACKEND}`,
  headers: {
    "Content-Type": "application/json"
  }
});

// Interceptor để thêm accessToken vào header
axiosClient.interceptors.request.use(
  function (config) {
    // refreshAccessToken();
    // Kiểm tra xem URL có phải là /login, /register, hoặc /reftoken không
    if (
      config.url !== "auth/login" &&
      config.url !== "auth/register" &&
      config.url !== "auth/refresh"
    ) {
      const activeUser = JSON.parse(localStorage.getItem("active"));
      const accessToken = activeUser.dataLogin.accessToken;
      const id = activeUser?.dataLogin?.dataUser?.id;

      // Kiểm tra nếu không có accessToken, chuyển hướng đến trang login hoặc xử lý lỗi
      if (!accessToken) {
        const Navigator = useNavigate();
        Navigator("/login");
        return Promise.reject("No access token found, please log in.");
      }

      // Nếu có accessToken, thêm vào header Authorization
      config.headers["Authorization"] = `Bearer ${accessToken}`;
      config.headers["MS"] = id;
      // if (
      //   ["post", "put", "patch", "delete"].includes(config.method.toLowerCase())
      // ) {
      //   config.data = { ...config.data, userId: id };
      // }
    }
    return config;
  },
  function (error) {
    // Xử lý lỗi request
    return Promise.reject(error);
  }
);

// Interceptor để xử lý response
axiosClient.interceptors.response.use(
  function (response) {
    // Xử lý dữ liệu phản hồi nếu cần
    return response;
  },
  async function (error) {
    const originalRequest = error.config;

    // console.log("🚀 ~ originalRequest:", originalRequest);
    // Kiểm tra nếu lỗi là do token hết hạn (errorCode: TOKEN_EXPIRED)
    try {
      if (
        error.response.status === 401 &&
        error.response.data?.errorCode === "TOKEN_EXPIRED" &&
        !originalRequest._retry
      ) {
        originalRequest._retry = true;

        const { accessToken, newRefreshToken } = await refreshAccessToken();
        // console.log("🚀 ~ accessToken:", accessToken);

        if (accessToken) {
          // Nếu có accessToken mới, cập nhật lại header và gọi lại request cũ
          originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
          return axiosClient(originalRequest); // Gọi lại request ban đầu với accessToken mới
        } else {
          // Nếu không có token mới, chuyển hướng đến login
          alert("Token đã hết hạn, vui lòng đăng nhập lại.");
          const Navigator = useNavigate();
          Navigator("/login");
          return Promise.reject(error);
        }
      }

      // Nếu không phải lỗi token hết hạn, tiếp tục xử lý bình thường
      return Promise.reject(error);
    } catch (error) {
      console.log(error);
    }
  }
);

export default axiosClient;
