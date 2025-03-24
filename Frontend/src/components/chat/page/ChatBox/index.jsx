import { useEffect, useContext, useRef } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm"; // Import remark-gfm

import InputMessage from "../inputMessage";
import "./style.css";
import { ChatContext } from "../../../../contexts/ChatContext";

export default function ChatBoxConTent() {
  const { MessageChat, isLoading, roomId } = useContext(ChatContext);
  const chatEndRef = useRef(null);
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [MessageChat]);

  return (
    <div className="ChatBoxConTent relative ">
      <main className="container__message">
        {MessageChat.map((text, index) => (
          <div key={index}>
            <div className=" flex gap-5 justify-end">
              {text.role === "assistant" && (
                <div className="logo__chat logo__none min-w-10 min-h-10">
                  <div className="logo__chat--img">
                    <img src="../../../../src/assets/user/logo.svg" />
                  </div>
                </div>
              )}
              <div
                className={` flex role_admin-text ${
                  text.role === "user" ? "justify-end" : "gap-4 items-start"
                }`}
              >
                <div
                  className={` flex ${
                    text.role === "user"
                      ? "content__chat--user w-full "
                      : "content__chat"
                  }`}
                >
                  <Markdown remarkPlugins={[remarkGfm]}>
                    {text.content.trim("")}
                  </Markdown>
                </div>
              </div>
            </div>
          </div>
        ))}
        {/* {<Markdown remarkPlugins={[remarkGfm]}>{text ?? null}</Markdown>} */}
        {/* loadaing */}
        {isLoading && (
          <div className="flex gap-4 items-start">
            <div className="logo__chat logo__none w-10 h-w-10">
              <img src="../../../../src/assets/user/logo.svg" />
            </div>
            <>
              <div className="loading-indicator">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            </>
          </div>
        )}
        <div ref={chatEndRef} />
      </main>
      {/* <Markdown>{markdown}</Markdown> */}
      {/* {!roomId && <div className="hello-world">Hello World</div>} */}
      <div className={roomId ? `inputMessage` : "inputMessages "}>
        <div className={roomId ? "" : "inputtet "}>
          <InputMessage />
        </div>
      </div>
    </div>
  );
}
