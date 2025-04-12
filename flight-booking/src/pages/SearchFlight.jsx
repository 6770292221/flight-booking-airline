import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAirports } from "../apis/airport";
import { searchFlights } from "../apis/flight";
import { getCabinClasses } from "../apis/cabin";
import MenuBar from "../pages/MenuBar"; // Import the MenuBar component
import FloatingSelectionTracker from "./Components/FloatingSelectionTracker";
import SearchResult from "../pages/Components/ShowResult";
import {
  FaSearch,
  FaPlaneDeparture,
  FaPlaneArrival,
  FaUserFriends,
  FaChair,
  FaChild,
  FaBaby,
  FaArrowRight,
} from "react-icons/fa";

const SearchFlight = () => {
  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];

  const [airports, setAirports] = useState([]);
  const [cabinClasses, setCabinClasses] = useState([]);
  const [form, setForm] = useState({
    originLocationCode: "",
    destinationLocationCode: "",
    departureDate: today,
    arrivalDate: today,
    direction: "ONEWAY",
    adults: 1,
    children: 0,
    infants: 0,
    cabinClass: "ECONOMY",
  });

  const totalPassengers = form.adults + form.children + form.infants;
  const [flightResults, setFlightResults] = useState([]);
  const [selectedOutboundFlight, setSelectedOutboundFlight] = useState(null);
  const [selectedInboundFlight, setSelectedInboundFlight] = useState(null);
  const [inboundFlights, setInboundFlights] = useState([]);
  const [errors, setErrors] = useState({});
  const [popupMessage, setPopupMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false); // เพิ่ม state สำหรับการแสดงรายละเอียด
  const [selectedDetailIndex, setSelectedDetailIndex] = useState(null);

  useEffect(() => {
    const fetchAirports = async () => {
      try {
        const res = await getAirports();
        setAirports(res.data.data.items || []);
      } catch (error) {
        console.error("Failed to fetch airports", error);
      }
    };

    const fetchCabinClasses = async () => {
      try {
        const res = await getCabinClasses();
        setCabinClasses(res.data.data.items || []);
      } catch (error) {
        console.error("Failed to fetch cabin classes", error);
      }
    };

    fetchAirports();
    fetchCabinClasses();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleIncrement = (name) => {
    setForm((prev) => ({ ...prev, [name]: prev[name] + 1 }));
  };

  const handleDecrement = (name) => {
    if (form[name] > 0) {
      setForm((prev) => ({ ...prev, [name]: prev[name] - 1 }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.originLocationCode)
      newErrors.originLocationCode = "Please select origin";
    if (!form.destinationLocationCode)
      newErrors.destinationLocationCode = "Please select destination";
    if (!form.departureDate)
      newErrors.departureDate = "Please select departure date";
    if (form.direction === "ROUNDTRIP" && !form.arrivalDate)
      newErrors.arrivalDate = "Please select return date";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSearch = async () => {
    if (!validateForm()) return;

    setIsLoading(true); // Show loading

    try {
      const body = {
        direction: form.direction,
        originLocationCode: form.originLocationCode,
        destinationLocationCode: form.destinationLocationCode,
        departureDate: form.departureDate,
        cabinClass: form.cabinClass,
      };

      if (form.adults > 0) body.adults = form.adults;
      if (form.children > 0) body.children = form.children;
      if (form.infants > 0) body.infants = form.infants;

      if (form.direction === "ROUNDTRIP") {
        body.arrivalDate = form.arrivalDate;
      }

      setFlightResults([]);
      setSelectedOutboundFlight(null);
      setSelectedInboundFlight(null);
      setInboundFlights([]);
      setPopupMessage(null);

      const res = await searchFlights(body);
      const result = res.data;

      if (result.outbound.length === 0) {
        setFlightResults([]);
        setPopupMessage("No flights found for the selected route and date.");
      } else {
        setFlightResults(result.outbound);
        if (form.direction === "ROUNDTRIP") {
          setInboundFlights(result.inbound || []);
        }
      }
    } catch (error) {
      console.error("Search failed", error);
      const message =
        error.response?.data?.message || "An error occurred while searching.";
      setPopupMessage(message);
    } finally {
      setIsLoading(false); // Hide loading
    }
  };

  const handleSelectOutboundFlight = (flight) => {
    const data = {
      direction: flight.direction,
      airline: flight.airline,
      flightNumber: flight.flightNumber,
      airlineName: flight.airlineName,
      departure: flight.departure,
      arrival: flight.arrival,
      price: flight.price,
    };
    console.log("Selected Outbound:", data);
    setSelectedOutboundFlight(data);
  };

  const handleSelectInboundFlight = (flight) => {
    const data = {
      direction: flight.direction,
      airline: flight.airline,
      flightNumber: flight.flightNumber,
      airlineName: flight.airlineName,
      departure: flight.departure,
      arrival: flight.arrival,
      price: flight.price,
    };
    console.log("Selected Inbound:", data);
    setSelectedInboundFlight(data);
  };

  const handleSelectFlight = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login"); // หากไม่มี token ไปที่หน้า login
      return;
    }
    if (
      form.direction === "ROUNDTRIP" &&
      selectedOutboundFlight &&
      selectedInboundFlight
    ) {
      navigate("/select-flight", {
        state: {
          outbound: selectedOutboundFlight,
          inbound: selectedInboundFlight,
          passengerCount: totalPassengers,
        },
      });
    } else if (form.direction === "ONEWAY" && selectedOutboundFlight) {
      navigate("/select-flight", {
        state: {
          flight: selectedOutboundFlight,
          passengerCount: totalPassengers,
        },
      });
    }
  };

  const handleShowDetails = () => {
    setShowDetails(!showDetails);
  };

  const handleToggleDetails = (index) => {
    setSelectedDetailIndex((prevIndex) => (prevIndex === index ? null : index));
  };
  function formatDuration(isoDuration) {
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
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-200 to-white p-6">
      <MenuBar /> {/* Add MenuBar component */}
      <div className="max-w-5xl mx-auto mt-10">
        <div className="bg-white p-6 rounded-xl shadow-lg mb-10">
          <h2 className="text-3xl font-semibold text-blue-800 mb-6 flex items-center gap-2">
            <FaSearch /> Search Flights
          </h2>

          {/* Trip Type */}
          <div className="flex items-center mb-6">
            <div className="flex space-x-6">
              <label className="text-lg text-gray-700">
                <input
                  type="radio"
                  name="direction"
                  value="ONEWAY"
                  checked={form.direction === "ONEWAY"}
                  onChange={handleChange}
                  className="mr-2"
                />
                One-way
              </label>
              <label className="text-lg text-gray-700">
                <input
                  type="radio"
                  name="direction"
                  value="ROUNDTRIP"
                  checked={form.direction === "ROUNDTRIP"}
                  onChange={handleChange}
                  className="mr-2"
                />
                Round-trip
              </label>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* From */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">From</label>
              <select
                name="originLocationCode"
                value={form.originLocationCode}
                onChange={handleChange}
                className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Select Origin --</option>
                {airports.map((airport) => (
                  <option key={airport.id} value={airport.iataCode}>
                    {airport.cityName} ({airport.airportName})
                  </option>
                ))}
              </select>
              {errors.originLocationCode && (
                <p className="text-sm text-red-500">
                  {errors.originLocationCode}
                </p>
              )}
            </div>

            {/* To */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">To</label>
              <select
                name="destinationLocationCode"
                value={form.destinationLocationCode}
                onChange={handleChange}
                className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Select Destination --</option>
                {airports.map((airport) => (
                  <option key={airport.id} value={airport.iataCode}>
                    {airport.cityName} ({airport.airportName})
                  </option>
                ))}
              </select>
              {errors.destinationLocationCode && (
                <p className="text-sm text-red-500">
                  {errors.destinationLocationCode}
                </p>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Departure Date */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Departure Date
              </label>
              <input
                type="date"
                name="departureDate"
                value={form.departureDate}
                onChange={handleChange}
                min={today}
                className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.departureDate && (
                <p className="text-sm text-red-500">{errors.departureDate}</p>
              )}
            </div>

            {/* Return Date */}
            {form.direction === "ROUNDTRIP" && (
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Return Date
                </label>
                <input
                  type="date"
                  name="arrivalDate"
                  value={form.arrivalDate}
                  onChange={handleChange}
                  min={form.departureDate}
                  className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.arrivalDate && (
                  <p className="text-sm text-red-500">{errors.arrivalDate}</p>
                )}
              </div>
            )}
          </div>

          {/* Passengers and Class */}
          <div className="grid md:grid-cols-6 gap-6">
            {/* Adults */}
            <div className="flex-1">
              <label className="block text-sm text-gray-600 mb-1">Adults</label>
              <div className="flex items-center">
                <button
                  onClick={() => handleDecrement("adults")}
                  className="bg-gray-300 px-3 py-2 rounded-lg"
                >
                  -
                </button>
                <input
                  type="number"
                  name="adults"
                  value={form.adults}
                  onChange={handleChange}
                  min="1"
                  className="w-12 border p-2 mx-2 text-center rounded-lg"
                />
                <button
                  onClick={() => handleIncrement("adults")}
                  className="bg-gray-300 px-3 py-2 rounded-lg"
                >
                  +
                </button>
              </div>
            </div>

            {/* Children */}
            <div className="flex-1">
              <label className="block text-sm text-gray-600 mb-1">
                Children
              </label>
              <div className="flex items-center">
                <button
                  onClick={() => handleDecrement("children")}
                  className="bg-gray-300 px-3 py-2 rounded-lg"
                >
                  -
                </button>
                <input
                  type="number"
                  name="children"
                  value={form.children}
                  onChange={handleChange}
                  min="0"
                  className="w-12 border p-2 mx-2 text-center rounded-lg"
                />
                <button
                  onClick={() => handleIncrement("children")}
                  className="bg-gray-300 px-3 py-2 rounded-lg"
                >
                  +
                </button>
              </div>
            </div>

            {/* Infants */}
            <div className="flex-1">
              <label className="block text-sm text-gray-600 mb-1">
                Infants
              </label>
              <div className="flex items-center">
                <button
                  onClick={() => handleDecrement("infants")}
                  className="bg-gray-300 px-3 py-2 rounded-lg"
                >
                  -
                </button>
                <input
                  type="number"
                  name="infants"
                  value={form.infants}
                  onChange={handleChange}
                  min="0"
                  className="w-12 border p-2 mx-2 text-center rounded-lg"
                />
                <button
                  onClick={() => handleIncrement("infants")}
                  className="bg-gray-300 px-3 py-2 rounded-lg"
                >
                  +
                </button>
              </div>
            </div>

            {/* Seat Class */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Seat Class
              </label>
              <select
                name="cabinClass"
                value={form.cabinClass}
                onChange={handleChange}
                className="w-[476px] border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Select Seat Class --</option>
                {cabinClasses.map((cabin) => (
                  <option key={cabin._id} value={cabin.code}>
                    {cabin.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Search Button */}
          <div className="mt-6 text-right">
            <button
              onClick={handleSearch}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-lg shadow"
            >
              Search Flights
            </button>
          </div>
        </div>

        {/* Popup error */}
        {popupMessage && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded shadow">
            {popupMessage}
            <button
              className="ml-4 font-bold"
              onClick={() => setPopupMessage(null)}
            >
              ×
            </button>
          </div>
        )}

        {/* Loading Spinner */}
        {isLoading && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50">
            {" "}
            {/* Added backdrop-blur-sm */}
            <div className="flex flex-col items-center">
              {" "}
              {/* Container to stack spinner and text */}
              {/* Spinner */}
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600 mb-4"></div>{" "}
              {/* Adjusted size & added margin */}
              {/* Loading Text */}
              <div className="text-white font-bold text-lg">
                {" "}
                {/* Optional: adjust text size/style */}
                Looking for flights...
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {/* ONEWAY หรือ ROUNDTRIP OUTBOUND */}
          {flightResults.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl font-bold text-blue-700 mb-2">
                Select Outbound Flight
              </h3>
              <div className="space-y-4">
                {flightResults.map((flight, index) => (
                  <SearchResult
                    key={`outbound-${index}`}
                    flight={flight}
                    index={index}
                    selectedDetailIndex={selectedDetailIndex}
                    handleSelectOutboundFlight={handleSelectOutboundFlight}
                    handleToggleDetails={handleToggleDetails}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ROUNDTRIP INBOUND */}
          {form.direction === "ROUNDTRIP" && inboundFlights.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-blue-700 mb-2">
                Select Inbound Flight
              </h3>
              <div className="space-y-4">
                {inboundFlights.map((flight, index) => (
                  <SearchResult
                    key={`inbound-${index}`}
                    flight={flight}
                    index={index + 1000} // ป้องกัน key ซ้ำ
                    selectedDetailIndex={selectedDetailIndex}
                    handleSelectOutboundFlight={handleSelectInboundFlight} // <== เปลี่ยน handler
                    handleToggleDetails={handleToggleDetails}
                  />
                ))}
              </div>
            </div>
          )}
          {/* === Render the Floating Selection Tracker Component === */}
          <FloatingSelectionTracker
            selectedOutboundFlight={selectedOutboundFlight}
            selectedInboundFlight={selectedInboundFlight}
            direction={form.direction}
            onContinue={handleSelectFlight} // Pass the handleSelectFlight function as a prop
          />
          {/* Add extra space at the bottom for scrolling */}
          <div className="pb-64"></div>
        </div>
      </div>
    </div>
  );
};

export default SearchFlight;
