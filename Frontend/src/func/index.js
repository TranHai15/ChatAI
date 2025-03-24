// notification.js
import Swal from "sweetalert2"; // Import SweetAlert2

function showNotification(message, type = "success") {
  Swal.fire({
    icon: type, // type có thể là 'success', 'error', 'warning', 'info'
    title: message,
    showConfirmButton: true,
    timer: 3000 // Thông báo tự động biến mất sau 3 giây
  });
}

async function showConfirm(message) {
  const result = await Swal.fire({
    title: message,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Xác nhận",
    cancelButtonText: "Hủy",
    reverseButtons: true
  });

  return result.isConfirmed; // Trả về true nếu nhấn xác nhận, false nếu nhấn hủy
}
// Đảm bảo thư viện có thể sử dụng
export { showNotification, showConfirm };
