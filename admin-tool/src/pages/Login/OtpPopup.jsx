import { useState } from "react";
import "./OtpPopup.css";

function OtpPopup({ onClose, onVerify, user }) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false); // สถานะสำหรับ loading
  const [error, setError] = useState(""); // สำหรับข้อความแสดงข้อผิดพลาด

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (/[^0-9]/.test(value)) return; // ห้ามกรอกเป็นตัวอักษร

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      document.getElementById(`otp-input-${index + 1}`).focus(); // ไปช่องถัดไป
    }
  };

  // ฟังก์ชันเพื่อรองรับการวาง (paste) ของ OTP ทั้งหมดในครั้งเดียว
  const handlePaste = (e) => {
    const pastedValue = e.clipboardData.getData("text").slice(0, 6); // ได้ข้อมูลที่วางลงมาจาก clipboard และจำกัดเป็น 6 ตัว
    const newOtp = [...otp];
    for (let i = 0; i < pastedValue.length; i++) {
      newOtp[i] = pastedValue[i]; // กรอกแต่ละตัวลงในช่อง
    }
    setOtp(newOtp);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // ตั้งค่าให้เริ่ม loading
    setError(""); // รีเซ็ตข้อความผิดพลาดเมื่อเริ่มส่งข้อมูล
    try {
      const otpCode = otp.join(""); // รวม OTP เป็นรหัสเดียว
      const isValid = await onVerify(user.userId, otpCode); // ตรวจสอบ OTP ที่กรอก
      if (!isValid) {
        setError("Invalid OTP! Please try again."); // ถ้า OTP ผิดให้แสดงข้อความผิดพลาด
        setOtp(["", "", "", "", "", ""]); // รีเซ็ตช่อง OTP
      }
    } catch (error) {
      console.error("Error during OTP verification:", error);
      setError("Something went wrong. Please try again."); // กรณีเกิดข้อผิดพลาดจากเซิร์ฟเวอร์
    } finally {
      setIsLoading(false); // หยุด loading เมื่อเสร็จสิ้น
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
                onPaste={handlePaste} // เพิ่มการรองรับการวางข้อมูล
                className="otp-input"
                autoFocus={index === 0} // ให้ช่องแรกมีการ focus โดยอัตโนมัติ
              />
            ))}
          </div>
          <div className="otp-buttons">
            <button type="submit" disabled={isLoading}>
              {" "}
              {/* ปิดปุ่มขณะกำลังโหลด */}
              {isLoading ? (
                <div className="spinner"></div> // แสดง spinner ที่ปุ่ม
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
