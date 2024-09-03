import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import "./Auth.css";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";

const API_BASE_URL = "https://mernback-lsed.onrender.com/auth";

const validateToken = async (token) => {
  await axios.post(`${API_BASE_URL}/validate-token`, { token });
  return axios.get(`${API_BASE_URL}/check-username`, {
    headers: { "x-auth-token": token },
  });
};

const Auth = ({ setAuthToken }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();
  const isFirstRender = useRef(true);

  const toggleForm = () => setIsLogin(!isLogin);

  const handleTokenValidation = useCallback(async () => {
    if (!isFirstRender.current) return;
    isFirstRender.current = false;
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (!token || localStorage.getItem("authToken") === token) return;

    toast.loading("Authenticating...", { id: "authToast" });

    try {
      const response = await validateToken(token);
      const { hasCustomUsername } = response.data;

      localStorage.setItem("authToken", token);
      setAuthToken(token);

      toast.dismiss("authToast");
      if (hasCustomUsername) {
        toast.success("Logged in Successfully!");
        setTimeout(() => navigate("/chatroom"), 2000);
      } else {
        toast.success("Register successful!");
        setTimeout(() => navigate("/greeting"), 2000);
      }
    } catch (err) {
      console.error("Error during authentication:", err);
      toast.dismiss("authToast");
      toast.error("Authentication failed, please try again.");
      setTimeout(() => navigate("/"), 2000);
    }
  }, [navigate, setAuthToken]);

  useEffect(() => {
    handleTokenValidation();
  }, [handleTokenValidation]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${API_BASE_URL}/${isLogin ? "login" : "signup"}`,
        formData
      );

      setAuthToken(res.data.token);
      localStorage.setItem("authToken", res.data.token);
      if (isLogin) {
        toast.success("Logged in Successfully!");
        setTimeout(() => navigate("/chatroom"), 2000);
      } else {
        toast.success("Registered successfully!");
        setTimeout(() => navigate("/greeting"), 2000);
      }
    } catch (err) {
      console.error(err.response?.data?.msg || "An error occurred");
      toast.error(
        err.response?.data?.msg || "Invalid credentials. Please try again."
      );
    }
  };

  const handleOAuth = (provider) => {
    toast.loading(`Connecting to ${provider}...`, { id: "oauthLoading" });
    window.location.href = `${API_BASE_URL}/${provider}`;
  };

  return (
    <div className="auth-page">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="auth-left">
        <div className="auth-container">
          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <input
                type="text"
                name="name"
                placeholder="Name"
                onChange={handleChange}
                required
              />
            )}
            <input
              type="email"
              name="email"
              placeholder="Email"
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              onChange={handleChange}
              required
            />
            <div className="button-container">
              <button type="submit" className="btn">
                {isLogin ? "Login" : "Sign Up"}
              </button>
              <button type="button" className="btn" onClick={toggleForm}>
                {isLogin
                  ? "Don't have an account? Sign Up"
                  : "Already have an account? Login"}
              </button>
            </div>
          </form>
          <div className="button-container">
            <button
              className="google-btn"
              onClick={() => handleOAuth("google")}
            >
              <div className="google-icon-wrapper">
                <img
                  className="google-icon"
                  src="https://developers.google.com/identity/images/g-logo.png"
                  alt="Google Sign-In"
                />
              </div>
              <p className="btn-text">
                <b>Sign in with Google</b>
              </p>
            </button>
            <button
              className="github-btn"
              onClick={() => handleOAuth("github")}
            >
              <img
                className="github-icon"
                src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
                alt="GitHub Sign-In"
              />
              <span>Continue with GitHub</span>
            </button>
          </div>
        </div>
      </div>
      <div className="auth-right">
        <div className="brand-container">
          <h1>ChatRoom</h1>
          <p>"Powered by MERN, Driven by Conversations"</p>
          <img src="../img/MERN-logo.png" alt="MERN Logo" />
        </div>
      </div>
    </div>
  );
};

export default Auth;
