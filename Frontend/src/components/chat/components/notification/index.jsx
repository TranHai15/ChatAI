import NotificationList from "./nofi/index";
import "./style.css"; // File CSS cho toàn bộ trang thông báo

export default function NotificationPage() {
  return (
    <div className="notification-page ">
      <h1>Thông báo công việc</h1>
      <NotificationList />
    </div>
  );
}
