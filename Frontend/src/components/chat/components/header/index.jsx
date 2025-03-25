import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { ChatContext } from "../../../../contexts/ChatContext";
import { AuthContext } from "../../../../contexts/AuthContext";
import "./style.css"; // Link đến file CSS
import { showNotification } from "../../../../func";
import NotificationPage from "../notification";
import axiosClient from "../../../../api/axiosClient";

export default function Header() {
  const { setIsSidebar, isSidebar, notification_cont } =
    useContext(ChatContext);
  const { isLogin, setIsLogin } = useContext(AuthContext);
  const [isNotificationsVisible, setIsNotificationsVisible] = useState(false);
  const [isLogoutVisible, setIsLogoutVisible] = useState(false);
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
  const toggleLogoutPopup = () => {
    setIsLogoutVisible(!isLogoutVisible);
  };

  const toggleNotifications = () => {
    setIsNotificationsVisible(!isNotificationsVisible);
  };

  return (
    <header className="h-12 w-full header">
      <div className="deptop flex items-center justify-between px-5">
        <div className="flex items-center gap-[15px]">
          {!isSidebar && (
            <div className="flex items-center gap-[15px]">
              <div className="coles" onClick={() => setIsSidebar(true)}>
                <img src="../../../../src/assets/user/close.svg" alt="Close" />
              </div>
              <div className="add__room">
                <img src="../../../../src/assets/user/add.svg" alt="Add" />
              </div>
            </div>
          )}
          <div className="logo__title">
            <h1>AI_VoiViet</h1>
          </div>
        </div>

        {!isLogin ? (
          <div className="logo__icon">
            <Link to="/login">
              <img src="../../../../src/assets/user/user.svg" alt="User Icon" />
            </Link>
          </div>
        ) : (
          <div className="flex relative items-center gap-4">
            {/* Icon thông báo */}
            <div className="relative">
              <img
                className="notification__icon cursor-pointer w-6"
                src="../../../../src/assets/notification.svg"
                alt="Notification Icon"
                onClick={toggleNotifications}
              />
              {notification_cont > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full text-xs w-4 h-4 p-1 flex items-center justify-center">
                  {notification_cont}
                </span>
              )}
              {isNotificationsVisible && (
                <div className="fixed top-14  z-20 shadow-lg w-96 right-4 bg-white">
                  <NotificationPage />
                </div>
              )}
            </div>
            <div className="flex">
              <div className="thongitnUser">
                <p>Xin chào</p>
                <span className="userName">
                  {/* {inforUser.data.dataUser.username} */}
                </span>
              </div>
              <div>
                <img
                  className="avatar__login cursor-pointer"
                  src="https://cdn-icons-png.flaticon.com/512/6596/6596121.png"
                  alt="User Avatar"
                  onClick={toggleLogoutPopup}
                />
              </div>
            </div>

            {/* Pop-up đăng xuất */}
            {isLogoutVisible && (
              <div className="logout-popups absolute right-0 mt-2 bg-white shadow-lg rounded border p-2 z-50">
                <button
                  className="logout-button flex items-center gap-2"
                  onClick={() => {
                    logout(1);
                    setIsLogin(false);
                    setIsLogoutVisible(false);
                  }}
                >
                  <img
                    src="../../../../src/assets/user/logout.svg"
                    alt="Logout Icon"
                    className="logout-icon"
                  />
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
