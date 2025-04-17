// src/components/FloatingSelectionTracker.jsx
import React from "react";
import {
  FaPlaneDeparture,
  FaPlaneArrival,
  FaClock,
  FaMapMarkerAlt,
} from "react-icons/fa";

// --- Helper Functions ---
const formatPrice = (price) => {
  if (!price || typeof price.amount === "undefined" || price.amount === null)
    return "N/A";
  return `${price.amount.toLocaleString()} ${price.currency || ""}`;
};

const formatDateTimeInBKK = (isoDateTimeString) => {
  if (!isoDateTimeString) return "N/A";
  try {
    const date = new Date(isoDateTimeString);
    if (isNaN(date.getTime())) {
      throw new Error("Invalid date string");
    }
    const options = {
      timeZone: "Asia/Bangkok",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    };
    return new Intl.DateTimeFormat("en-GB", options).format(date);
  } catch (error) {
    console.error("Error formatting date:", isoDateTimeString, error);
    const timePart = isoDateTimeString.split("T")[1]?.substring(0, 5);
    return timePart || "Invalid Time";
  }
};

// --- Sub-Component for Displaying Single Flight Info ---
const FlightInfoDisplay = ({ flight, label, labelColor }) => {
  if (!flight) return null;

  const departureTimeBKK = formatDateTimeInBKK(flight.departure?.time);
  const arrivalTimeBKK = formatDateTimeInBKK(flight.arrival?.time);

  return (
    <div>
      <span
        className={`text-sm font-semibold uppercase tracking-wider ${labelColor} block mb-3`}
      >
        {label}
      </span>
      <div className="flex items-center gap-3 text-sm mb-3">
        {flight.logoUrl && ( // Using flight.logoUrl directly
          <img
            src={flight.logoUrl}
            alt={`${flight.airlineName || ""} logo`}
            className="h-24 w-32 p-2 round-full object-contain flex-shrink-0"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        )}
        <span className="font-medium leading-tight">
          {flight.airlineName} ({flight.flightNumber})
        </span>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-gray-100 opacity-95 mb-1.5 pl-1">
        <FaClock className="flex-shrink-0" />
        <span>
          {departureTimeBKK} &ndash; {arrivalTimeBKK}
        </span>
        <span className="text-[10px]">(BKK time)</span>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-gray-100 opacity-95 pl-1">
        <FaMapMarkerAlt className="flex-shrink-0" />
        <span>
          {flight.departure?.iataCode} &rarr; {flight.arrival?.iataCode}
        </span>
      </div>
      <div className="mt-2 text-right">
        <span className="text-lg font-bold">{formatPrice(flight.price)}</span>
      </div>
    </div>
  );
};

// --- Main Floating Tracker Component ---
const FloatingSelectionTracker = ({
  selectedOutboundFlight,
  selectedInboundFlight,
  direction,
  onContinue, // Receive the onContinue prop
}) => {
  if (!selectedOutboundFlight) {
    return null;
  }

  const canContinue =
    (direction === "ONEWAY" && selectedOutboundFlight) ||
    (direction === "ROUNDTRIP" &&
      selectedOutboundFlight &&
      selectedInboundFlight);

  return (
    <div
      className={`
        fixed bottom-0 left-0 right-0 z-40
        w-full max-w-7xl mx-auto
        bg-gradient-to-t from-blue-700 to-indigo-800
        text-white shadow-xl
        rounded-t-lg
        p-2
        transition-transform duration-300 ease-in-out
        transform
        ${selectedOutboundFlight ? "translate-y-0" : "translate-y-[110%]"}
        flex flex-col
      `}
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col gap-6 md:flex-row md:justify-around mb-1 p-5">
        {" "}
        {/* Added mb-4 for button spacing */}
        <div className="flex-1">
          <FlightInfoDisplay
            flight={selectedOutboundFlight}
            label="Outbound"
            labelColor="text-blue-200"
          />
        </div>
        {direction === "ROUNDTRIP" && (
          <hr className="border-t border-blue-400 opacity-40 my-2 hidden md:block" />
        )}
        {direction === "ROUNDTRIP" && (
          <div className="flex-1">
            {selectedInboundFlight ? (
              <FlightInfoDisplay
                flight={selectedInboundFlight}
                label="Return"
                labelColor="text-indigo-200"
              />
            ) : (
              <div>
                <span className="text-sm font-semibold uppercase tracking-wider text-indigo-200 block mb-2">
                  Return
                </span>
                <span className="text-sm italic text-indigo-200 opacity-80 block">
                  Select return flight
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Continue Button */}
      {canContinue && (
        <div className="text-center mt-4">
          <button
            onClick={onContinue}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-1 rounded-lg font-semibold shadow alinge-left"
          >
            Proceed to Booking
          </button>
        </div>
      )}
    </div>
  );
};

export default FloatingSelectionTracker;
