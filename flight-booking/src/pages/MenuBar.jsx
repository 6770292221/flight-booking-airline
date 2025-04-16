import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../apis/auth";
import logo from "../assets/logo/chulaloka-logo.png";
import { jwtDecode } from "jwt-decode";
import UserDropdown from "./UserDropdown";
import { LogIn, UserPlus } from "lucide-react";

import {
  FaHome,
  FaSuitcase,
  FaHistory,
  FaPercent,
  FaPlaneDeparture,
} from "react-icons/fa";

const MenuBar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      try {
        const decoded = jwtDecode(token);
        setUser({
          firstName: decoded.firstName,
          lastName: decoded.lastName,
        });
      } catch (error) {
        console.error("Invalid token", error);
      }
    }
  }, []);

  const handleLogin = () => navigate("/login");
  const handleRegister = () => navigate("/register");

  const handleLogout = async () => {
    try {
      await logoutUser();
      localStorage.clear();
      setIsLoggedIn(false);
      setUser(null);
      navigate("/");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-3 shadow-lg w-full">
      <div className="flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center gap-6">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <img src={logo} alt="ChulaLoka Logo" className="h-12 w-auto" />
            <div className="leading-tight">
              <div className="text-2xl font-bold tracking-wide">
                <span className="text-[#FF4EB5]">Chula</span>
                <span className="text-white">Loka</span>
              </div>
              <div className="text-sm text-blue-100">Your Flight Companion</div>
            </div>
          </div>
        </div>

        {/* Center: Main Menu */}
        <div className="hidden md:flex space-x-6 text-base font-medium">
          <button
            className="flex items-center space-x-2 hover:text-pink-300 transition"
            onClick={() => navigate("/")}
          >
            <FaPlaneDeparture />
            <span>Flights</span>
          </button>

          {isLoggedIn && (
            <>
              <button
                className="flex items-center space-x-2 hover:text-pink-300 transition"
                onClick={() => navigate("/booking")}
              >
                <FaSuitcase />
                <span>Bookings</span>
              </button>
              <button
                className="flex items-center space-x-2 hover:text-pink-300 transition"
                onClick={() => navigate("/history")}
              >
                <FaHistory />
                <span>History</span>
              </button>
            </>
          )}
        </div>

        {/* Right: Auth Section */}
        <div className="flex items-center space-x-4 text-sm">
          {isLoggedIn ? (
            <UserDropdown user={user} onLogout={handleLogout} />
          ) : (
            <>
              <button
                onClick={handleLogin}
                className="flex items-center space-x-2 bg-white text-blue-600 px-3 py-1 rounded-md hover:bg-gray-100 transition"
              >
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </button>
              <button
                onClick={handleRegister}
                className="flex items-center space-x-2 bg-white text-blue-600 px-3 py-1 rounded-md hover:bg-gray-100 transition"
              >
                <UserPlus className="w-4 h-4" />
                <span>Register</span>
              </button>
            </>
          )}

          {/* TH | THB */}
          <div className="flex items-center bg-white/10 border border-white/30 rounded-md px-3 py-1 cursor-pointer ml-2">
            <img
              src="https://flagcdn.com/w40/th.png"
              alt="Thai Flag"
              className="w-5 h-3.5 mr-2"
            />
            <span className="text-white text-sm font-medium">TH | THB</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 ml-1 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default MenuBar;
