import { useLocation } from "react-router-dom";
import { useState } from "react";
import {
  FaUtensils,
  FaChair,
  FaUser,
  FaPlaneDeparture,
  FaPlaneArrival,
  FaClock,
  FaMoneyBillWave,
  FaTicketAlt,
  FaCheckCircle,
} from "react-icons/fa";
import MenuBar from "../pages/MenuBar";

const SelectFlight = () => {
  const location = useLocation();
  const { outbound, inbound, flight, passengerCount } = location.state;

  const selectedOutbound = outbound || flight;

  const [passengers, setPassengers] = useState(
    Array.from({ length: passengerCount }, () => ({
      firstName: "",
      lastName: "",
      type: "ADULT",
      gender: "",
      dateOfBirth: "",
      nationality: "",
      nationalId: "",
      passportNumber: "",
      addons: [],
      seatSelected: false,
      mealSelected: false,
    }))
  );

  const renderFlightSummary = (label, data) => {
    if (!data) return null;

    return (
      <div className="border p-4 rounded-xl mb-6 bg-white shadow-md">
        <h3 className="font-bold text-lg mb-3 text-blue-700 flex items-center gap-2">
          <FaTicketAlt className="text-blue-500" /> {label}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-800">
          <div className="space-y-1">
            <p className="flex items-center gap-2">
              <FaPlaneDeparture className="text-blue-500" />
              <strong>{data.airlineName}</strong> - {data.flightNumber}
            </p>
            <p className="flex items-center gap-2">
              <FaPlaneDeparture className="text-indigo-500" />
              {data.departure.cityName} ({data.departure.iataCode})
            </p>
            <p className="flex items-center gap-2">
              <FaPlaneArrival className="text-pink-500" />
              {data.arrival.cityName} ({data.arrival.iataCode})
            </p>
          </div>
          <div className="space-y-1">
            <p className="flex items-center gap-2">
              <FaClock className="text-gray-700" />
              {new Date(data.departure.time).toLocaleString()} →{" "}
              {new Date(data.arrival.time).toLocaleString()}
            </p>
            <p className="flex items-center gap-2 text-green-700 font-semibold">
              <FaMoneyBillWave /> {data.price.amount} {data.price.currency}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const handleInputChange = (index, field, value) => {
    setPassengers((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const handleAddonToggle = (index, type) => {
    setPassengers((prev) => {
      const updated = [...prev];
      const passenger = { ...updated[index] };
      const flightNumber = selectedOutbound.flightNumber;

      if (type === "seat") {
        passenger.seatSelected = !passenger.seatSelected;
      } else if (type === "meal") {
        passenger.mealSelected = !passenger.mealSelected;
      }

      const newAddon = {
        flightNumber,
        seat: passenger.seatSelected ? "12A" : "",
        meal: passenger.mealSelected ? "Chicken with Rice" : "",
        price: { amount: "150.00", currency: "THB" },
      };

      passenger.addons = passenger.addons.filter(
        (a) => a.flightNumber !== flightNumber
      );

      if (passenger.seatSelected || passenger.mealSelected) {
        passenger.addons.push(newAddon);
      }

      updated[index] = passenger;
      return updated;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white pb-10">
      <MenuBar />

      <div className="p-6 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-blue-800">
          Flight Summary
        </h2>

        {renderFlightSummary("Outbound Flight", selectedOutbound)}
        {inbound && renderFlightSummary("Inbound Flight", inbound)}

        <h2 className="text-xl font-bold mb-4 mt-10 text-blue-800">
          Enter Passenger Details
        </h2>

        <div className="space-y-8">
          {passengers.map((p, idx) => (
            <div key={idx} className="border rounded-xl p-6 bg-white shadow-md">
              <h3 className="font-semibold mb-4 flex items-center gap-2 text-blue-600 text-lg">
                <FaUser className="text-blue-500" /> Passenger #{idx + 1}
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="First Name"
                  value={p.firstName}
                  onChange={(e) =>
                    handleInputChange(idx, "firstName", e.target.value)
                  }
                  className="border p-2 rounded w-full"
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={p.lastName}
                  onChange={(e) =>
                    handleInputChange(idx, "lastName", e.target.value)
                  }
                  className="border p-2 rounded w-full"
                />
                <select
                  value={p.type}
                  onChange={(e) =>
                    handleInputChange(idx, "type", e.target.value)
                  }
                  className="border p-2 rounded w-full"
                >
                  <option value="ADULT">ADULT</option>
                  <option value="CHILD">CHILD</option>
                  <option value="INFANT">INFANT</option>
                </select>
                <select
                  value={p.gender}
                  onChange={(e) =>
                    handleInputChange(idx, "gender", e.target.value)
                  }
                  className="border p-2 rounded w-full"
                >
                  <option value="">Select Gender</option>
                  <option value="MALE">MALE</option>
                  <option value="FEMALE">FEMALE</option>
                  <option value="OTHER">OTHER</option>
                </select>
                <input
                  type="date"
                  value={p.dateOfBirth}
                  onChange={(e) =>
                    handleInputChange(idx, "dateOfBirth", e.target.value)
                  }
                  className="border p-2 rounded w-full"
                />
                <input
                  type="text"
                  placeholder="Nationality"
                  value={p.nationality}
                  onChange={(e) =>
                    handleInputChange(idx, "nationality", e.target.value)
                  }
                  className="border p-2 rounded w-full"
                />
                <input
                  type="text"
                  placeholder="National ID"
                  value={p.nationalId}
                  onChange={(e) =>
                    handleInputChange(idx, "nationalId", e.target.value)
                  }
                  className="border p-2 rounded w-full"
                />
                <input
                  type="text"
                  placeholder="Passport Number"
                  value={p.passportNumber}
                  onChange={(e) =>
                    handleInputChange(idx, "passportNumber", e.target.value)
                  }
                  className="border p-2 rounded w-full"
                />
              </div>

              <div className="mt-6">
                <label className="block mb-2 font-medium text-gray-700">
                  Add-ons (Optional)
                </label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={p.seatSelected}
                      onChange={() => handleAddonToggle(idx, "seat")}
                      className="mr-2"
                    />
                    <FaChair className="text-blue-500 mr-1" /> Seat (150 THB)
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={p.mealSelected}
                      onChange={() => handleAddonToggle(idx, "meal")}
                      className="mr-2"
                    />
                    <FaUtensils className="text-green-500 mr-1" /> Meal (150
                    THB)
                  </label>
                </div>
              </div>
            </div>
          ))}

          <div className="text-center mt-10">
            <button
              onClick={() => console.log("Booking confirmed:", passengers)}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 rounded-lg shadow flex items-center gap-2 mx-auto"
            >
              <FaCheckCircle /> Confirm Booking
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectFlight;
