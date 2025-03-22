import { showNotification } from "../../../../func";
import "./style.css";
import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const logout = async () => {
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
            to="/admin/topQuestion"
            end
            className={({ isActive }) =>
              isActive ? "active-link" : "inactive-link"
            }
          >
            Top Câu Hỏi
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
