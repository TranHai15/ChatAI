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
  const { isLogin, isRole, Navigate, Location, token } =
    useContext(AuthContext);
  useEffect(() => {
    const checkLoginStatus = () => {
      try {
        if (isLogin && isRole !== null) {
          if (token) {
            const decoded = jwtDecode(token);
            const { role_id } = decoded;
            if (role_id === 1) {
              return;
            } else {
              Navigate("/login");
            }
          }
        } else {
          Navigator("/login");
        }
      } catch (error) {
        console.error("Error decoding token:", error);
      } finally {
        // console.log("message");
      }
    };

    checkLoginStatus();
  }, [isLogin, Location.pathname]);

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
