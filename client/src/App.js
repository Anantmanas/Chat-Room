import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Auth from "./components/Auth";
import Greeting from "./components/Greetings";
import ChatRoom from "./ChatRoom";

const App = () => {
  const [authToken, setAuthToken] = useState(null);
  const [customUsername, setCustomUsername] = useState("");

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Auth setAuthToken={setAuthToken} />} />
        <Route
          path="/auth/success"
          element={<Auth setAuthToken={setAuthToken} />}
        />
        <Route
          path="/greeting"
          element={
            <Greeting
              setCustomUsername={setCustomUsername}
              authToken={authToken}
            />
          }
        />
        <Route
          path="/chatroom"
          element={<ChatRoom username={customUsername} />}
        />
      </Routes>
    </Router>
  );
};

export default App;
