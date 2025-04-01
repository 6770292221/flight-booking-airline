import { useState } from "react";
import "./OtpPopup.css";

function OtpPopup({ onClose, onVerify, user }) {
  const [otp, setOtp] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onVerify(user.userId, otp);
  };

  return (
    <div className="otp-modal">
      <div className="otp-box">
        <h3>Enter OTP</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={otp}
            maxLength={6}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="6-digit OTP"
            className="otp-input"
          />
          <div className="otp-buttons">
            <button type="submit">Verify</button>
            <button type="button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default OtpPopup;
