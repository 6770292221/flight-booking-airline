// src/pages/VerifyOTP/VerifyOTP.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { verifyOTP } from "@/apis/auth";
import "./VerifyOTP.css";

function VerifyOTP({ user }) {
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleVerify = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await verifyOTP(user.userId, otp); // ✅ เรียก API จริง
      const token = res.data.data.token;
      localStorage.setItem("token", token); // ✅ เก็บ token
      setMessage("✅ OTP verified successfully!");
      navigate("/home"); // ✅ ไปหน้า Home
    } catch (err) {
      setMessage("❌ Invalid OTP. Please try again.");
    }
  };

  return (
    <div className="otp-container">
      <h2 className="otp-title">Verify OTP</h2>
      <form onSubmit={handleVerify}>
        <input
          className="otp-input"
          type="text"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter 6-digit OTP"
        />
        <button type="submit" className="otp-button">
          Verify
        </button>
      </form>
      {message && <p className="otp-message">{message}</p>}
    </div>
  );
}

export default VerifyOTP;
