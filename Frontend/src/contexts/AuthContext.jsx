import { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode"; // Note: jwt-decode is default export
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext({});

// eslint-disable-next-line react/prop-types
export const AuthAppProvider = ({ children }) => {
  const [isLogin, setIsLogin] = useState(false);
  const [dataUser, setDataUser] = useState({});
  const [isRole, setIsRole] = useState(null);
  const [phongBanID, setPhongBanID] = useState(null);
  const [isLoad, setIsLoad] = useState(true); // Trạng thái loading
  const [token, setToken] = useState(""); // Trạng thái loading
  const Navigate = useNavigate();
  const Location = useLocation();
  useEffect(() => {
    const checkLoginStatus = () => {
      try {
        const activeUser = JSON.parse(localStorage.getItem("active"));

        if (activeUser && activeUser.isLogin) {
          setIsLogin(activeUser.isLogin);
          setDataUser(activeUser.dataLogin.dataUser);
          setPhongBanID(activeUser.dataLogin.dataUser.phong_ban_id);
          // Decode JWT token để lấy thông tin role
          setToken(activeUser.dataLogin?.accessToken);
          if (activeUser.dataLogin?.accessToken) {
            const decoded = jwtDecode(activeUser.dataLogin?.accessToken);
            const { role } = decoded;
            setIsRole(role);
          }
        } else {
          // Nếu không tìm thấy người dùng, reset trạng thái
          setIsLogin(false);
          setDataUser({});
          setIsRole(null);
        }
      } catch (error) {
        console.error("Error decoding token:", error);
        setIsLogin(false); // Đảm bảo trạng thái chính xác khi gặp lỗi
      } finally {
        setIsLoad(false); // Đánh dấu tải xong
      }
    };

    checkLoginStatus();
  }, [Location.pathname]);
  // Nếu đang tải, có thể hiển thị một loading spinner hoặc trạng thái tạm thời
  if (isLoad) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider
      value={{
        isLogin,
        dataUser,
        isRole,
        Navigate,
        Location,
        token,
        setIsLogin,
        phongBanID
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
