import { useContext, useEffect, useState } from "react";
import axiosClient from "../../../../api/axiosClient";
import { useNavigate } from "react-router-dom";
import { showNotification } from "../../../../func";
import { AuthContext } from "../../../../contexts/AuthContext";

export default function CreateAccount() {
  const { isRole, dataUser } = useContext(AuthContext);
  const id_phong = dataUser?.phong_ban_id;

  const Navigator = useNavigate();
  const [newUser, setNewUser] = useState({
    name: "",
    username: "",
    password: "",
    role: "2", // Mặc định là User
    phong_ban: null
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [phongBan, setPhongBan] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await axiosClient.get("/user/department");
      setPhongBan(res.data);
    };

    fetchUsers();
  }, []);

  // Hàm kiểm tra xác thực từng trường
  const validateForm = async () => {
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
    if (!newUser.password) {
      formErrors.password = "Mật khẩu không được để trống!";
      isValid = false;
    } else if (newUser.password.length < 6) {
      formErrors.password = "Mật khẩu phải có ít nhất 6 ký tự!";
      isValid = false;
    }

    if (isRole === 1) {
      if (newUser.phong_ban == null) {
        formErrors.phong_ban = "Vui lòng chọn phòng ban!";
        isValid = false;
      }
      isValid = false;
    }
    if (!newUser.role) {
      formErrors.role = "Quyền không được để trống!";
      isValid = false;
    } else {
      if (newUser.role == 3) {
        const kq = await whereAccount(newUser.phong_ban);

        if (!kq) {
          showNotification("Đã có tài khoản trưởng phòng rồi", "error");
        }
        isValid = kq;
      }
    }

    setErrors(formErrors);
    return isValid;
  };

  const whereAccount = async (id) => {
    const res = await axiosClient.post("/user/where", { id: id });
    if (res.data.length > 0) {
      return false;
    } else {
      return true;
    }
  };

  // Hàm xử lý thay đổi các input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prevUser) => ({ ...prevUser, [name]: value }));
  };

  // Hàm xử lý khi nhấn nút tạo tài khoản
  const handleCreateAccount = async () => {
    const kq = await validateForm();
    console.log("🚀 ~ handleCreateAccount ~ kq:", kq);
    if (kq) {
      try {
        if (isRole !== 1) {
          newUser.phong_ban = id_phong;
        }

        const res = await axiosClient.post("/auth/registerAdmin", newUser);
        if (res.status === 201 || res.status === 200) {
          // alert("Tạo tài khoản thành công!");
          showNotification("Tạo tài khoản thành công!");
          setNewUser({
            name: "",
            username: "",
            password: "",
            role: "2",
            phong_ban: 9999
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
        console.log("error.response.data", error.response.data);
      }
    }
  };

  return (
    <div className="container mx-auto p-6 relative">
      <h2 className="text-2xl font-semibold mb-4">Tạo Tài Khoản Mới</h2>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block font-medium">Tài Khoản</label>
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
            <label className="block font-medium">Họ Và Tên</label>
            <input
              type="text"
              name="username"
              value={newUser.username}
              onChange={handleInputChange}
              className="mt-1 p-2 w-full border rounded-md"
            />
            {errors.username && (
              <div className="text-red-500 text-sm mt-1">{errors.username}</div>
            )}
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
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
            )}
            {error.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label className="block font-medium">Quyền</label>
            {isRole !== 1 ? (
              <select
                name="role"
                value={newUser.role}
                onChange={handleInputChange}
                className="mt-1 p-2 w-full border rounded-md"
              >
                <option value="2">User</option>
              </select>
            ) : (
              <select
                name="role"
                value={newUser.role}
                onChange={handleInputChange}
                className="mt-1 p-2 w-full border rounded-md"
              >
                <option value="1">Admin</option>
                <option value="2">User</option>
                <option value="3">Trưởng phòng</option>
              </select>
            )}
            {errors.role && (
              <div className="text-red-500 text-sm mt-1">{errors.role}</div>
            )}
            {error.role && (
              <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>
            )}
          </div>

          <div>
            <label className="block font-medium">Phòng Ban</label>

            {isRole !== 1 ? (
              phongBan.map((item, index) => {
                if (id_phong == item.id) {
                  return (
                    <div key={index}>
                      <input
                        type="text"
                        value={item.ten_phong}
                        disabled
                        className="mt-1 p-2 w-full border rounded-md"
                      />
                      <input
                        type="hidden"
                        name="phong_ban"
                        value={id_phong}
                        className="mt-1 p-2 w-full border rounded-md"
                      />
                    </div>
                  );
                }
              })
            ) : (
              <select
                name="phong_ban"
                className="w-full border rounded-md p-2 "
                onChange={handleInputChange}
              >
                <option value={null}>Chọn Phòng Ban</option>
                {phongBan.map((item, index) => (
                  <option key={index} value={item.id}>
                    {item.ten_phong}
                  </option>
                ))}
              </select>
            )}
            {errors.phong_ban && (
              <div className="text-red-500 text-sm mt-1">
                {errors.phong_ban}
              </div>
            )}
            {error.phong_ban && (
              <p className="text-red-500 text-sm mt-1">
                {errors.phong_ban && errors.phong_ban.message}
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
