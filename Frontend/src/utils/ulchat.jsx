import React, { useState } from "react";
import axios from "axios";
import "./style.css";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Thêm tin nhắn người dùng vào danh sách
    const newMessages = [...messages, { sender: "user", text: input }];
    setMessages(newMessages);
    setInput("");

    try {
      const response = await axios.post("http://localhost:3001/chat", {
        message: input,
      });

      // Thêm tin nhắn trả lời từ AI
      setMessages([
        ...newMessages,
        { sender: "bot", text: response.data.reply },
      ]);
    } catch (error) {
      setMessages([
        ...newMessages,
        { sender: "bot", text: "Có lỗi xảy ra, vui lòng thử lại!" },
      ]);
    }
  };

  return (
    <div className="App">
      <div className="chatbox">
        <div className="messages">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message ${msg.sender === "user" ? "user" : "bot"}`}
            >
              {msg.text}
            </div>
          ))}
        </div>
        <div className="input-area">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Nhập tin nhắn..."
          />
          <button onClick={sendMessage}>Gửi</button>
        </div>
      </div>
    </div>
  );
}

export default App;
