import Header from "./components/header/";
import Main from "./components/Main";
import Sidebar from "./components/sidebar/";
import "./style.css";
import { AuthContext } from "../../contexts/AuthContext";
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // Not

export default function Admin() {
  const Navigator = useNavigate();
  const { isLogin, setIsLogin, setIsRole, setInforUser } =
    useContext(AuthContext);
  useEffect(() => {
    const checkLoginStatus = () => {
      try {
        const activeUser = JSON.parse(localStorage.getItem("active"));
        // console.log("🚀 ~ checkLoginStatus ~ activeUser:", activeUser);

        if (activeUser && activeUser.isLogin) {
          setInforUser(activeUser);
          setIsLogin(true);

          // Decode JWT token để lấy thông tin role
          const token = activeUser.dataLogin?.accessToken;
          if (token) {
            const decoded = jwtDecode(token);
            // console.log("🚀 ~ checkLoginStatus ~ decoded:", decoded);
            const { role_id } = decoded;
            // console.log("🚀 ~ checkLoginStatus ~ role:", role_id);
            setIsRole(role_id);
            if (role_id === 1) {
              return;
            } else {
              Navigator("/");
            }
          }
        } else {
          setIsLogin(false);
          setInforUser({});
          setIsRole(-1);
          Navigator("/");
        }
      } catch (error) {
        console.error("Error decoding token:", error);
        setIsLogin(false); // Đảm bảo trạng thái chính xác khi gặp lỗi
      } finally {
        // console.log("message");
      }
    };

    checkLoginStatus();
  }, [isLogin, Navigator]);

  // console.log("islogoin", isLogin);
  // console.log("isRole", isRole);
  return (
    <div className="admin-layout">
      <div className="min-h-16">
        <div className="h-16">
          <Header />
        </div>
      </div>
      <div className="admin-body">
        <div className="w-[17%]">
          <div className="w-[295px] Sidebar">
            <Sidebar />
          </div>
        </div>
        <div className="Main">
          <Main />
        </div>
      </div>
    </div>
  );
}
