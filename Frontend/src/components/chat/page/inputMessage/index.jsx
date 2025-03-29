import { useRef, useEffect, useContext } from "react";
import { flushSync } from "react-dom";
import "./style.css";
import { ChatContext } from "../../../../contexts/ChatContext";
import { AuthContext } from "../../../../contexts/AuthContext";
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
    setIsLoading
  } = useContext(ChatContext);
  const { isLogin, dataUser, isRole, Navigate, Location, phongBanID } =
    useContext(AuthContext);

  const roomId = useRef(null);
  const existingRoomId = Location.pathname;
  const url = existingRoomId.split("/");
  const urlId = url[2];

  useEffect(() => {
    if (isLogin && isRole !== null) {
      roomId.current = urlId;
      setRoomId(roomId.current);
    }
  }, [Location.pathname]);

  function checkUrlRoom() {
    if (existingRoomId === "/" || existingRoomId.length <= 2) {
      const idPhong = generateRoomId();
      roomId.current = idPhong;
      Navigate(`/c/${idPhong}`);
      localStorage.setItem("room", idPhong);
    } else {
      roomId.current = urlId;
    }
  }

  // ham cho du lieu gui ve va them vao db
  const handleResAl = async () => {
    const { id, fullname, phong_ban, username, role_name, description } =
      dataUser;
    const dataMessage = {
      messages: [...MessageChat, { role: "user", content: message }],
      user_info: {
        id: id,
        fullname: fullname,
        phong_ban: phong_ban,
        username: username,
        role_name: role_name,
        description: description,
        Phong_Ban_id: phongBanID,
        Phong_Hanh_Chinh: 0
      }
    };
    try {
      const apiUrl = import.meta.env.VITE_API_URL_AL;
      const response = await fetch(`${apiUrl}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_API_KEY}`
        },
        body: JSON.stringify(dataMessage)
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
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
      await InsertMessageUser(roomId.current, {
        role: "user",
        content: message
      });
      await InsertMessageUser(roomId.current, {
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
    const id = dataUser.id;
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
