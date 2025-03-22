import React, { useState, useRef, useEffect, useContext } from "react";
import { flushSync } from "react-dom";
import "./style.css";
import { ChatContext } from "../../../../contexts/ChatContext";
import { useLocation, useNavigate } from "react-router-dom";
import axiosClient from "../../../../api/axiosClient";
export default function InputMessage() {
  const {
    message,
    setMessage,
    MessageChat,
    isSending,
    SetMessagesChat,
    setIsSending,
    setRoomId,
    setIsLoading,
    isLoading
  } = useContext(ChatContext);

  const navigate = useNavigate();
  const roomIdLoca = useRef(null);
  const location = useLocation();
  const existingRoomId = location.pathname;
  const tachchuoi = existingRoomId.split("/");
  const dauchuoi = tachchuoi[1];
  const cuoichuoi = tachchuoi[2];

  useEffect(() => {
    roomIdLoca.current = cuoichuoi;
    setRoomId(roomIdLoca.current);
  }, [location.pathname]);

  function checkUrlRoom() {
    if (existingRoomId === "/" || existingRoomId.length <= 2) {
      const Idmaphongngaunhien = generateRoomId();
      roomIdLoca.current = Idmaphongngaunhien;
      navigate(`/c/${Idmaphongngaunhien}`);
      localStorage.setItem("room", Idmaphongngaunhien);
    } else {
      roomIdLoca.current = cuoichuoi;
    }
  }

  // ham cho du lieu gui ve va them vao db
  const handleResAl = async () => {
    const ContentModal = {
      role: "system",
      content:
        "Bạn là một trợ lí ảo của trường 'Cao đẳng FPT Polytechnic'. Dưới đây là các thông tin về bạn:\n1. Bạn tên là '13Bee'.Trong đó: Số '13' là số ưa thích của 'Tập đoàn FPT', 'Bee' là 'linh vật' của trường 'Cao đẳng FPT Polytechnic'. Bạn là một trợ lí ảo của trường 'Cao đẳng FPT Polytechnic'.\n2. Bạn được tạo ra vào ngày '01/10/2024'. Người tạo ra bạn là 'AnTrc2'.\n3. Nhiệm vụ của bạn là giúp sinh viên hỏi đáp về trường một cách chính xác.\n4. Trả lời một cách ngắn, đầy đủ.\n5. Khi nhận được lời chào, hãy đáp lại một cách lịch sự\nNhững từ tôi cho vào trong '' thì cho vào trong '**'"
    };

    const dataMessage = {
      messages: [
        ContentModal,
        ...MessageChat,
        { role: "user", content: message }
      ]
    };
    try {
      const apiUrl = import.meta.env.VITE_API_URL_AL;
      const response = await fetch(`${apiUrl}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(dataMessage)
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      // const daya = await response.json();

      // // console.log("data", daya.message);
      // SetMessagesChat((e) => {
      //   return [...e, { role: "assistant", content: daya.message }];
      // });

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let aiResponse = "";

      // Đọc luồng dữ liệu từ API AI
      let accumulatedResponse = ""; // Để gom tất cả dữ liệu từ aiResponse

      while (true) {
        const { value, done } = await reader.read();
        // if (isLoading !== false) {
        setIsLoading(false);
        // }
        if (done) break;

        const text = decoder.decode(value);
        const lines = text;

        accumulatedResponse += lines; // Gom dữ liệu vào accumulatedResponse

        flushSync(() => {
          SetMessagesChat((prevMessages) => {
            const lastMessage = prevMessages[prevMessages.length - 1];
            if (lastMessage?.role === "assistant") {
              return [
                ...prevMessages.slice(0, -1),
                { ...lastMessage, content: accumulatedResponse } // Cập nhật dữ liệu ngay
              ];
            }
            return [
              ...prevMessages,
              { role: "assistant", content: accumulatedResponse } // Nếu không có, tạo một tin nhắn mới
            ];
          });
        });
      }
      await InsertMessageUser(roomIdLoca.current, {
        role: "user",
        content: message
      });
      await InsertMessageUser(roomIdLoca.current, {
        role: "assistant",
        content: accumulatedResponse
      });

      // console.log("🚀 ~ handleResAl ~ aiResponse:", aiResponse);
    } catch (error) {
      console.error("Error:", error);
      SetMessagesChat((prevMessages) => [
        ...prevMessages,
        { role: "assistant", content: "Đã có lỗi xảy ra. Vui lòng thử lại." }
      ]);
    }
    setIsLoading(false);
    setIsSending(false);
  };
  // hàm tạo số phòng ngẫu nhiên
  function generateRoomId() {
    const timestamp = Date.now();
    const randomPart = Math.floor(Math.random() * 10000000000);
    return timestamp + "_" + randomPart; // Ghép thời gian và phần ngẫu nhiên
  }

  const textareaRef = useRef(null);
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleInputChange = (e) => {
    setMessage(e.target.value);
  };

  const validateInput = (input) => {
    return input.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;") || "";
  };

  const handleSummit = async () => {
    const dataMessage = validateInput(message);
    if (!dataMessage) return;
    SetMessagesChat((prev) => [
      ...prev,
      { role: "user", content: dataMessage }
    ]);
    checkUrlRoom();
    setMessage("");
    setIsLoading(true);
    setIsSending(true);
    await handleResAl();
  };

  const clickEnter = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSummit();
    }
  };

  const InsertMessageUser = async (room, message) => {
    const activeUser = JSON.parse(localStorage.getItem("active"));
    const id = activeUser.dataLogin.dataUser.id;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const res = await axiosClient.post("http://localhost:3000/user/send", {
          room: room,
          message: message,
          id: id
        });
        if (res.status === 200 || res.status === 201) {
          console.log("Message saved successfully!");
          return;
        }
      } catch (error) {
        console.error("Retrying... Error:", error);
      }
    }
    console.error("Failed to save message after 3 attempts.");
  };
  return (
    <div className=" inputress ">
      <div className="flex  justify-between gap-1">
        <div className="w-[93%] relative">
          <textarea
            ref={textareaRef}
            className=" input__mess h-11 your-element w-full max-h-32 rounded-3xl  pl-5 resize-none outline-none  transition-all duration-200 overflow-y-auto absolute bottom-[0px] "
            rows={1}
            placeholder="Send Messages..."
            value={message}
            onChange={handleInputChange}
            onKeyDown={clickEnter}
          />
        </div>
        <div className="min-w-11 max-w-11 flex ">
          <button type="submit" className=" p-1 ml-auto">
            {!isSending && (
              <img
                onClick={handleSummit}
                className=" object-contain"
                src="../../../../src/assets/svg-submit.svg"
              />
            )}
            {isSending && (
              <img
                className="w-9 object-contain"
                src="../../../../src/assets/loaing.svg"
              />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
