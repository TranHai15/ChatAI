import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axiosClient from "../../../../api/axiosClient";
import { useNavigate } from "react-router-dom";
import { showNotification, showConfirm } from "../../../../func";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm"; // Import remark-gfm
import Swal from "sweetalert2";

const UserProfile = () => {
  // State để quản lý thông tin người dùng và trạng thái chỉnh sửa
  const [isEditing, setIsEditing] = useState(false);
  const [chat, setChat] = useState([]);

  const [chatVisible, setChatVisible] = useState(true);
  console.log("🚀 ~ chatVisible:", chatVisible);
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    createdAt: ""
  });
  const navigate = useNavigate(); // Hook để điều hướng
  const resetChat = () => {
    setChat([]);
    setChatVisible(true); // Hide chat when reset
  };
  const handleGoBack = () => {
    navigate(-1); // Quay lại trang trước đó
  };
  const [chatUser, setChatUser] = useState([]);

  const [editedUserInfo, setEditedUserInfo] = useState({
    ...userInfo
  });
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      fetchData(id);
    }
  }, [id]);

  const fetchData = async (id) => {
    try {
      const res = await axiosClient.get(`/api/userView/${id}`);
      setUserInfo({
        name: res.data[0].username,
        email: res.data[0].email,
        password: res.data[0].password,
        role: res.data[0].role_id,
        createdAt: res.data[0].create_at
      });
      setEditedUserInfo({
        name: res.data[0].username,
        email: res.data[0].email,
        password: res.data[0].password,
        role: res.data[0].role_id,
        createdAt: res.data[0].create_at
      });
      setChatUser(res.data);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu người dùng:", error);
    }
  };

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    role: ""
  });

  // Thực hiện chỉnh sửa thông tin người dùng
  const handleEditClick = () => {
    setIsEditing(true);
  };

  // Lưu thông tin đã chỉnh sửa và gửi lên server
  const handleSaveClick = async () => {
    if (validateForm()) {
      try {
        editedUserInfo.id = id;
        const res = await axiosClient.post("/api/editUser", editedUserInfo);
        if (res.status == 200) {
          fetchData(id);
          showNotification("Lưu thông tin thành công");
        } else {
          showNotification("Lỗi khi lưu thông tin!");
        }
      } catch (error) {
        console.error("Lỗi khi gửi yêu cầu lưu:", error);
      }
    }
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setEditedUserInfo({ ...userInfo }); // Quay lại dữ liệu ban đầu
  };

  // Hàm kiểm tra xác thực từng trường
  const validateForm = () => {
    let formErrors = { ...errors };
    let isValid = true;

    if (!editedUserInfo.name) {
      formErrors.name = "Tên không được để trống!";
      isValid = false;
    } else {
      formErrors.name = "";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!editedUserInfo.email) {
      formErrors.email = "Email không được để trống!";
      isValid = false;
    } else if (!emailRegex.test(editedUserInfo.email)) {
      formErrors.email = "Email không hợp lệ!";
      isValid = false;
    } else {
      formErrors.email = "";
    }

    if (!editedUserInfo.password) {
      formErrors.password = "Mật khẩu không được để trống!";
      isValid = false;
    } else if (editedUserInfo.password.length < 6) {
      formErrors.password = "Mật khẩu phải có ít nhất 6 ký tự!";
      isValid = false;
    } else {
      formErrors.password = "";
    }

    if (!editedUserInfo.role) {
      formErrors.role = "Quyền không được để trống!";
      isValid = false;
    } else {
      formErrors.role = "";
    }

    setErrors(formErrors);
    return isValid;
  };

  // Hàm xử lý thay đổi các input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUserInfo((prevInfo) => ({
      ...prevInfo,
      [name]: value
    }));
  };

  const handleViewDetailClick = async (chatId) => {
    try {
      const res = await axiosClient.post(`/user/historyChat`, { id: chatId });
      if (res.status === 200) {
        setChatVisible(false);
        setChat(res.data.getChat);
      } else {
        showNotification("Lỗi khi lấy thông tin chi tiết!");
      }
    } catch (error) {
      console.error("Lỗi khi gửi yêu cầu POST: ", error);
    }
  };

  return (
    <div className="container mx-auto p-6  relative  ">
      {/* Thông tin người dùng */}
      <button
        onClick={() => handleGoBack()}
        className="px-4 py-2 bg-blue-300 text-white rounded-md hover:bg-blue-600 mb-5"
      >
        Quay Lai
      </button>
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-2xl font-semibold mb-4">Thông Tin Người Dùng</h2>
        <div className="grid grid-cols-1 gap-4">
          {/* Các input như tên, email, mật khẩu, quyền... */}
          <div>
            <label className="block font-medium">Tên</label>
            <input
              type="text"
              name="name"
              value={editedUserInfo.name}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="mt-1 p-2 w-full border rounded-md"
            />
            {errors.name && (
              <div className="text-red-500 text-sm mt-1">{errors.name}</div>
            )}
          </div>

          <div>
            <label className="block font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={editedUserInfo.email}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="mt-1 p-2 w-full border rounded-md"
            />
            {errors.email && (
              <div className="text-red-500 text-sm mt-1">{errors.email}</div>
            )}
          </div>

          <div>
            <label className="block font-medium">Mật khẩu</label>
            <input
              type="password"
              name="password"
              value={editedUserInfo.password}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="mt-1 p-2 w-full border rounded-md"
            />
            {errors.password && (
              <div className="text-red-500 text-sm mt-1">{errors.password}</div>
            )}
          </div>

          <div>
            <label className="block font-medium">Quyền</label>
            <select
              name="role"
              value={editedUserInfo.role || userInfo.role}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="mt-1 p-2 w-full border rounded-md"
            >
              <option value="1">Admin</option>
              <option value="0">User</option>
              <option value="2">Khóa tài Khoản</option>
            </select>
            {errors.role && (
              <div className="text-red-500 text-sm mt-1">{errors.role}</div>
            )}
          </div>

          <div>
            <label className="block font-medium">Ngày tạo</label>
            <input
              type="text"
              value={userInfo.createdAt}
              disabled
              className="mt-1 p-2 w-full border rounded-md bg-gray-200"
            />
          </div>

          <div className="mt-4">
            {!isEditing ? (
              <button
                onClick={handleEditClick}
                className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Chỉnh sửa
              </button>
            ) : (
              <div className="flex gap-4">
                <button
                  onClick={handleSaveClick}
                  className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                >
                  Lưu
                </button>
                <button
                  onClick={handleCancelClick}
                  className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  Hủy
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Phần lịch sử chat... */}
      {/* Lịch sử chat */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Lịch Sử Chat</h2>
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2">#</th>
              <th className="p-2">Tiêu đề</th>
              <th className="p-2">Ngày</th>
              <th className="p-2">Chi tiết</th>
            </tr>
          </thead>
          <tbody>
            {/* {chatUser[0].chat_id && */}
            {chatUser.map((chat) => (
              <tr key={chat.chat_id} className="border-b hover:bg-gray-100">
                <td className="p-2">{chat.chat_id}</td>
                <td className="p-2">{chat.chat_title}</td>
                <td className="p-2">{chat.chat_create}</td>
                <td className="p-2">
                  {chatUser.length == 0 || chatUser[0].chat_id !== null ? (
                    <h1 className="font-bold text-center">
                      <button
                        onClick={() => handleViewDetailClick(chat.chat_id)} // Gọi hàm khi nhấn
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                      >
                        Xem chi tiết
                      </button>
                    </h1>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {chatUser.length == 0 || chatUser[0].chat_id == null ? (
          <h1 className="font-bold text-center">Không có lịch sử chat</h1>
        ) : null}
      </div>
      {!chatVisible && (
        <div className=" flex justify-center mt-12 mb-2">
          <div className=" w-full left-0 overflow-auto  bg-slate-300 p-5 your-element absolute top-0 right-0 bottom-0">
            <h1 className="font-bold text-center w-full">Chat Chi tiết</h1>
            {chat.map((text, index) => (
              <div key={index}>
                <div className=" flex gap-5 justify-end">
                  {text.role === "assistant" && (
                    <div className="logo__chat logo__none min-w-10 min-h-10">
                      <div className="logo__chat--img">
                        <img src="../../../../src/assets/user/logo.svg" />
                      </div>
                    </div>
                  )}
                  <div
                    className={` flex role_admin-text ${
                      text.role === "user" ? "justify-end" : "gap-4 items-start"
                    }`}
                  >
                    <div
                      className={` flex ${
                        text.role === "user"
                          ? "content__chat--user w-full "
                          : "content__chat"
                      }`}
                    >
                      <Markdown remarkPlugins={[remarkGfm]}>
                        {text.content.trim("")}
                      </Markdown>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={resetChat}
            className="fixed bottom-5 right-5 px-6 py-2 bg-red-500 text-white rounded-full hover:bg-red-600"
          >
            Thoát Chat
          </button>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
