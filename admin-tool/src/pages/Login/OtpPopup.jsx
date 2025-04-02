import { useState } from "react";
import "./OtpPopup.css";

function OtpPopup({ onClose, onVerify, user }) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false); 
  const [error, setError] = useState(""); 

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (/[^0-9]/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      document.getElementById(`otp-input-${index + 1}`).focus(); 
    }
  };

  const handlePaste = (e) => {
    const pastedValue = e.clipboardData.getData("text").slice(0, 6); 
    const newOtp = [...otp];
    for (let i = 0; i < pastedValue.length; i++) {
      newOtp[i] = pastedValue[i]; 
    }
    setOtp(newOtp);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); 
    setError(""); 
    try {
      const otpCode = otp.join("");
      const isValid = await onVerify(user.userId, otpCode); 
      if (!isValid) {
        setError("Invalid OTP! Please try again."); 
        setOtp(["", "", "", "", "", ""]); 
      }
    } catch (error) {
      console.error("Error during OTP verification:", error);
      setError("Something went wrong. Please try again."); 
    } finally {
      setIsLoading(false); 
    }
  };

  return (
    <div className="otp-modal">
      <div className="otp-box">
        <h3>Enter OTP</h3>
        {error && <p className="error-message">{error}</p>}{" "}
        {/* แสดงข้อความผิดพลาด */}
        <form onSubmit={handleSubmit}>
          <div className="otp-inputs">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-input-${index}`}
                type="text"
                value={digit}
                maxLength={1}
                onChange={(e) => handleChange(e, index)}
                onPaste={handlePaste} 
                className="otp-input"
                autoFocus={index === 0} 
              />
            ))}
          </div>
          <div className="otp-buttons">
            <button type="submit" disabled={isLoading}>
              {" "}
              {/* ปิดปุ่มขณะกำลังโหลด */}
              {isLoading ? (
                <div className="spinner"></div> 
              ) : (
                "Verify"
              )}
            </button>
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
