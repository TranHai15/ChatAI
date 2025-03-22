import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { ChatContext } from "../../../../contexts/ChatContext";
import { AuthContext } from "../../../../contexts/AuthContext";
import "./style.css"; // Link đến file CSS
import { showNotification } from "../../../../func";

export default function Header() {
  const { setIsSidebar, isSidebar } = useContext(ChatContext);
  const { isLogin, setIsLogin, inforUser } = useContext(AuthContext);

  const [isLogoutVisible, setIsLogoutVisible] = useState(false);

  const logout = async (id) => {
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
  };

  const toggleLogoutPopup = () => {
    setIsLogoutVisible(!isLogoutVisible);
  };

  return (
    <header className="h-12 w-full header">
      <div className="deptop">
        <div className="flex items-center ml-5 gap-[15px]">
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
            <h1>BeeAI</h1>
          </div>
        </div>
        {!isLogin ? (
          <div className="logo__icon">
            <Link to="/login">
              <img src="../../../../src/assets/user/user.svg" alt="User Icon" />
            </Link>
          </div>
        ) : (
          <div className="flex">
            <div className="thongitnUser">
              <p>Hello</p>
              <span className="userName">
                {/* {inforUser.data.dataUser.username} */}
              </span>
            </div>
            <div>
              <img
                className="avatar__login"
                src="https://cdn-icons-png.flaticon.com/512/6596/6596121.png"
                alt="User Avatar"
                onClick={toggleLogoutPopup} // Tạo sự kiện click để hiển thị pop-up
              />
            </div>

            {/* Pop-up đăng xuất */}
            {isLogoutVisible && (
              <div className="logout-popups">
                <button
                  className="logout-button"
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
