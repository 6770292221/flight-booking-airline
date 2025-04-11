import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../apis/auth";

const MenuBar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      const userData = JSON.parse(localStorage.getItem("user"));
      setUser(userData);
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
    <nav className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-4 py-3 shadow-lg w-full">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Brand */}
        <div
          className="text-lg sm:text-xl font-bold tracking-wide cursor-pointer"
          onClick={() => navigate("/")}
        >
          ✈️ Flight Booking
        </div>

        {/* Center Menu */}
        <div className="hidden md:flex space-x-4 text-sm justify-center flex-1">
          <button
            className="hover:text-yellow-300 transition"
            onClick={() => navigate("/")}
          >
            Home
          </button>
          {isLoggedIn && (
            <>
              <button
                className="hover:text-yellow-300 transition"
                onClick={() => navigate("/booking")}
              >
                My Booking
              </button>
              <button
                className="hover:text-yellow-300 transition"
                onClick={() => navigate("/history")}
              >
                History
              </button>
            </>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-3 text-sm">
          {isLoggedIn ? (
            <>
              <span className="font-medium hidden sm:block">
                {user?.firstName}
              </span>
              <button
                onClick={handleLogout}
                className="bg-white text-blue-600 px-3 py-1 rounded-md text-sm hover:bg-gray-100 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleLogin}
                className="bg-white text-blue-600 px-3 py-1 rounded-md hover:bg-gray-100 transition"
              >
                Login
              </button>
              <button
                onClick={handleRegister}
                className="bg-white text-blue-600 px-3 py-1 rounded-md hover:bg-gray-100 transition"
              >
                Register
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default MenuBar;
