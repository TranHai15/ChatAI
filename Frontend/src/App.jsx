import { Routes, Route } from "react-router-dom";
import { Admin, Chat, Login, NotFound, Register } from "./components";
import { AppProvider } from "./contexts/ChatContext";
import { AuthAppProvider } from "./contexts/AuthContext";

export default function App() {
  return (
    <AuthAppProvider>
      <AppProvider>
        <Routes>
          {/* Các route chính */}
          <Route path="/" element={<Chat />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Register />} />

          {/* Route cha dành cho Admin */}
          <Route path="/admin/*" element={<Admin />} />
          <Route path="/c/:idRoom" element={<Chat />} />

          {/* Route mặc định nếu không khớp */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppProvider>
    </AuthAppProvider>
  );
}
