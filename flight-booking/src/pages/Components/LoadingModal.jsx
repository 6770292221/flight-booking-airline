import React from "react";
import { FaSpinner } from "react-icons/fa";

const LoadingModal = ({ message }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white px-8 py-6 rounded-xl shadow-xl text-center w-full max-w-sm animate-fadeIn">
        <div
          className="flex flex-col items-center space-y-4"
          data-testid="loading-spinner"
        >
          <FaSpinner className="animate-spin text-blue-500 text-4xl" />
          <p
            className="text-sm text-gray-700 font-medium tracking-wide"
            data-testid="loading-message"
          >
            {message || "Loading... Please wait"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingModal;
