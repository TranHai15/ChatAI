import { createContext, useContext, useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { io } from "socket.io-client";
import { showNotification } from "../func";
import { AuthContext } from "./AuthContext.jsx";
// eslint-disable-next-line react-refresh/only-export-components
export const ChatContext = createContext({});
// eslint-disable-next-line react/prop-types
export const AppProvider = ({ children }) => {
  const [isSidebar, setIsSidebar] = useState(true);
  const [message, setMessage] = useState("");
  const [MessageChat, SetMessagesChat] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [connectionError, setConnectionError] = useState(true);
  const [listUser, SetlistUser] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [notification_cont, setNotification_cont] = useState(0);
  const { isLogin, dataUser, isRole, Navigate, Location } =
    useContext(AuthContext);
  const fakeData = async (id) => {
    try {
      const res = await axiosClient.post("/user/notifications", { id: id });
      const soTb = res.data.Notification.filter((value) => {
        return value.is_read == 0;
      });
      setNotification_cont(soTb.length);
      setNotifications(res.data.Notification);
    } catch (error) {
      console.log(error);
    }
  };
  const id = dataUser.id;
  useEffect(() => {
    if (isLogin && isRole !== null) {
      fakeData(id);
    } else {
      Navigate("/login");
    }
  }, [Location.pathname]);

  const existingRoomId = location.pathname;
  const tachchuoi = existingRoomId.split("/");
  const chuoi = tachchuoi[1];
  useEffect(() => {
    // socket.on("connect", () => {
    //   console.log("⚡ Kết nối socket thành công:", socket.id);
    // });
    if (chuoi == "" || chuoi == "c") {
      const socket = io("http://localhost:3000"); // Kết nối với server WebSocket
      socket.on("notificationUpdated", () => {
        fakeData(id);
        showNotification("Có thông báo mới");
      });
      return () => {
        socket.off("notificationUpdated");
      };
    }
  }, []);
  return (
    <ChatContext.Provider
      value={{
        listUser,
        setNotification_cont,
        setNotifications,
        notifications,
        SetlistUser,
        isSidebar,
        setIsSidebar,
        message,
        setMessage,
        MessageChat,
        isSending,
        notification_cont,
        roomId,
        connectionError,
        SetMessagesChat,
        setIsSending,
        setRoomId,
        setConnectionError,
        setIsLoading,
        isLoading
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
