import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAirports } from "../apis/airport";
import { searchFlights } from "../apis/flight";

const SearchFlight = () => {
  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];

  const [airports, setAirports] = useState([]);
  const [form, setForm] = useState({
    originLocationCode: "",
    destinationLocationCode: "",
    departureDate: today,
    arrivalDate: today,
    direction: "ONEWAY",
    adults: 1,
    cabinClass: "ECONOMY",
  });

  const [flightResults, setFlightResults] = useState([]);
  const [selectedOutboundFlight, setSelectedOutboundFlight] = useState(null);
  const [selectedInboundFlight, setSelectedInboundFlight] = useState(null);
  const [inboundFlights, setInboundFlights] = useState([]); // state สำหรับ inbound
  const [errors, setErrors] = useState({});
  const [popupMessage, setPopupMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchAirports = async () => {
      try {
        const res = await getAirports();
        setAirports(res.data.data.items || []);
      } catch (error) {
        console.error("Failed to fetch airports", error);
      }
    };
    fetchAirports();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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
        adults: form.adults,
      };

      if (form.direction === "ROUNDTRIP") {
        body.arrivalDate = form.arrivalDate;
      }

      // Reset results before search
      setFlightResults([]);
      setSelectedOutboundFlight(null);
      setSelectedInboundFlight(null);
      setInboundFlights([]); // Clear inbound flights
      setPopupMessage(null);

      const res = await searchFlights(body);
      const result = res.data;

      if (result.outbound.length === 0) {
        setFlightResults([]);
        setPopupMessage("No flights found for the selected route and date.");
      } else {
        setFlightResults(result.outbound); // Update flight results for outbound
        if (form.direction === "ROUNDTRIP") {
          // If it's ROUNDTRIP, get the inbound flights after selecting outbound
          setInboundFlights(result.inbound || []); // Set inbound flights
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
    setSelectedOutboundFlight(flight);
    if (form.direction === "ROUNDTRIP") {
      // When outbound is selected, clear inbound flights to be selected
      setInboundFlights([]);
    }
  };

  const handleSelectInboundFlight = (flight) => {
    setSelectedInboundFlight(flight);
  };

  const handleSelectFlight = () => {
    // If ROUNDTRIP, ensure both outbound and inbound are selected
    if (
      form.direction === "ROUNDTRIP" &&
      selectedOutboundFlight &&
      selectedInboundFlight
    ) {
      navigate("/select-flight", {
        state: {
          outbound: selectedOutboundFlight,
          inbound: selectedInboundFlight,
        },
      });
    } else if (form.direction === "ONEWAY" && selectedOutboundFlight) {
      navigate("/select-flight", { state: selectedOutboundFlight });
    } else {
      setPopupMessage("Please select both outbound and inbound flights.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-200 to-white p-6">
      <div className="max-w-5xl mx-auto mt-10">
        {/* Search Box */}
        <div className="bg-white p-6 rounded-xl shadow-lg mb-10">
          <h2 className="text-2xl font-bold text-blue-800 mb-6">
            🔎 Search Flights
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            {/* From */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">From</label>
              <select
                name="originLocationCode"
                value={form.originLocationCode}
                onChange={handleChange}
                className="w-full border p-2 rounded-lg"
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
                className="w-full border p-2 rounded-lg"
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
                className="w-full border p-2 rounded-lg"
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
                  className="w-full border p-2 rounded-lg"
                />
                {errors.arrivalDate && (
                  <p className="text-sm text-red-500">{errors.arrivalDate}</p>
                )}
              </div>
            )}
          </div>

          {/* Options */}
          <div className="mt-4 flex flex-col md:flex-row gap-4 items-center">
            {/* Round Trip */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.direction === "ROUNDTRIP"}
                onChange={(e) =>
                  setForm({
                    ...form,
                    direction: e.target.checked ? "ROUNDTRIP" : "ONEWAY",
                  })
                }
              />
              <label className="text-sm text-gray-700">Round Trip</label>
            </div>

            {/* Passengers */}
            <div>
              <label className="text-sm text-gray-600 mr-2">Passengers:</label>
              <input
                type="number"
                name="adults"
                min="1"
                value={form.adults}
                onChange={handleChange}
                className="border p-2 w-20 rounded-lg"
              />
            </div>

            {/* Cabin Class */}
            <div>
              <select
                name="cabinClass"
                value={form.cabinClass}
                onChange={handleChange}
                className="border p-2 rounded-lg"
              >
                <option value="ECONOMY">Economy</option>
                <option value="BUSINESS">Business</option>
                <option value="FIRST">First Class</option>
              </select>
            </div>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2 rounded-lg shadow"
            >
              🔍 Search Flights
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
          <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
            <div className="text-white font-bold">Loading...</div>
          </div>
        )}

        {/* Flight Results */}
        {flightResults.length > 0 ? (
          <div className="space-y-4">
            {flightResults.map((flight, index) => (
              <div
                key={index}
                className="bg-white shadow rounded-lg p-5 flex flex-col md:flex-row justify-between items-start md:items-center"
              >
                <div className="flex flex-col">
                  <span className="font-semibold text-lg">
                    ✈️ {flight.airlineName} - {flight.flightNumber}
                  </span>
                  <span className="text-sm text-gray-600">
                    {flight.departure.cityName} ({flight.departure.iataCode}) →
                    {flight.arrival.cityName} ({flight.arrival.iataCode})
                  </span>
                </div>

                <div className="flex flex-col text-sm text-gray-700">
                  <span>
                    Departure:{" "}
                    {new Date(flight.departure.time).toLocaleTimeString()}
                  </span>
                  <span>
                    Arrival:{" "}
                    {new Date(flight.arrival.time).toLocaleTimeString()}
                  </span>
                </div>

                <div className="text-right mt-2 md:mt-0">
                  <div className="text-green-600 font-bold text-lg">
                    {flight.price.amount} {flight.price.currency}
                  </div>
                  <button
                    onClick={() => handleSelectOutboundFlight(flight)}
                    className="mt-2 bg-blue-600 hover:bg-blue-700 text-white py-1 px-4 rounded"
                  >
                    Select
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          flightResults.length === 0 &&
          popupMessage === null && (
            <div className="text-center text-red-500"></div>
          )
        )}
      </div>
    </div>
  );
};

export default SearchFlight;
