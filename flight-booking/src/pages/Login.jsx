import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { loginUser, verifyOtp } from "../apis/auth";
import MenuBar from "../pages/MenuBar";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [message, setMessage] = useState("");
  const [otpError, setOtpError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const email = params.get("email");
    const name = params.get("name");
    const userId = params.get("userId");

    if (token) {
      localStorage.setItem("token", token);
      localStorage.setItem("email", email);
      localStorage.setItem("userId", userId);
      navigate("/");
    }
  }, [location.search]);

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
      localStorage.setItem("userId", response.data.data.userId);
      localStorage.setItem("token", response.data.token);
      setShowOtpModal(true);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (e) => {
    setOtp(e.target.value);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setMessage("");
    setOtpError("");
    const userId = localStorage.getItem("userId");

    try {
      const response = await verifyOtp(userId, otp);
      const token = response.data.data.token;

      if (token) {
        localStorage.setItem("token", token);
        setMessage("OTP verified successfully!");
        navigate("/");
      } else {
        setOtpError("Token not found in response.");
      }
    } catch (err) {
      setOtpError(
        err.response?.data?.message || "Invalid OTP. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <MenuBar />
      <div className="flex-grow flex items-center justify-center">
        <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-2xl">
          <h2 className="text-3xl font-bold text-center text-blue-600 mb-8">
            Welcome Back
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
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
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                required
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
            >
              {isLoading ? "Logging In..." : "Sign In"}
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-gray-500 text-sm mb-4">or sign in with</p>
            {/* <button
              type="button"
              onClick={() =>
                (window.location.href =
                  "https://flight-booking-airline.onrender.com/api/v1/user-core-api/auth/google")
              }
              className="w-full flex items-center justify-center gap-3 border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 font-medium py-3 rounded-lg shadow transition"
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                className="w-6 h-6"
              />
              Continue with Google
            </button> */}
          </div>
        </div>
      </div>

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full animate-fade-in">
            <h3 className="text-2xl font-bold text-center mb-6">Verify OTP</h3>
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={handleOtpChange}
                placeholder="Enter 6-digit code"
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                required
              />
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
              >
                Verify
              </button>
            </form>

            {otpError && (
              <p className="text-red-500 text-center text-sm mt-4">
                {otpError}
              </p>
            )}
            {message && (
              <p className="text-green-500 text-center text-sm mt-4">
                {message}
              </p>
            )}

            <button
              className="block w-full text-center mt-6 text-blue-500 hover:underline"
              onClick={() => setShowOtpModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
