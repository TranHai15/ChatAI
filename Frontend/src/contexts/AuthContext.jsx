import { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode"; // Note: jwt-decode is default export

export const AuthContext = createContext({});

export const AuthAppProvider = ({ children }) => {
  const [isLogin, setIsLogin] = useState(false);
  const [inforUser, setInforUser] = useState({});
  const [isRole, setIsRole] = useState(-1);
  const [isLoading, setIsLoading] = useState(true); // Trạng thái loading

  useEffect(() => {
    const checkLoginStatus = () => {
      try {
        const activeUser = JSON.parse(localStorage.getItem("active"));

        if (activeUser && activeUser.isLogin) {
          setInforUser(activeUser);
          setIsLogin(true);

          // Decode JWT token để lấy thông tin role
          const token = activeUser.dataLogin?.accessToken;
          if (token) {
            const decoded = jwtDecode(token);
            const { role } = decoded;
            setIsRole(role);
          }
        } else {
          // Nếu không tìm thấy người dùng, reset trạng thái
          setIsLogin(false);
          setInforUser({});
          setIsRole(-1);
        }
      } catch (error) {
        console.error("Error decoding token:", error);
        setIsLogin(false); // Đảm bảo trạng thái chính xác khi gặp lỗi
      } finally {
        setIsLoading(false); // Đánh dấu tải xong
      }
    };

    checkLoginStatus();
  }, []);

  // Nếu đang tải, có thể hiển thị một loading spinner hoặc trạng thái tạm thời
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider
      value={{
        isLogin,
        setIsLogin,
        inforUser,
        setInforUser,
        isRole,
        setIsRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
