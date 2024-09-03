import React, { useState, useEffect } from "react";
import "./App.css";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";

const ChatRoom = () => {
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(true);
  const [messageToDelete, setMessageToDelete] = useState(null);

  const navigate = useNavigate();
  useEffect(() => {
    fetchUsername();
    fetchMessages();
    const interval = setInterval(() => {
      fetchMessages();
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const fetchUsername = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        "http://localhost:5000/auth/check-username",
        {
          headers: {
            "x-auth-token": token,
          },
        }
      );
      if (!response.ok) throw new Error("Network response was not ok.");
      const data = await response.json();
      if (data.username) {
        setUser(data.username);
      }
    } catch (error) {
      console.error("Error fetching username:", error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch("http://localhost:5000/messages");
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const sendMessage = async () => {
    if (!message) {
      setError("Say something!");
      return;
    }
    try {
      await fetch("http://localhost:5000/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": localStorage.getItem("authToken"),
        },
        body: JSON.stringify({ user: user, message }),
      });
      setMessage("");
      setError("");
      fetchMessages();
    } catch (error) {
      console.error("Error sending message:", error);
      setError("An error occurred while sending the message.");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:5000/auth/logout");
      localStorage.removeItem("authToken");
      toast.success("Logged out successfully!");
      setTimeout(() => navigate("/"), 2000);
    } catch (error) {
      toast.error("Error logging out, please try again.");
    }
  };

  const handleDelete = async (messageId) => {
    try {
      await fetch(`http://localhost:5000/messages/${messageId}`, {
        method: "DELETE",
        headers: {
          "x-auth-token": localStorage.getItem("authToken"),
        },
      });
      fetchMessages();
      setMessageToDelete(null); // Reset state
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  const handleLongPress = (messageId) => {
    setMessageToDelete(messageId);
  };

  const closeModal = () => setShowModal(false);

  return (
    <div>
      <nav className="navbar">
        <Toaster position="top-center" reverseOrder={false} />
        <h1>Chat Room</h1>
        <div className="navbar-right">
          <h2>Welcome, {user}</h2>
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>🚫 Chatroom Rule Alert! 🚫</h2>
            <p>Hey, Chat Star! 🌟</p>
            <p>
              Keep it friendly and fun—**NO ABUSIVE LANGUAGE** here! If we catch
              you being rude, we'll have to **BANISH** you to the “No Chat
              Zone.” 👋😅
            </p>
            <button className="close-modal" onClick={closeModal}>
              Got It!
            </button>
          </div>
        </div>
      )}

      <div className="chat-room">
        <ul>
          {messages.map((msg) => (
            <li
              key={msg._id}
              className="message"
              onContextMenu={(e) => {
                e.preventDefault();
                handleLongPress(msg._id);
              }}
            >
              <strong>{msg.user}:</strong> {msg.message}
              <span className="timestamp">
                {new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </span>
              {(messageToDelete === msg._id || user === msg.user) && (
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(msg._id)}
                >
                  🗑️
                </button>
              )}
            </li>
          ))}
          {error && <div className="error">{error}</div>}
        </ul>

        <div className="input-container">
          <input
            type="text"
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button className="send-btn" onClick={sendMessage}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
