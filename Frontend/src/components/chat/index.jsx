import { useContext } from "react";
import ChatBoxConTent from "./page/ChatBox";
import Header from "./components/header";
import Sidebar from "./components/sidebar";
import "./style.css";
import { ChatContext } from "../../contexts/ChatContext";
export default function Chat() {
  const { isSidebar } = useContext(ChatContext);

  return (
    <div>
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
    </div>
  );
}
