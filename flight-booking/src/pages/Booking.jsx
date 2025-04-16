import React, { useState, useEffect } from "react";
import { getPendingBookings, cancelBooking } from "../apis/booking";
import { useNavigate } from "react-router-dom";
import MenuBar from "../pages/MenuBar";
import { FaEye, FaMoneyCheckAlt, FaTimesCircle } from "react-icons/fa";

const Booking = () => {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDelete, setIsLoadingDelete] = useState(false);
  const [error, setError] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupBooking, setPopupBooking] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      try {
        const response = await getPendingBookings();
        if (response.data.status === "success") {
          setBookings(response.data.data);
        } else {
          setError(response.data.message);
        }
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    };
    fetchBookings();
  }, [navigate]);

  const handleViewDetails = (bookingId) => {
    const booking = bookings.find((b) => b._id === bookingId);
    setPopupBooking(booking);
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
    setPopupBooking(null);
  };

  const handlePayment = (bookingId) => {
    navigate("/payment", { state: { bookingId } });
  };

  const handleCancel = async (bookingId) => {
    setIsLoadingDelete(true);
    try {
      const response = await cancelBooking(bookingId);
      if (response.data?.status === "success") {
        const updatedBookings = await getPendingBookings();
        setBookings(updatedBookings.data.data);
      } else {
        setError("Failed to cancel booking. Please try again.");
      }
    } catch (error) {
      setError("Error occurred while canceling the booking.");
    } finally {
      setIsLoadingDelete(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-200 to-white p-0">
      <MenuBar />
      <div className="max-w-6xl mx-auto mt-6">
        <h2 className="text-2xl font-semibold text-blue-800 mb-4">
          My Booking
        </h2>

        {isLoading || isLoadingDelete ? (
          <div className="fixed inset-0 flex justify-center items-center bg-gray-500 bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded shadow w-full max-w-md text-center text-gray-600">
              {isLoading
                ? "Loading bookings..."
                : "Canceling booking... Please wait."}
            </div>
          </div>
        ) : error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : bookings.length === 0 ? (
          <div className="text-center text-gray-600">No bookings found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300 rounded shadow">
              <thead className="bg-blue-100 text-gray-700 text-sm">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold">
                    Booking No.
                  </th>
                  <th className="px-3 py-2 text-left font-semibold">Status</th>
                  <th className="px-3 py-2 text-left font-semibold">Flight</th>
                  <th className="px-3 py-2 text-left font-semibold">Total</th>
                  <th className="px-3 py-2 text-center font-semibold w-40">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {bookings.map((booking, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="px-3 py-2 text-gray-700">
                      {booking.bookingNubmer}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          booking.status === "PENDING"
                            ? "bg-yellow-200 text-yellow-800"
                            : "bg-red-200 text-red-800"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 w-64">
                      {booking.flights.map((flight, idx) => (
                        <div key={idx} className="mb-1">
                          <p className="font-semibold">
                            {flight.airlineName} - {flight.flightNumber}
                          </p>
                          <p className="text-xs">
                            {flight.departure.cityName} (
                            {flight.departure.iataCode}) →{" "}
                            {flight.arrival.cityName} ({flight.arrival.iataCode}
                            )
                          </p>
                          <p className="text-xs">
                            {new Date(flight.departure.time).toLocaleString()} -{" "}
                            {new Date(flight.arrival.time).toLocaleString()}
                          </p>
                          <p className="text-xs">
                            {flight.price.amount} {flight.price.currency}
                          </p>
                        </div>
                      ))}
                    </td>
                    <td className="px-3 py-2 text-gray-700">
                      {booking.amount} {booking.flights[0]?.price.currency}
                    </td>
                    <td className="px-3 py-2 flex flex-col items-center space-y-1">
                      <button
                        onClick={() => handleViewDetails(booking._id)}
                        className="bg-blue-500 text-white px-3 py-1.5 rounded hover:bg-blue-600 w-full flex items-center justify-center gap-2"
                      >
                        <FaEye /> View
                      </button>
                      <button
                        onClick={() => handlePayment(booking._id)}
                        className="bg-emerald-500 text-white px-3 py-1.5 rounded hover:bg-emerald-600 w-full flex items-center justify-center gap-2"
                      >
                        <FaMoneyCheckAlt /> Pay
                      </button>
                      <button
                        onClick={() => handleCancel(booking._id)}
                        className="bg-rose-500 text-white px-3 py-1.5 rounded hover:bg-rose-600 w-full flex items-center justify-center gap-2"
                      >
                        <FaTimesCircle /> Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showPopup && popupBooking && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-500 bg-opacity-50 z-50">
          <div className="bg-white p-5 rounded shadow max-w-2xl w-full text-sm">
            <h3 className="text-xl font-semibold mb-2">Booking Details</h3>
            <p>
              <strong>Booking Number:</strong> {popupBooking.bookingNubmer}
            </p>
            <p>
              <strong>Status:</strong> {popupBooking.status}
            </p>

            <h4 className="mt-3 font-semibold">Flights:</h4>
            {popupBooking.flights.map((flight, idx) => (
              <div key={idx} className="mb-3">
                <p>
                  <strong>Flight:</strong> {flight.flightNumber} -{" "}
                  {flight.airlineName}
                </p>
                <p>
                  <strong>From:</strong> {flight.departure.cityName} (
                  {flight.departure.iataCode}) -{" "}
                  {new Date(flight.departure.time).toLocaleString()}
                </p>
                <p>
                  <strong>To:</strong> {flight.arrival.cityName} (
                  {flight.arrival.iataCode}) -{" "}
                  {new Date(flight.arrival.time).toLocaleString()}
                </p>
                <p>
                  <strong>Price:</strong> {flight.price.amount}{" "}
                  {flight.price.currency}
                </p>
              </div>
            ))}

            <h4 className="mt-3 font-semibold">Passengers:</h4>
            <div className="max-h-80 overflow-y-auto">
              {popupBooking.passengers.map((passenger, idx) => (
                <div key={idx} className="mb-3">
                  <p>
                    <strong>
                      {passenger.firstName} {passenger.lastName}
                    </strong>{" "}
                    ({passenger.type})
                  </p>
                  <p>
                    <strong>Passport:</strong> {passenger.passportNumber}
                  </p>
                  <h5 className="font-semibold mt-1">Addons:</h5>
                  {passenger.addons.length > 0 ? (
                    <ul className="list-disc list-inside">
                      {passenger.addons.map((addon, i) => (
                        <li key={i}>
                          <p>
                            <strong>Flight:</strong> {addon.flightNumber}
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
                    <p className="text-gray-500">No addons</p>
                  )}
                </div>
              ))}
            </div>

            <div className="text-right mt-4">
              <button
                onClick={closePopup}
                className="bg-gray-600 text-white px-4 py-1.5 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Booking;
