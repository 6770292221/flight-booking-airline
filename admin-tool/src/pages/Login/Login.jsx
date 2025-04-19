import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, verifyOTP } from "../../apis/auth";
import { showErrorPopup } from "../components/ErrorPopup";
import "./Login.css";
import OtpPopup from "./OtpPopup";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userData, setUserData] = useState(null);
  const [showOtp, setShowOtp] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(email, password);
      setUserData(res.data.data);
      setShowOtp(true);
    } catch (err) {
      const code = err?.response?.data?.code || "UNKNOWN";
      const message = err?.response?.data?.message || "Login failed.";
      showErrorPopup(code, message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (userId, otp) => {
    try {
      const res = await verifyOTP(userId, otp);
      const token = res.data.data.token;
      localStorage.setItem("token", token);
      navigate("/home");
    } catch (err) {
      const code = err?.response?.data?.code || "OTP_FAILED";
      const message = err?.response?.data?.message || "Invalid OTP.";
      showErrorPopup(code, message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">Login</h2>
        <form onSubmit={handleLogin}>
          <input
            className="login-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="login-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? <div className="spinner" /> : "Login"}
          </button>
        </form>
      </div>

      {showOtp && (
        <OtpPopup
          user={userData}
          onClose={() => setShowOtp(false)}
          onVerify={handleVerifyOtp}
        />
      )}
    </div>
  );
}

export default Login;
