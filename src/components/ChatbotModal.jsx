import { useState } from "react";
import "./ChatbotModal.css";

export default function ChatbotModal({ isOpen, onClose }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      type: "bot",
      text: "안녕하세요! MOYA 챗봇입니다. 제주도 여행에 대해 궁금한 것이 있으시면 언제든 물어보세요! 🏝️",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const handleSend = () => {
    if (message.trim()) {
      // 사용자 메시지 추가
      const userMessage = {
        type: "user",
        text: message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, userMessage]);
      setMessage("");

      // 봇 응답 시뮬레이션 (실제로는 API 호출)
      setTimeout(() => {
        const botResponse = {
          type: "bot",
          text: "죄송합니다. 현재 개발 중인 기능입니다. 곧 더 나은 서비스로 찾아뵙겠습니다! 😊",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, botResponse]);
      }, 1000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="chatbot-modal" onClick={(e) => e.stopPropagation()}>
        {/* 헤더 */}
        <div className="modal-header">
          <div className="header-info">
            <div className="bot-avatar">
              <i className="fa-solid fa-robot"></i>
            </div>
            <div className="bot-info">
              <h3>MOYA 챗봇</h3>
              <span className="status">온라인</span>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* 메시지 영역 */}
        <div className="messages-container">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.type}`}>
              {msg.type === 'bot' && (
                <div className="message-avatar">
                  <i className="fa-solid fa-robot"></i>
                </div>
              )}
              <div className="message-content">
                <div className="message-bubble">
                  {msg.text}
                </div>
                <div className="message-time">
                  {msg.time}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 입력 영역 */}
        <div className="input-container">
          <div className="input-wrapper">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="메시지를 입력하세요..."
              rows="1"
            />
            <button 
              className="send-btn" 
              onClick={handleSend}
              disabled={!message.trim()}
            >
              <i className="fa-solid fa-paper-plane"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}