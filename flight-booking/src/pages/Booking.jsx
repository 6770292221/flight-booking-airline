import React, { useState, useEffect } from "react";
import { getPendingBookings, cancelBooking } from "../apis/booking";
import { useNavigate } from "react-router-dom";
import MenuBar from "../pages/MenuBar";
import BookingDetails from "../pages/Components/BookingDetails";
import StatusBooking from "../pages/Components/StatusBooking";
import LoadingModal from "../pages/Components/LoadingModal";

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
        setError("Error loading bookings");
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

        {(isLoading || isLoadingDelete) && (
          <LoadingModal
            message={
              isLoading
                ? "Loading bookings..."
                : "Canceling booking... Please wait."
            }
          />
        )}

        {error ? (
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
                      <StatusBooking status={booking.status} />
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
        <BookingDetails booking={popupBooking} onClose={closePopup} />
      )}
    </div>
  );
};

export default Booking;
