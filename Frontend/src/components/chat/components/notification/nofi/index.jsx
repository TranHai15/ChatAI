import { useContext, useEffect } from "react";
import moment from "moment-timezone";

import "./style.css";
import { ChatContext } from "../../../../../contexts/ChatContext";
import { io } from "socket.io-client";
export default function NotificationList() {
  function dateTime() {
    return moment().tz("Asia/Ho_Chi_Minh").format("YYYY-MM-DD HH:mm:ss");
  }
  const { notifications, setNotifications, setNotification_cont } =
    useContext(ChatContext);
  const socket = io("http://localhost:3000"); // Kết nối với server WebSocket

  const markNotificationAsRead = (id, status) => {
    // Gửi sự kiện đến server để cập nhật thông báo
    const update_at = dateTime();
    console.log(status);
    if (status == 0) {
      socket.emit("markNotificationAsRead", {
        task_id: id,
        update_at: update_at
      });
      // Cập nhật trạng thái trên frontend ngay lập tức
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === id ? { ...notif, is_read: true } : notif
        )
      );

      // Cập nhật số lượng thông báo chưa đọc
      setNotification_cont((prevCount) => Math.max(prevCount - 1, 0));
    }
  };

  //
  return (
    <ul className="notification-list">
      {notifications.map((item) => {
        // Tính màu hiển thị cho deadline
        const deadlineDate = new Date(item.deadline);
        const now = new Date();
        let deadlineColor = "green"; // Mặc định là xanh
        if (deadlineDate < now) {
          deadlineColor = "red"; // Deadline đã qua
        } else if (deadlineDate - now < 24 * 60 * 60 * 1000) {
          deadlineColor = "yellow"; // Deadline trong vòng 24 giờ
        }

        // Định dạng deadline theo local time
        const formattedDeadline = deadlineDate.toLocaleString();

        return (
          <li
            key={item.id}
            className={`notification-item ${item.is_read ? "read" : "unread"}`}
            onClick={() => markNotificationAsRead(item.id, item.is_read)}
          >
            {item.task}
            <div
              className="notification-deadline"
              style={{ color: deadlineColor }}
            >
              Deadline: {formattedDeadline}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
