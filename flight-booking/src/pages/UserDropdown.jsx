import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  CreditCard,
  ShoppingCart,
  Briefcase,
  Undo2,
  Bell,
  Users,
  Percent,
  LogOut,
} from "lucide-react";

const UserDropdown = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef(null);

  const toggleMenu = () => setIsOpen(!isOpen);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      {/* Trigger Button */}
      <button
        onClick={toggleMenu}
        className="flex items-center space-x-2 px-3 py-1 bg-white text-blue-600 rounded-full border border-blue-400 hover:bg-blue-50 transition"
      >
        <User className="h-5 w-5" />
        <span className="font-medium">{user?.firstName}</span>
        <svg
          className="w-4 h-4 ml-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M19 9l-7 7-7-7"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg z-50 p-4 space-y-2">
          <div className="font-bold text-gray-800">{user?.firstName}</div>
          <div className="border-b border-gray-200 mb-2" />

          <MenuItem
            icon={<CreditCard />}
            label="Payment & Refunds"
            onClick={() => navigate("/payments")}
          />
          <MenuItem
            icon={<LogOut />}
            label="Log Out"
            onClick={onLogout}
            className="text-red-600 hover:bg-red-100"
          />
        </div>
      )}
    </div>
  );
};

const MenuItem = ({ icon, label, onClick, badge, className = "" }) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-gray-100 ${className}`}
  >
    <div className="flex items-center space-x-3 text-gray-700">
      {icon}
      <span>{label}</span>
    </div>
    {badge && (
      <span className="bg-yellow-400 text-xs font-bold text-white px-2 py-0.5 rounded-full">
        {badge}
      </span>
    )}
  </button>
);

export default UserDropdown;
