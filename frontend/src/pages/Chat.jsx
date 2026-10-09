import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config/api";

function Chat({ requirement, seller, onClose }) {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");

  const userId = Number(localStorage.getItem("userId"));
  const token = localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  // Load messages
  const loadMessages = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/messages/requirement/${requirement.id}`,
        { headers }
      );

      setMessages(response.data);
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  // Send message
  const sendMessage = async (e) => {
    e.preventDefault();

    if (!messageText.trim()) {
      return;
    }

    try {
      await axios.post(
        `${API_BASE_URL}/api/messages`,
        {
          message: messageText,

          sender: {
            id: userId,
          },

          receiver: {
            id: localStorage.getItem("role") === "SELLER"
              ? requirement.customer.id
              : seller.id,
          },

          requirement: {
            id: requirement.id,
          },
        },
        { headers }
      );

      setMessageText("");

      loadMessages();

    } catch (error) {
      console.error("Error sending message:", error);

      alert(
        error.response?.data?.message ||
        "Failed to send message"
      );
    }
  };

  return (
    <div className="chat-container">

      <div className="chat-header">

        <div>
          <h3>Chat</h3>

          <p>
            Requirement: {requirement.title}
          </p>

          <p>
            Seller: {seller.name}
          </p>
        </div>

        <button onClick={onClose}>
          Close
        </button>

      </div>

      <div className="chat-messages">

        {messages.length === 0 ? (

          <p>No messages yet.</p>

        ) : (

          messages.map((msg) => (

            <div
              key={msg.id}
              className={
                msg.sender?.id === userId
                  ? "message sent"
                  : "message received"
              }
            >

              <p>{msg.message}</p>

              <small>
                {msg.sentAt
                  ? new Date(msg.sentAt).toLocaleString()
                  : ""}
              </small>

            </div>

          ))

        )}

      </div>

      <form
        className="chat-form"
        onSubmit={sendMessage}
      >

        <input
          type="text"
          placeholder="Type your message..."
          value={messageText}
          onChange={(e) =>
            setMessageText(e.target.value)
          }
        />

        <button type="submit">
          Send
        </button>

      </form>

    </div>
  );
}

export default Chat;