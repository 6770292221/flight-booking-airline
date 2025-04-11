import React, { useState, useEffect } from "react";
import { getPendingBookings, cancelBooking } from "../apis/booking"; // Import the getPendingBookings and cancelBooking functions
import { useNavigate } from "react-router-dom"; // Import useNavigate for redirection
import MenuBar from "../pages/MenuBar"; // Import the MenuBar component

const Booking = () => {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDelete, setIsLoadingDelete] = useState(false); // Add state for delete loading
  const [error, setError] = useState(null);
  const [showPopup, setShowPopup] = useState(false); // State to control the popup visibility
  const [popupBooking, setPopupBooking] = useState(null); // Store the selected booking details for the popup
  const navigate = useNavigate(); // Initialize useNavigate for redirection

  // Fetch bookings when component mounts
  useEffect(() => {
    const fetchBookings = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await getPendingBookings(); // Fetch bookings using the getPendingBookings function
        if (response.data.status === "success") {
          const filteredBookings = response.data.data.filter(
            (booking) =>
              booking.status === "PENDING" || booking.status === "FAILED_ISSUED"
          );
          setBookings(filteredBookings); // Store the bookings in the state
        } else {
          setError(response.data.message); // Handle error from the response
        }
      } catch (error) {
        setError("Failed to fetch bookings. Please try again."); // Handle error from the try block
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [navigate]);

  // View details popup
  const handleViewDetails = (bookingId) => {
    const booking = bookings.find((b) => b._id === bookingId);
    setPopupBooking(booking);
    setShowPopup(true); // Show popup when user clicks on "View"
  };

  // Close popup
  const closePopup = () => {
    setShowPopup(false);
    setPopupBooking(null);
  };

  // Handle payment redirection
  const handlePayment = (bookingId) => {
    navigate("/payment", { state: { bookingId } }); // Redirect to payment page with bookingId
  };

  // Handle cancel booking and refresh the list with loading state
  const handleCancel = async (bookingId) => {
    setIsLoadingDelete(true); // Set loading state to true when canceling the booking
    try {
      const response = await cancelBooking(bookingId); // Call the cancelBooking function

      // ตรวจสอบ response.data แทนการตรวจสอบแค่ response.status
      if (response.data && response.data.status === "success") {
        // ถ้ายกเลิกการจองสำเร็จ
        const updatedBookings = await getPendingBookings(); // ดึงข้อมูลการจองใหม่
        setBookings(updatedBookings.data.data); // อัปเดตข้อมูลใน state
      } else {
        setError("Failed to cancel booking. Please try again.");
      }
    } catch (error) {
      console.error("Error during cancelBooking:", error);

      // Handle different types of errors
      if (error.response) {
        console.error("API Response error:", error.response.data);
        setError(
          `Error: ${error.response.data.message || "Failed to cancel booking"}`
        );
      } else if (error.request) {
        console.error("API Request error:", error.request);
        setError("Network error, please check your connection.");
      } else {
        console.error("Unknown error:", error.message);
        setError("Error occurred while canceling the booking.");
      }
    } finally {
      setIsLoadingDelete(false); // Set loading state to false after the request is completed
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-200 to-white p-6">
      <MenuBar />
      <div className="max-w-7xl mx-auto mt-10">
        <h2 className="text-3xl font-semibold text-blue-800 mb-6">
          My Booking
        </h2>

        {isLoading || isLoadingDelete ? (
          <div className="fixed inset-0 flex justify-center items-center bg-gray-500 bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-3xl w-full">
              <div className="text-center text-xl text-gray-600">
                {isLoading
                  ? "Loading bookings..."
                  : "Deleting booking... Please wait."}
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : bookings.length === 0 ? (
          <div className="text-center text-gray-600">No bookings found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
              <thead className="bg-blue-100 text-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold">
                    Booking Number
                  </th>
                  <th className="px-6 py-3 text-left font-semibold">Status</th>
                  <th className="px-6 py-3 text-left font-semibold">
                    Flight Details
                  </th>
                  <th className="px-6 py-3 text-left font-semibold">
                    Total Price
                  </th>
                  <th className="px-6 py-3 text-center font-semibold w-48">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-700">
                      {booking.bookingNubmer}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full ${
                          booking.status === "PENDING"
                            ? "bg-yellow-300 text-yellow-700"
                            : "bg-red-300 text-red-700"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700 w-[300px]">
                      {booking.flights.map((flight, idx) => (
                        <div key={idx}>
                          <span className="font-semibold">
                            {flight.airlineName} - {flight.flightNumber}
                          </span>
                          <p>
                            {flight.departure.cityName} (
                            {flight.departure.iataCode}) →{" "}
                            {flight.arrival.cityName} ({flight.arrival.iataCode}
                            )
                          </p>
                          <p>
                            Departure:{" "}
                            {new Date(flight.departure.time).toLocaleString()} -
                            Arrival:{" "}
                            {new Date(flight.arrival.time).toLocaleString()}
                          </p>
                          <p>
                            Price: {flight.price.amount} {flight.price.currency}
                          </p>
                        </div>
                      ))}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {booking.amount} {booking.flights[0]?.price.currency}
                    </td>
                    <td className="px-6 py-4 text-center flex space-x-3">
                      <button
                        onClick={() => handleViewDetails(booking._id)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all"
                      >
                        <i className="fas fa-eye text-lg"></i> View
                      </button>
                      <button
                        onClick={() => handlePayment(booking._id)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all"
                      >
                        <i className="fas fa-credit-card text-lg"></i> Pay
                      </button>
                      <button
                        onClick={() => handleCancel(booking._id)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all"
                      >
                        <i className="fas fa-times-circle text-lg"></i> Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Popup for booking details */}
      {showPopup && popupBooking && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-500 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-3xl w-full">
            <h3 className="text-2xl font-semibold">Booking Details</h3>
            <p>
              <strong>Booking Number:</strong> {popupBooking.bookingNubmer}
            </p>
            <p>
              <strong>Status:</strong> {popupBooking.status}
            </p>

            <h4 className="mt-4 font-semibold">Flights:</h4>
            {popupBooking.flights.map((flight, idx) => (
              <div key={idx} className="mb-4">
                <p>
                  <strong>Flight Number:</strong> {flight.flightNumber}
                </p>
                <p>
                  <strong>Airline:</strong> {flight.airlineName}
                </p>
                <p>
                  <strong>Departure:</strong> {flight.departure.cityName} (
                  {flight.departure.iataCode}) -{" "}
                  {new Date(flight.departure.time).toLocaleString()}
                </p>
                <p>
                  <strong>Arrival:</strong> {flight.arrival.cityName} (
                  {flight.arrival.iataCode}) -{" "}
                  {new Date(flight.arrival.time).toLocaleString()}
                </p>
                <p>
                  <strong>Price:</strong> {flight.price.amount}{" "}
                  {flight.price.currency}
                </p>
              </div>
            ))}

            <h4 className="mt-4 font-semibold">Passengers:</h4>
            <div className="max-h-96 overflow-y-auto">
              {popupBooking.passengers.map((passenger, idx) => (
                <div key={idx} className="mb-4">
                  <p>
                    <strong>
                      {passenger.firstName} {passenger.lastName}
                    </strong>{" "}
                    ({passenger.type})
                  </p>
                  <p>
                    <strong>Passport:</strong> {passenger.passportNumber}
                  </p>

                  <h5 className="font-semibold">Addons:</h5>
                  {passenger.addons.length > 0 ? (
                    <ul>
                      {passenger.addons.map((addon, i) => (
                        <li key={i}>
                          <p>
                            <strong>Flight Number:</strong> {addon.flightNumber}
                          </p>
                          <p>
                            <strong>Seat:</strong> {addon.seat}
                          </p>
                          <p>
                            <strong>Meal:</strong> {addon.meal}
                          </p>
                          <p>
                            <strong>Price:</strong> {addon.price.amount}{" "}
                            {addon.price.currency}
                          </p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No addons available</p>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={closePopup}
              className="mt-4 bg-gray-500 text-white py-2 px-6 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Booking;
