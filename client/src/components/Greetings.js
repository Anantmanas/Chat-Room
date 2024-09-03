import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "./Greeting.css";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

const Greeting = ({ setCustomUsername, authToken }) => {
  const [username, setUsername] = useState("");
  const [name, setName] = useState("User");

  const navigate = useNavigate();

  useEffect(() => {
    if (authToken) {
      try {
        const decodedToken = jwtDecode(authToken);
        setName(decodedToken.name || "User");
      } catch (error) {
        console.error("Error decoding token:", error);
        navigate("/");
      }
    }
  }, [authToken, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error("Username cannot be empty");
      return;
    }
    try {
      const res = await axios.post(
        "https://mernback-lsed.onrender.com/auth/set-username",
        { username },
        {
          headers: {
            "x-auth-token": authToken,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.data.customUsername) {
        setCustomUsername(res.data.customUsername);
        toast.success("Great Choice 👍");
        setTimeout(() => navigate("/chatroom"), 2000);
      } else {
        console.error("Failed to set username.");
      }
    } catch (err) {
      console.error(
        err.response?.data?.msg ||
          "An error occurred while setting the username."
      );
    }
  };

  return (
    <div className="greeting-container">
      <Toaster position="top-center" reverseOrder={false} />
      <h1>Hey {name}! 🎉</h1>
      <p>Welcome to the chatroom! Ready to pick a cool username? 😎</p>
      <p>Choose a name that'll make everyone say, "Wow, that's awesome!" 🌟</p>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button className="send-btn" type="submit">
          Set Username
        </button>
      </form>
    </div>
  );
};

export default Greeting;
