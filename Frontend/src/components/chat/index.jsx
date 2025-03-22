import { useContext, useEffect } from "react";
import chatbox from "../../api/chatbox";
import { useState } from "react";
import LoadingBee from "../loading";
import ChatBoxConTent from "./page/ChatBox";
import Header from "./components/header";
import Sidebar from "./components/sidebar";
import "./style.css";
import { ChatContext } from "../../contexts/ChatContext";
import { AuthContext } from "../../contexts/AuthContext";
// import { showNotification } from "../../func";

export default function Chat() {
  const { isSidebar } = useContext(ChatContext);
  const { isLogin, isRole } = useContext(AuthContext);
  useEffect(() => {
    // const fetchData = async () => {
    //   const data = await chatbox.getAll();
    //   // console.log("🚀 ~ fetchData ~ data:", data);
    // };
    // // console.log("islogin", isLogin);
    // fetchData();
  }, []);
  // const [isLoading, setIsLoading] = useState(true);

  // useEffect(() => {
  //   // Giả lập trạng thái tải dữ liệu
  //   const timer = setTimeout(() => {
  //     setIsLoading(false);
  //   }, 1000); // 3 giây

  //   return () => clearTimeout(timer);
  // }, []);
  // showNotification("Đăng nhập thành công!", "success");
  // console.log("islogoin", isLogin);
  // console.log("isRole", isRole);
  return (
    <div>
      {/* {isLoading ? (
        {/* <LoadingBee /> */}
      {/* ) : (  */}
      <div className="containers">
        {isSidebar && (
          <div className="sidebar">
            <Sidebar />
          </div>
        )}
        <div className="content">
          <header>
            <Header />
          </header>
          <main>
            <ChatBoxConTent />
          </main>
        </div>
      </div>
      {/* )} */}
    </div>
  );
}
