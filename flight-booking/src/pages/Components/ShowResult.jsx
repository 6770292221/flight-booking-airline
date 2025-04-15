// src/pages/components/SearchResult.jsx

import React from "react";
import {
  FaClock,
  FaPlane,
  FaThLarge,
  FaRulerVertical,
  FaUsers,
  FaSuitcaseRolling,
  FaCheck,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";

const SearchResult = ({
  flight,
  index,
  selectedDetailIndex,
  handleSelect, // Generic handler prop
  onSelectType, // Identifier prop
  handleToggleDetails,
  isSelected,
}) => {
  const formatDuration = (isoDuration) => {
    const regex =
      /P(?:([0-9]+)Y)?(?:([0-9]+)M)?(?:([0-9]+)W)?(?:([0-9]+)D)?(?:T(?:([0-9]+)H)?(?:([0-9]+)M)?(?:([0-9]+)S)?)?/;
    const matches = isoDuration.match(regex);
    if (!matches) return "";

    const [, years, months, weeks, days, hours, minutes, seconds] = matches;
    const parts = [];
    if (years) parts.push(`${years} year${years !== "1" ? "s" : ""}`);
    if (months) parts.push(`${months} month${months !== "1" ? "s" : ""}`);
    if (weeks) parts.push(`${weeks} week${weeks !== "1" ? "s" : ""}`);
    if (days) parts.push(`${days} day${days !== "1" ? "s" : ""}`);
    if (hours) parts.push(`${hours} hour${hours !== "1" ? "s" : ""}`);
    if (minutes) parts.push(`${minutes} minute${minutes !== "1" ? "s" : ""}`);
    if (seconds) parts.push(`${seconds} second${seconds !== "1" ? "s" : ""}`);
    return parts.join(" ");
  };

  const handleSelectClick = () => {
    if (onSelectType === "outbound") {
      handleSelect(flight);
    } else if (onSelectType === "inbound") {
      handleSelect(flight);
    }
  };

  return (
    <div className="mb-6">
      <div className="bg-white shadow rounded-lg p-5 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div className="flex flex-col md:flex-row items-center space-x-4 mb-2">
          {flight.logoUrl && (
            <img
              src={flight.logoUrl}
              alt={`${flight.airlineName} logo`}
              className="w-40 h-40 object-contain"
            />
          )}
          <span className="font-semibold text-lg">
            {flight.airlineName} - {flight.flightNumber}
          </span>
        </div>

        <div className="flex flex-col text-sm text-gray-700">
          <span>
            Departure: {new Date(flight.departure.time).toLocaleTimeString()}
          </span>
          <span>
            Arrival: {new Date(flight.arrival.time).toLocaleTimeString()}
          </span>
        </div>

        <div className="text-right mt-2 md:mt-0 flex flex-col items-end space-y-2">
          <div className="text-green-600 font-bold text-lg">
            {flight.price.amount} {flight.price.currency}
          </div>
          <button
            onClick={handleSelectClick}
            className={`py-2 px-8 rounded font-semibold flex items-center gap-2 ${
              isSelected
                ? "bg-green-600 text-white cursor-default"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
            disabled={isSelected}
          >
            {isSelected ? <FaCheck /> : <FaPlane />}
            {isSelected ? "Selected" : "Select"}
          </button>

          <button
            onClick={() => handleToggleDetails(index)}
            className="py-2 px-2 rounded font-semibold flex items-center gap-1 bg-gray-600 hover:bg-gray-700 text-white"
          >
            {selectedDetailIndex === index ? (
              <>
                <FaChevronUp /> Hide Details
              </>
            ) : (
              <>
                <FaChevronDown /> Flight Details
              </>
            )}
          </button>
        </div>
      </div>

      {selectedDetailIndex === index && (
        <div className="mt-2 text-sm text-gray-700 space-y-2 text-left bg-gray-50 p-4 rounded-lg shadow-inner w-full">
          <p className="flex items-center gap-2">
            <FaClock className="text-blue-500" />
            <strong>Duration:</strong> {formatDuration(flight.duration)}
          </p>
          <p className="flex items-center gap-2">
            <FaPlane className="text-gray-600" />
            <strong>Aircraft:</strong> {flight.aircraft.name} (
            {flight.aircraft.code})
          </p>
          <p className="flex items-center gap-2">
            <FaThLarge className="text-gray-600" />
            <strong>Seat Layout:</strong> {flight.aircraft.seatLayout}
          </p>
          <p className="flex items-center gap-2">
            <FaRulerVertical className="text-gray-600" />
            <strong>Seat Pitch:</strong> {flight.aircraft.seatPitch}
          </p>
          <p className="flex items-center gap-2">
            <FaUsers className="text-gray-600" />
            <strong>Seat Capacity:</strong> {flight.aircraft.seatCapacity}
          </p>
          <p className="flex items-center gap-2">
            <FaSuitcaseRolling className="text-gray-600" />
            <strong>Baggage:</strong> {flight.baggage.checked} checked,{" "}
            {flight.baggage.carryOn} carry-on
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchResult;