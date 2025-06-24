import React from "react";
import { FaPlane, FaUser } from "react-icons/fa";
import {
  FaHourglassHalf,
  FaTimesCircle,
  FaCheckCircle,
  FaTicketAlt,
  FaBan,
  FaExclamationTriangle,
  FaMoneyCheckAlt,
} from "react-icons/fa";
import StatusBooking from "./StatusBooking";

const BookingDetails = ({ booking, onClose }) => {
  if (!booking) return null;

  return (
    <div
      className="fixed inset-0 flex justify-center items-center bg-gray-500 bg-opacity-50 z-50"
      data-testid="booking-details-modal"
    >
      <div className="bg-white p-5 rounded shadow max-w-2xl w-full text-sm max-h-[90vh] overflow-y-auto">
        <h3
          className="text-2xl font-bold text-gray-800 mb-4"
          data-testid="booking-details-title"
        >
          Booking Details
        </h3>

        <div className="space-y-4">
          <div>
            <p data-testid="booking-number">
              <span data-testid="booking-number-value">
                {booking.bookingNumber}
              </span>
            </p>
            <p data-testid="booking-status">
              <span className="font-semibold">Status:</span>{" "}
              <StatusBooking status={booking.status} />
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <FaPlane className="text-blue-500" /> Flights
            </h4>
            {booking.flights.map((flight, idx) => (
              <div
                key={idx}
                className="mb-3 p-3 border rounded bg-gray-50"
                data-testid={`flight-info-${idx}`}
              >
                <p>
                  <span className="font-semibold">Flight:</span>{" "}
                  {flight.flightNumber} - {flight.airlineName}
                </p>
                <p>
                  <span className="font-semibold">From:</span>{" "}
                  {flight.departure.cityName} ({flight.departure.iataCode}) -{" "}
                  {new Date(flight.departure.time).toLocaleString()}
                </p>
                <p>
                  <span className="font-semibold">To:</span>{" "}
                  {flight.arrival.cityName} ({flight.arrival.iataCode}) -{" "}
                  {new Date(flight.arrival.time).toLocaleString()}
                </p>
                <p>
                  <span className="font-semibold">Price:</span>{" "}
                  {flight.price.amount} {flight.price.currency}
                </p>
              </div>
            ))}
          </div>

          <div>
            <h4 className="text-lg font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <FaUser className="text-green-500" /> Passengers
            </h4>
            {booking.passengers.map((passenger, idx) => (
              <div
                key={idx}
                className="mb-3 p-3 border rounded bg-gray-50"
                data-testid={`passenger-info-${idx}`}
              >
                <p className="font-semibold mb-1">
                  Passenger #{idx + 1}: {passenger.firstName}{" "}
                  {passenger.lastName} ({passenger.type})
                </p>
                <p>
                  <span className="font-semibold">Nationality:</span>{" "}
                  {passenger.nationality}
                </p>
                <p>
                  <span className="font-semibold">Date of Birth:</span>{" "}
                  {new Date(passenger.dateOfBirth).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
                <p>
                  <span className="font-semibold">Passport:</span>{" "}
                  {passenger.passportNumber}
                </p>
                <p>
                  <span className="font-semibold">National ID:</span>{" "}
                  {passenger.nationalId}
                </p>

                {passenger.tickets?.length > 0 && (
                  <div className="mt-2">
                    <h5 className="font-semibold">Tickets:</h5>
                    <div className="space-y-1 pl-4 border-l-2 border-gray-300">
                      {passenger.tickets.map((ticket, i) => (
                        <p key={i} data-testid={`ticket-info-${idx}-${i}`}>
                          <span className="font-semibold">Flight:</span>{" "}
                          {ticket.flightNumber} |{" "}
                          <span className="font-semibold">Ticket No.:</span>{" "}
                          {ticket.ticketNumber}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-2">
                  <h5 className="font-semibold">Addons:</h5>
                  {passenger.addons.length > 0 ? (
                    <div className="space-y-2">
                      {passenger.addons.map((addon, i) => (
                        <div
                          key={i}
                          className="pl-4 border-l-2 border-gray-300"
                          data-testid={`addon-info-${idx}-${i}`}
                        >
                          <p>
                            <span className="font-semibold">Flight:</span>{" "}
                            {addon.flightNumber}
                          </p>
                          <p>
                            <span className="font-semibold">Seat:</span>{" "}
                            {addon.seat}
                          </p>
                          <p>
                            <span className="font-semibold">Meal:</span>{" "}
                            {addon.meal}
                          </p>
                          <p>
                            <span className="font-semibold">Price:</span>{" "}
                            {addon.price.amount} {addon.price.currency}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No addons</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-right mt-4">
          <button
            onClick={onClose}
            className="bg-gray-600 text-white px-4 py-1.5 rounded"
            data-testid="close-booking-details"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;
