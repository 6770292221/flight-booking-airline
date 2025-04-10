import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAirports } from "../apis/airport";
import { searchFlights } from "../apis/flight";
import { getCabinClasses } from "../apis/cabin";

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

  const [flightResults, setFlightResults] = useState([]);
  const [selectedOutboundFlight, setSelectedOutboundFlight] = useState(null);
  const [selectedInboundFlight, setSelectedInboundFlight] = useState(null);
  const [inboundFlights, setInboundFlights] = useState([]);
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
    setSelectedOutboundFlight(flight);
    if (form.direction === "ROUNDTRIP") {
      setInboundFlights([]);
    }
  };

  const handleSelectInboundFlight = (flight) => {
    setSelectedInboundFlight(flight);
  };

  const handleSelectFlight = () => {
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
        <div className="bg-white p-6 rounded-xl shadow-lg mb-10">
          <h2 className="text-3xl font-semibold text-blue-800 mb-6">
            🔎 Search Flights
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
                    {flight.airlineName} - {flight.flightNumber}
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
            <div className="text-center text-red-500">No results found</div>
          )
        )}
      </div>
    </div>
  );
};

export default SearchFlight;
