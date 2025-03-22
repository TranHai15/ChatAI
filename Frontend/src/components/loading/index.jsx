// src/components/LoadingBee
import "./style.css"; // Import CSS cho animation

const LoadingBee = () => {
  return (
    <div className="loading-container">
      <img
        src="https://png.pngtree.com/png-vector/20230903/ourmid/pngtree-3d-bee-with-smile-face-cartoon-style-rendered-object-illustration-png-image_9956050.png"
        alt="Bee"
        className="loading-bee"
      />
      <div className="loading-text">Đang tải, xin chờ...</div>
    </div>
  );
};

export default LoadingBee;
