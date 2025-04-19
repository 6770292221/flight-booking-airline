import { useEffect, useState } from "react";
import Sidebar from "../Home/Sidebar";
import { getAllBookings, cancelBookingById } from "../../apis/booking";
import ConfirmationPopup from "../components/ConfirmationPopup";
import "./Booking.css";
import React from "react";
import Swal from "sweetalert2"; // เพิ่มถ้ายังไม่มี

function Bookings() {
  const [bookingList, setBookingList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedBookings, setExpandedBookings] = useState({});
  const [selectedStatus, setSelectedStatus] = useState("");
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [showCancelPopup, setShowCancelPopup] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await getAllBookings();
      setBookingList(res.data.data);
    } catch (err) {
      console.error("Failed to fetch bookings", err);
    }
  };

  const handleExpandToggle = (bookingId) => {
    setExpandedBookings((prev) => ({
      ...prev,
      [bookingId]: !prev[bookingId],
    }));
  };

  const handleCancelConfirm = (bookingId) => {
    setBookingToCancel(bookingId);
    setShowCancelPopup(true);
  };

  const cancelBooking = async () => {
    setIsCancelling(true);

    try {
      const res = await cancelBookingById(bookingToCancel);

      if (res.data.status === "success") {
        setShowCancelPopup(false);
        setBookingToCancel(null);

        Swal.fire({
          icon: "success",
          title: "Booking Cancelled",
          text: "The booking has been cancelled successfully.",
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          window.location.reload();
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed to Cancel",
          text: res.data.message || "Unable to cancel booking.",
        });
      }
    } catch (err) {
      console.error("Error cancelling booking", err);
      Swal.fire({
        icon: "error",
        title: "Something went wrong",
        text:
          err.response?.data?.message ||
          "An error occurred while cancelling the booking.",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const filteredBookings = bookingList.filter((item) => {
    const matchesSearchQuery =
      item.bookingNubmer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.bookingNumber?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatusFilter =
      selectedStatus === "" || item.status === selectedStatus;

    return matchesSearchQuery && matchesStatusFilter;
  });

  const getStatusClass = (status) => {
    switch (status) {
      case "PENDING":
        return "status-pending";
      case "CANCELLED":
        return "status-cancelled";
      case "PAID":
        return "status-paid";
      case "FAILED_PAID":
        return "status-failed_paid";
      case "TICKETING":
        return "status-ticketing";
      case "ISSUED":
        return "status-issued";
      case "FAILED_ISSUED":
        return "status-failed_issue";
      default:
        return "";
    }
  };

  const isCancellable = (status) => {
    return status === "PENDING" || status === "FAILED_PAID";
  };

  return (
    <div className="home-wrapper">
      <Sidebar />
      <div className="booking-container">
        <h2>Bookings</h2>

        <div className="booking-controls">
          <input
            className="search-input"
            type="text"
            placeholder="Search by Booking Number or Status"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <div className="status-wrapper">
            <label htmlFor="status">Filter by Status:</label>
            <select
              id="status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">All</option>
              <option value="PENDING">PENDING</option>
              <option value="CANCELLED">CANCELLED</option>
              <option value="PAID">PAID</option>
              <option value="FAILED_PAID">FAILED_PAID</option>
              <option value="TICKETING">TICKETING</option>
              <option value="ISSUED">ISSUED</option>
              <option value="FAILED_ISSUED">FAILED_ISSUED</option>
            </select>
          </div>
        </div>

        <table className="booking-table">
          <thead>
            <tr>
              <th>Booking Number</th>
              <th>User</th>
              <th>Flight Info</th>
              <th>Status</th>
              <th>Created</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map((item) => (
              <React.Fragment key={item._id}>
                <tr>
                  <td>{item.bookingNubmer}</td>
                  <td>
                    {item.passengers
                      .map((passenger) => passenger.firstName)
                      .join(", ")}
                  </td>
                  <td>
                    {item.flights.map((flight) => (
                      <div key={flight.flightNumber}>
                        {flight.airlineName} - {flight.flightNumber} from{" "}
                        {flight.departure.cityName} to {flight.arrival.cityName}
                        <br />
                        Departure:{" "}
                        {new Date(flight.departure.time).toLocaleString(
                          "en-US",
                          { timeZone: "Asia/Bangkok" }
                        )}{" "}
                        - Arrival:{" "}
                        {new Date(flight.arrival.time).toLocaleString("en-US", {
                          timeZone: "Asia/Bangkok",
                        })}
                      </div>
                    ))}
                  </td>
                  <td className={getStatusClass(item.status)}>{item.status}</td>
                  <td>{new Date(item.createdAt).toLocaleString()}</td>
                  <td>{new Date(item.updatedAt).toLocaleString()}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="expand-btn"
                        onClick={() => handleExpandToggle(item._id)}
                      >
                        {expandedBookings[item._id]
                          ? "Hide Details"
                          : "See Details"}
                      </button>
                      {isCancellable(item.status) && (
                        <button
                          className="icon-button delete"
                          onClick={() => handleCancelConfirm(item._id)}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>

                {expandedBookings[item._id] && (
                  <tr>
                    <td colSpan="7">
                      <div className="passenger-details open">
                        <h3>Passengers and Tickets</h3>
                        {item.passengers.map((passenger, idx) => (
                          <div key={idx}>
                            <strong>
                              {passenger.firstName} {passenger.lastName}
                            </strong>
                            <br />
                            Nationality: {passenger.nationality}
                            <br />
                            Passport: {passenger.passportNumber}
                            <br />
                            Date of Birth:{" "}
                            {new Date(
                              passenger.dateOfBirth
                            ).toLocaleDateString()}
                            <br />
                            Gender: {passenger.gender}
                            <br />
                            Add-ons:
                            {passenger.addons.map((addon, addonIdx) => (
                              <div key={addonIdx}>
                                Flight: {addon.flightNumber}, Seat: {addon.seat}
                                , Meal: {addon.meal}, Price:{" "}
                                {addon.price.amount} {addon.price.currency}
                              </div>
                            ))}
                          </div>
                        ))}

                        {item.events &&
                          item.events.some(
                            (event) =>
                              event.type === "TICKET_ISSUED" &&
                              event.status === "SUCCESS"
                          ) && (
                            <div className="ticket-info">
                              <h4>Issued Tickets:</h4>
                              {item.events
                                .filter(
                                  (event) =>
                                    event.type === "TICKET_ISSUED" &&
                                    event.status === "SUCCESS"
                                )
                                .map((event, idx) => (
                                  <div key={idx}>
                                    {event.payload.passengers.map(
                                      (passenger, pIdx) => (
                                        <div key={pIdx}>
                                          <strong>
                                            {passenger.passportNumber}
                                          </strong>
                                          <br />
                                          {passenger.tickets.map(
                                            (ticket, tIdx) => (
                                              <div key={tIdx}>
                                                <p>
                                                  Flight: {ticket.flightNumber},
                                                  Ticket: {ticket.ticketNumber}
                                                </p>
                                              </div>
                                            )
                                          )}
                                        </div>
                                      )
                                    )}
                                  </div>
                                ))}
                            </div>
                          )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>

        {showCancelPopup && (
          <ConfirmationPopup
            message="Are you sure you want to cancel this booking?"
            onConfirm={cancelBooking}
            onCancel={() => setShowCancelPopup(false)}
          />
        )}

        {/* Loading Modal ตรงนี้เลย */}
        {isCancelling && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white px-6 py-4 rounded shadow text-center text-lg font-semibold">
              <div className="animate-spin inline-block w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full mr-2"></div>
              Cancelling your booking...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Bookings;
