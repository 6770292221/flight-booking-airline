import React, { useState, useEffect } from "react";
import { getBookings } from "../apis/booking"; // Import ฟังก์ชัน getBookings
import MenuBar from "../pages/MenuBar"; // Import the MenuBar component
import BookingDetails from "../pages/Components/BookingDetails";
import StatusBooking from "../pages/Components/StatusBooking";
import LoadingModal from "../pages/Components/LoadingModal";
import { useNavigate } from "react-router-dom";

const History = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [searchBookingNumber, setSearchBookingNumber] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await getBookings();
        if (response.data.status === "success") {
          setBookings(response.data.data);
          setFilteredBookings(response.data.data);
        } else {
          setError(response.data.message);
        }
      } catch (error) {
        if (error.response?.status === 404) {
          // No data, not an error — set empty bookings
          setBookings([]);
          setFilteredBookings([]);
        } else {
          setError("Failed to fetch bookings. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, []);

  useEffect(() => {
    const filtered = bookings.filter((booking) => {
      const matchBookingNumber = booking.bookingNubmer
        ?.toLowerCase()
        .includes(searchBookingNumber.toLowerCase());
      const matchStatus =
        selectedStatus === "ALL" || booking.status === selectedStatus;

      return matchBookingNumber && matchStatus;
    });

    setFilteredBookings(filtered);
  }, [searchBookingNumber, selectedStatus, bookings]);

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-200 to-white p-0">
      <MenuBar />
      {isLoading && <LoadingModal message="Loading bookings..." />}
      <div className="max-w-3xl mx-auto mt-10">
        <h2 className="text-2xl font-semibold text-blue-800 mb-4">
          Booking History
        </h2>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search Booking Number"
            value={searchBookingNumber}
            onChange={(e) => setSearchBookingNumber(e.target.value)}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="ISSUED">Issued</option>
            <option value="FAILED_ISSUED">Failed Issued</option>
            <option value="FAILED_PAID">Failed Paid</option>
            <option value="PAID">Paid</option>
            <option value="TICKETING">Ticketing</option>
          </select>
        </div>

        {isLoading ? (
          <div className="text-center text-xl text-gray-600"></div>
        ) : error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
            {/* Mock Table Header */}
            <div className="grid grid-cols-3 gap-4 text-sm font-medium text-gray-600 border-b pb-2 mb-2">
              <div>Booking Number</div>
              <div>Status</div>
              <div>Flight</div>
            </div>

            <p className="text-gray-500 py-6">No bookings found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex justify-between">
                  <h3 className="text-lg font-semibold">
                    Booking Number: {booking.bookingNubmer}
                  </h3>
                  <StatusBooking status={booking.status} />
                </div>

                <div className="mt-3">
                  <h4 className="text-md font-semibold">Flight Information:</h4>
                  {booking.flights.map((flight, idx) => (
                    <div key={idx} className="mt-2">
                      <div className="flex justify-between">
                        <div>
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
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 text-right">
                  <button
                    onClick={() => handleViewDetails(booking)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showDetails && selectedBooking && (
          <BookingDetails
            booking={selectedBooking}
            onClose={handleCloseDetails}
          />
        )}
      </div>
    </div>
  );
};

export default History;
