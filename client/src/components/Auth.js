import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Auth.css";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";

const Auth = ({ setAuthToken }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const toggleForm = () => setIsLogin(!isLogin);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (!token || localStorage.getItem("authToken") === token) return;

    axios
      .post("http://localhost:5000/auth/validate-token", { token })
      .then(() => {
        localStorage.setItem("authToken", token);
        setAuthToken(token);
        return axios.get("http://localhost:5000/auth/check-username", {
          headers: { "x-auth-token": token },
        });
      })
      .then((response) => {
        const { hasCustomUsername } = response.data;
        if (hasCustomUsername) {
          setTimeout(() => navigate("/chatroom"), 1000);
        } else {
          toast.success("Register successful!");
          setTimeout(() => navigate("/greeting"), 1000);
        }
      })
      .catch((err) => {
        console.error("Error during authentication:", err);
        toast.error("Authentication failed, please try again.");
        setTimeout(() => navigate("/"), 2000);
      });
  }, [navigate, setAuthToken]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `http://localhost:5000/auth/${isLogin ? "login" : "signup"}`,
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
    toast.loading(`Connecting to ${provider}...`);
    setTimeout(() => {
      window.location.href = `http://localhost:5000/auth/${provider}`;
    }, 2000);
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
