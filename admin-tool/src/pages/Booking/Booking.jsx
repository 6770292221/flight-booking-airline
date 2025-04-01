import { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import Sidebar from "../Home/Sidebar";
import { getAllBookings } from "../apis/booking";
import "./Booking.css";
import React from "react";

function Bookings() {
  const [bookingList, setBookingList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedBookings, setExpandedBookings] = useState({});

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

  const filteredBookings = bookingList.filter((item) => {
    return (
      item.bookingNubmer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.status.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="home-wrapper">
      <Sidebar />
      <div className="booking-container">
        <h2>Bookings</h2>

        {/* Search Bar */}
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by Booking Number or Status"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
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
                    {/* Displaying Flights */}
                    {item.flights.map((flight) => (
                      <div key={flight.flightNumber}>
                        {flight.airlineName} - {flight.flightNumber} from{" "}
                        {flight.departure.cityName} to {flight.arrival.cityName}
                        <br />
                        Departure:{" "}
                        {new Date(flight.departure.time).toLocaleString(
                          "en-US",
                          { timeZone: "Asia/Bangkok" }
                        )}
                        -> Arrival:{" "}
                        {new Date(flight.arrival.time).toLocaleString("en-US", {
                          timeZone: "Asia/Bangkok",
                        })}
                      </div>
                    ))}
                  </td>
                  <td>{item.status}</td>
                  <td>{new Date(item.createdAt).toLocaleString()}</td>
                  <td>{new Date(item.updatedAt).toLocaleString()}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="icon-button edit"
                        onClick={() => console.log("Edit Booking", item._id)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="expand-btn"
                        onClick={() => handleExpandToggle(item._id)}
                      >
                        {expandedBookings[item._id]
                          ? "Hide Details"
                          : "See Details"}
                      </button>
                    </div>
                  </td>
                </tr>

                {/* Show detailed information when expanded */}
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

                        {/* Show the ticket details if available */}
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
      </div>
    </div>
  );
}

export default Bookings;
