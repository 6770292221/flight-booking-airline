import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../apis/auth";
import { verifyOtp } from "../apis/auth";
import MenuBar from "../pages/MenuBar"; // Import the MenuBar component

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false); // State to control OTP modal
  const [message, setMessage] = useState(""); // State for OTP message
  const [otpError, setOtpError] = useState(""); // State for OTP error
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await loginUser(formData);
      console.log(response.data);

      localStorage.setItem("userId", response.data.data.userId);
      localStorage.setItem("token", response.data.token);

      setShowOtpModal(true);
    } catch (error) {
      console.error("Login error:", error);
      if (error.response?.data?.message) {
        setError(error.response.data.message); // ดึง message จาก API
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (e) => {
    setOtp(e.target.value); // Update OTP state
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setMessage(""); // Clear previous message
    setOtpError(""); // Reset OTP error

    const userId = localStorage.getItem("userId"); // Retrieve userId from localStorage

    try {
      const response = await verifyOtp(userId, otp); // Call verifyOtp function with userId and otp
      const token = response.data.data.token; // Assuming the response contains a token

      // Check if the token exists in the response
      if (token) {
        localStorage.setItem("token", token); // Save token in localStorage
        setMessage("OTP verified successfully!");
        navigate("/"); // Redirect to the SearchFlight page after OTP verification
      } else {
        setOtpError("Token not found in response.");
      }
    } catch (err) {
      // Handle OTP verification failure
      if (err.response && err.response.data) {
        setOtpError(err.response.data.message); // Display error message from API response
      } else {
        setOtpError("Invalid OTP. Please try again."); // Fallback error message
      }
    }
  };
  return (
    <div>
      <MenuBar /> {/* เพิ่ม MenuBar ที่นี่ */}
      {/* Login Form */}
      <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded-xl shadow-xl">
        <h2 className="text-3xl font-semibold text-center text-blue-600 mb-6">
          Login
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {error && <div className="text-red-500 text-sm">{error}</div>}

          <button
            type="submit"
            disabled={isLoading} // Disable the button during loading
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg mt-4 transition duration-300"
          >
            {isLoading ? "Logging In..." : "Login"}
          </button>
        </form>
      </div>
      {/* OTP Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-bold mb-4">Verify OTP</h3>
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <input
                className="otp-input w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                type="text"
                maxLength={6}
                value={otp}
                onChange={handleOtpChange}
                placeholder="Enter 6-digit OTP"
                required
              />
              <button
                type="submit"
                className="otp-button w-full bg-blue-600 text-white px-6 py-3 rounded-lg mt-4 transition duration-300"
              >
                Verify OTP
              </button>
            </form>

            {/* Show OTP Error Message */}
            {otpError && (
              <p className="text-red-500 text-sm mt-4">{otpError}</p>
            )}
            {message && (
              <p className="text-green-500 text-sm mt-4">{message}</p>
            )}

            <button
              className="mt-4 text-center block w-full text-blue-500"
              onClick={() => setShowOtpModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
