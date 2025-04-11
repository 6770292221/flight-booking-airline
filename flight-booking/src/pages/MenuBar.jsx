import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../apis/auth";

const MenuBar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null); // เก็บข้อมูลผู้ใช้
  const navigate = useNavigate();

  // ตรวจสอบว่า user login แล้วหรือยังจาก localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      // ดึงข้อมูลผู้ใช้จาก localStorage ถ้ามี
      const userData = JSON.parse(localStorage.getItem("user"));
      setUser(userData);
    }
  }, []);

  const handleLogin = () => {
    navigate("/login"); // ไปยังหน้า login
  };

  const handleLogout = async () => {
    try {
      // เรียก logout API
      await logoutUser();

      // Clear all items from localStorage
      localStorage.clear(); // ลบข้อมูลทั้งหมดจาก localStorage

      setIsLoggedIn(false); // อัปเดตสถานะ logout
      setUser(null); // ลบข้อมูลผู้ใช้
      navigate("/"); // ไปที่หน้าแรกหลังจาก logout
    } catch (error) {
      console.error("Logout failed", error);
      // แสดงข้อความหาก logout ล้มเหลว
    }
  };

  const handleRegister = () => {
    navigate("/register"); // ไปยังหน้า register
  };

  return (
    <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white p-4 shadow-lg flex justify-between items-center w-full">
      {/* Brand Name */}
      <div className="text-2xl font-bold tracking-wider">
        <span className="font-extrabold">Flight Booking</span> Airline
      </div>

      {/* Navigation Links */}
      <div className="space-x-6 hidden md:flex">
        <button
          className="text-white hover:text-yellow-400 transition duration-300"
          onClick={() => navigate("/")}
        >
          Home
        </button>

        {/* แสดงปุ่ม Booking และ History เฉพาะเมื่อผู้ใช้ login แล้ว */}
        {isLoggedIn && (
          <>
            <button
              className="text-white hover:text-yellow-400 transition duration-300"
              onClick={() => navigate("/booking")}
            >
              My Booking
            </button>
            <button
              className="text-white hover:text-yellow-400 transition duration-300"
              onClick={() => navigate("/history")}
            >
              History
            </button>
          </>
        )}
      </div>

      {/* Login/Register/Logout Button */}
      <div className="flex space-x-4">
        {isLoggedIn ? (
          <>
            <span className="text-white font-semibold">{user?.firstName}</span>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-md transition duration-300"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-md transition duration-300"
              onClick={handleLogin}
            >
              Login
            </button>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-md transition duration-300"
              onClick={handleRegister}
            >
              Register
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default MenuBar;
