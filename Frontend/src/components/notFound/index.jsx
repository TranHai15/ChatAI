import "./style.css"; // Đảm bảo bạn đã tạo file CSS này

export default function NotFound() {
  return (
    <div className="notfound-container">
      <div className="notfound-content">
        <h1 className="notfound-title">404</h1>

        <p className="notfound-message">Page not found</p>
      </div>
    </div>
  );
}
