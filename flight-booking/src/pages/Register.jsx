import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../apis/auth";
import MenuBar from "../pages/MenuBar"; // Import the MenuBar component

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    password: "",
    email: "",
    phoneNumber: "",
  });

  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false); // State to control showing the popup
  const navigate = useNavigate(); // Initialize navigate

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Set loading to true when form is being submitted
    setError(null); // Reset any previous error

    try {
      const response = await registerUser(formData); // Call the registerUser function from auth.js
      setSuccessMessage("Registration successful!");
      console.log(response.data); // Log the response for debugging

      // Show the popup message after successful registration
      setShowPopup(true);
    } catch (error) {
      console.error(error);

      // Handle API error and display custom message
      if (error.response && error.response.data) {
        // Extract error message from the API response
        const errorMessage =
          error.response.data.message ||
          "Registration failed. Please try again.";
        setError(errorMessage); // Set the error message to state
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setIsLoading(false); // Set loading to false after operation completes
    }
  };

  const handlePopupClose = () => {
    setShowPopup(false); // Close the popup
    navigate("/login"); // Navigate to the login page
  };
  return (
    <div>
      <MenuBar /> {/* Add MenuBar component */}
      <div className="max-w-lg mx-auto mt-12 p-6 bg-white rounded-xl shadow-xl">
        <h2 className="text-3xl font-semibold text-center text-blue-600 mb-6">
          Create Your Account
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

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
              htmlFor="phoneNumber"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Phone Number
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
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
          {successMessage && (
            <div className="text-green-500 text-sm">{successMessage}</div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg mt-4 transition duration-300"
          >
            {isLoading ? "Registering..." : "Register"}
          </button>
        </form>

        {/* Popup Modal */}
        {showPopup && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
              <h3 className="text-lg font-bold mb-4 text-center text-green-500">
                Registration Successful!
              </h3>
              <p className="mb-4 text-center">
                Please check your email to confirm your registration.
              </p>
              <button
                className="bg-blue-600 text-white px-6 py-2 rounded-lg w-full"
                onClick={handlePopupClose}
              >
                OK
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;
