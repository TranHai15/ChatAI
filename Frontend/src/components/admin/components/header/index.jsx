import React, { useState } from "react";
import "./style.css";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const [isLogoutPopupVisible, setLogoutPopupVisible] = useState(false);
  const Navigate = useNavigate();
  // Hàm mở/đóng popup đăng xuất
  const toggleLogoutPopup = () => {
    setLogoutPopupVisible(!isLogoutPopupVisible);
  };

  // Hàm xử lý đăng xuất
  const handleLogout = () => {
    Navigate("/admin");
  };

  return (
    <header className="admin-header">
      <div className="logo flex gap-1 items-center" onClick={handleLogout}>
        <span>Vôi Việt</span>
        {/* <img
          className="w-28 bg-transparent"
          src="../../../src/assets/logoFpt.jpg"
        /> */}
      </div>

      {isLogoutPopupVisible && (
        <>
          {/* Overlay để làm mờ nền khi popup hiển thị */}
          <div className="logout-overlay" onClick={toggleLogoutPopup}></div>

          {/* Popup đăng xuất */}
          <div className="logout-popup--admin">
            <h3>Đăng xuất?</h3>
            <p>Bạn có chắc muốn đăng xuất khỏi hệ thống?</p>
            <button className="popup-button" onClick={handleLogout}>
              Đăng xuất
            </button>
            <button className="popup-button" onClick={toggleLogoutPopup}>
              Hủy
            </button>
          </div>
        </>
      )}
    </header>
  );
}
