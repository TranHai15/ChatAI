import { showNotification } from "../../../../func";
import "./style.css";
import { NavLink } from "react-router-dom";
import axiosClient from "../../../../api/axiosClient";
export default function Sidebar() {
  const datass = JSON.parse(localStorage.getItem("active"));
  const id = datass?.dataLogin?.dataUser?.id;
  const logout = async () => {
    const res = await axiosClient.post("/auth/logout", { id: id });
    if (res.status === 200 || res.status == 201) {
      const data = {
        data: {
          dataUser: "",
          refreshToken: "",
          accessToken: ""
        },
        isLogin: false
      };
      localStorage.setItem("active", JSON.stringify(data));
      showNotification("Đăng Xuat thành công!", "success");
      window.location.reload();
    } else {
      showNotification("Đăng  Xuat Không thành công!", "error");
    }
  };
  return (
    <aside className="admin-sidebar">
      <ul>
        <li>
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              isActive ? "active-link" : "inactive-link"
            }
          >
            Home
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/admin/users"
            end
            className={({ isActive }) =>
              isActive ? "active-link" : "inactive-link"
            }
          >
            Danh Sách Người dùng
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/admin/nof"
            end
            className={({ isActive }) =>
              isActive ? "active-link" : "inactive-link"
            }
          >
            Danh Sách Công việc
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/admin/file"
            end
            className={({ isActive }) =>
              isActive ? "active-link" : "inactive-link"
            }
          >
            File
          </NavLink>
        </li>
        <li>
          <button
            className="p-2 hover:bg-slate-400 w-full text-start"
            onClick={() => logout()}
          >
            Đăng Xuất
          </button>
        </li>
        {/* <li>
          <a href="/settings">Cài đặt</a>
        </li> */}
      </ul>
    </aside>
  );
}
