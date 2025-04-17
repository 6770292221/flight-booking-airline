// Import necessary libraries and components
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
  FaExclamationTriangle,
} from "react-icons/fa";
import MenuBar from "../pages/MenuBar";
import countries from "./Components/Countries"; // Import countries list
import { createBooking } from "../apis/booking";

const SelectFlight = () => {

  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Extract data from location state
  const location = useLocation();
  const {
    outbound,
    inbound,
    flight,
    passengerCount,
    adults,
    children,
    infants,
    logoUrlOutbound,
    logoUrlInbound,
  } = location.state;
  const selectedOutbound = outbound || flight; // Use outbound flight or fallback to single flight

  // State for outbound add-ons (per passenger)
  const [outboundAddons, setOutboundAddons] = useState(
    Array.from({ length: passengerCount || 0 }, () => [])
  );

  // State for inbound add-ons (per passenger)
  const [inboundAddons, setInboundAddons] = useState(
    Array.from({ length: passengerCount || 0 }, () => [])
  );

  // Initialize passengers state
  const [passengers, setPassengers] = useState(() => {
    // Use functional update form for complex initial state
    if (passengerCount <= 0) {
      return []; // Handle case where there are no passengers
    }
    return Array.from({ length: passengerCount }, (_, idx) => {
      // Use index 'idx'
      let passengerType;
      if (idx < adults) {
        passengerType = "ADULT"; // <<< This line was hardcoded before
      } else if (idx < adults + children) {
        passengerType = "CHILD"; // <<< This logic determines the type
      } else {
        passengerType = "INFANT"; // <<< Based on index and counts
      }

      return {
        firstName: "",
        lastName: "",
        type: passengerType, // Assign the correctly determined type
        gender: "",
        dateOfBirth: "",
        nationality: "",
        nationalId: "",
        passportNumber: "",
        addons: [], // Keep initial addons empty here
        seatSelected: false,
        mealSelected: false,
      };
    });
  });

  // Initialize errors state
  const [errors, setErrors] = useState(
    Array.from({ length: passengerCount }, () => ({}))
  );

  // Render flight summary for outbound and inbound flights
  const renderFlightSummary = (label, data, logoUrl) => {
    if (!data) return null;

    return (
      <div className="border p-4 rounded-xl mb-6 bg-white shadow-md flex items-center">
        {" "}
        {/* Added flex and items-center */}
        <div>
          <h3 className="font-bold text-lg mb-3 text-blue-700 flex items-center gap-2">
            <FaTicketAlt className="text-blue-500" /> {label}
          </h3>
          <div>
            {logoUrl && (
              <img
                src={logoUrl}
                alt={`${data.airlineName || ""} logo`}
                className="h-10 w-30 mr-3 rounded-full object-contain flex-shrink-0"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 text-gray-800">
            <div className="space-y-1">
              {/* Flight details */}
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
              {/* Flight timing and price */}
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
      </div>
    );
  };

  // Handle input changes for passenger details
  const handleInputChange = (index, field, value) => {
    setPassengers((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
    setErrors((prevErrors) => {
      const updatedErrors = [...prevErrors];
      updatedErrors[index][field] = "";
      return updatedErrors;
    });
  };

  // Handle add-on selection (seat and meal)
  const handleFlightAddonToggle = (
    passengerIndex,
    flightType,
    addonType,
    flightNumber,
    value, // The specific value of the add-on (e.g., "12A" for seat, "Vegetarian Meal" for meal)
    amount,
    currency,
    isChecked
  ) => {
    const newAddon = {
      flightNumber: flightNumber,
      type: addonType,
      [addonType]: value, // Use the addonType as the key for the specific value
      price: {
        amount: amount.toFixed(2),
        currency: currency,
      },
    };

    const updateAddons = (prevAddons) => {
      const updated = [...prevAddons];
      const passengerAddons = updated[passengerIndex] || [];
      const existingAddonIndex = passengerAddons.findIndex(
        (addon) =>
          addon.type === addonType &&
          addon[addonType] === value &&
          addon.flightNumber === flightNumber
      );

      if (isChecked) {
        // Add the new add-on if it doesn't exist
        if (existingAddonIndex === -1) {
          updated[passengerIndex] = [...passengerAddons, newAddon];
        }
      } else {
        // Remove the add-on if it exists
        if (existingAddonIndex > -1) {
          updated[passengerIndex] = passengerAddons.filter(
            (_, index) => index !== existingAddonIndex
          );
        }
      }
      return updated;
    };

    if (flightType === "outbound") {
      setOutboundAddons(updateAddons);
    } else if (flightType === "inbound") {
      setInboundAddons(updateAddons);
    }
  };

  // Validate passenger age based on type (Adult, Child, Infant)
  const validateAge = (dateOfBirth, idx) => {
    const travelDate = new Date(selectedOutbound.departure.time); // Use the travel date
    const birthDate = new Date(dateOfBirth);
    const ageInMilliseconds = travelDate - birthDate;
    const ageInYears = ageInMilliseconds / (1000 * 60 * 60 * 24 * 365.25);

    if (idx < adults) {
      // Adult validation
      if (ageInYears < 16) {
        return "Adult must be at least 16 years old.";
      }
    } else if (idx >= adults && idx < adults + children) {
      // Child validation
      if (ageInYears < 2 || ageInYears >= 12) {
        return "Child must be between 2 and less than 12 years old.";
      }
    } else if (idx >= adults + children) {
      // Infant validation
      if (ageInYears < 0.038 || ageInYears >= 2) {
        return "Infant must be between 14 days and less than 2 years old.";
      }
    }

    return ""; // No error
  };

  // Validate the entire form
  const validateForm = () => {
    let isValid = true;
    const newErrors = Array.from({ length: passengerCount }, () => ({}));

    passengers.forEach((passenger, index) => {
      if (!passenger.firstName.trim()) {
        newErrors[index].firstName = "First Name is required";
        isValid = false;
      }
      if (!passenger.lastName.trim()) {
        newErrors[index].lastName = "Last Name is required";
        isValid = false;
      }
      if (!passenger.gender) {
        newErrors[index].gender = "Gender is required";
        isValid = false;
      }
      if (!passenger.dateOfBirth) {
        newErrors[index].dateOfBirth = "Date of Birth is required";
        isValid = false;
      } else {
        const ageError = validateAge(passenger.dateOfBirth, index);
        if (ageError) {
          newErrors[index].dateOfBirth = ageError;
          isValid = false;
        }
      }
      if (!passenger.nationality.trim()) {
        newErrors[index].nationality = "Nationality is required";
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async () => {

    if (validateForm()) {

      setIsBookingLoading(true); // Set loading to true when the request starts
      setBookingError(null);
      setBookingSuccess(false);

      const flights = [];
      if (selectedOutbound) {
        flights.push({
          direction: "OUTBOUND",
          flightNumber: selectedOutbound.flightNumber,
          airline: selectedOutbound.airline,
          airlineName: selectedOutbound.airlineName,
          departure: selectedOutbound.departure,
          arrival: selectedOutbound.arrival,
          price: selectedOutbound.price,
        });
      }
      if (inbound) {
        flights.push({
          direction: "INBOUND",
          flightNumber: inbound.flightNumber,
          airline: inbound.airline,
          airlineName: inbound.airlineName,
          departure: inbound.departure,
          arrival: inbound.arrival,
          price: inbound.price,
        });
      }

      const passengersData = passengers.map((passenger, index) => {
        const passengerData = {
          firstName: passenger.firstName,
          lastName: passenger.lastName,
          type: passenger.type,
          nationality: passenger.nationality,
          nationalId: passenger.nationalId,
          passportNumber: passenger.passportNumber,
          dateOfBirth: passenger.dateOfBirth,
          gender: passenger.gender,
          addons: [], // Initialize addons array for each passenger
        };

        const outboundPassengerAddons = outboundAddons[index] || [];
        outboundPassengerAddons.forEach((addon) => {
          passengerData.addons.push({
            flightNumber: selectedOutbound.flightNumber,
            [addon.type]: addon[addon.type], // Dynamically add 'seat' or 'meal' key
            price: addon.price,
          });
        });

        if (inbound) {
          const inboundPassengerAddons = inboundAddons[index] || [];
          inboundPassengerAddons.forEach((addon) => {
            passengerData.addons.push({
              flightNumber: inbound.flightNumber,
              [addon.type]: addon[addon.type], // Dynamically add 'seat' or 'meal' key
              price: addon.price,
            });
          });
        }

        return passengerData;
      });

      const payload = {
        flights,
        passengers: passengersData,
      };

      console.log("Booking data to send:", payload);

      try {
        const response = await createBooking(payload);
        console.log("Booking created successfully:", response.data);
        setIsBookingLoading(false); // Set loading to false on success
        setBookingSuccess(true);
        // Optionally redirect or show a success message
      } catch (error) {
        console.error("Error creating booking:", error);
        setIsBookingLoading(false); // Set loading to false on error
        setBookingError("An error occurred while creating your booking. Please try again.");
        // Optionally display a more specific error message to the user
      }
    } else {
      console.log("Form validation failed");
      // Optionally display a message to the user about validation errors
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white pb-10">
      <MenuBar />

      <div className="p-6 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-blue-800">
          Flight Summary
        </h2>

        {renderFlightSummary(
          "Outbound Flight",
          selectedOutbound,
          logoUrlOutbound // Pass the logoUrlOutbound prop
        )}
        {inbound &&
          renderFlightSummary(
            "Inbound Flight",
            inbound,
            logoUrlInbound // Pass the logoUrlInbound prop
          )}

        <h2 className="text-xl font-bold mb-4 mt-10 text-blue-800">
          Enter Passenger Details
        </h2>

        <div className="space-y-8">
          {passengers.map((p, idx) => (
            <div key={idx} className="border rounded-xl p-6 bg-white shadow-md">
              <h3 className="font-semibold mb-4 flex items-center gap-2 text-blue-600 text-lg">
                <FaUser className="text-blue-500" />
                {idx < adults && `Adult (${idx + 1} of ${adults})`}
                {idx >= adults &&
                  idx < adults + children &&
                  `Child (${idx + 1 - adults} of ${children})`}
                {idx >= adults + children &&
                  `Infant (${idx + 1 - adults - children} of ${infants})`}
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Passenger details form */}
                <div>
                  <input
                    type="text"
                    placeholder="First Name"
                    value={p.firstName}
                    onChange={(e) =>
                      handleInputChange(idx, "firstName", e.target.value)
                    }
                    className={`border p-2 rounded w-full ${
                      errors[idx]?.firstName ? "border-red-500" : ""
                    }`}
                  />
                  {errors[idx]?.firstName && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <FaExclamationTriangle /> {errors[idx].firstName}
                    </p>
                  )}
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={p.lastName}
                    onChange={(e) =>
                      handleInputChange(idx, "lastName", e.target.value)
                    }
                    className={`border p-2 rounded w-full ${
                      errors[idx]?.lastName ? "border-red-500" : ""
                    }`}
                  />
                  {errors[idx]?.lastName && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <FaExclamationTriangle /> {errors[idx].lastName}
                    </p>
                  )}
                </div>
                <div>
                  <select
                    value={
                      idx < adults
                        ? "ADULT"
                        : idx < adults + children
                        ? "CHILD"
                        : "INFANT"
                    }
                    disabled
                    className="border p-2 rounded w-full bg-gray-100 text-gray-700 cursor-not-allowed"
                  >
                    <option value="ADULT">ADULT</option>
                    <option value="CHILD">CHILD</option>
                    <option value="INFANT">INFANT</option>
                  </select>
                </div>
                <div>
                  <select
                    value={p.gender}
                    onChange={(e) =>
                      handleInputChange(idx, "gender", e.target.value)
                    }
                    className={`border p-2 rounded w-full ${
                      errors[idx]?.gender ? "border-red-500" : ""
                    }`}
                  >
                    <option value="">Select Gender</option>
                    <option value="MALE">MALE</option>
                    <option value="FEMALE">FEMALE</option>
                  </select>
                  {errors[idx]?.gender && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <FaExclamationTriangle /> {errors[idx].gender}
                    </p>
                  )}
                </div>
                <div>
                  <input
                    type="date"
                    value={p.dateOfBirth}
                    onChange={(e) =>
                      handleInputChange(idx, "dateOfBirth", e.target.value)
                    }
                    className={`border p-2 rounded w-full ${
                      errors[idx]?.dateOfBirth ? "border-red-500" : ""
                    }`}
                  />
                  {errors[idx]?.dateOfBirth && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <FaExclamationTriangle /> {errors[idx].dateOfBirth}
                    </p>
                  )}
                </div>
                <div>
                  <select
                    value={p.nationality}
                    onChange={(e) =>
                      handleInputChange(idx, "nationality", e.target.value)
                    }
                    className={`border p-2 rounded w-full ${
                      errors[idx]?.nationality ? "border-red-500" : ""
                    }`}
                  >
                    <option value="">Select Nationality</option>
                    {countries.map((country) => (
                      <option key={country.value} value={country.value}>
                        {country.label}
                      </option>
                    ))}
                  </select>
                  {errors[idx]?.nationality && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <FaExclamationTriangle /> {errors[idx].nationality}
                    </p>
                  )}
                </div>
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
                <div>
                  <label className="block mb-2 font-medium text-gray-700">
                    Outbound Flight Add-ons (Optional)
                  </label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={outboundAddons[idx]?.some(
                          (addon) => addon.type === "meal"
                        )}
                        onChange={(e) =>
                          handleFlightAddonToggle(
                            idx,
                            "outbound",
                            "meal",
                            selectedOutbound.flightNumber,
                            "On Board Meal", // Specific meal value
                            199,
                            "THB",
                            e.target.checked
                          )
                        }
                        className="mr-2"
                      />
                      <FaUtensils className="text-green-500 mr-1" /> On Board
                      Meal (199 THB)
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={outboundAddons[idx]?.some(
                          (addon) => addon.type === "seat"
                        )}
                        onChange={(e) =>
                          handleFlightAddonToggle(
                            idx,
                            "outbound",
                            "seat",
                            selectedOutbound.flightNumber,
                            "12A", // Example seat value
                            1499,
                            "THB",
                            e.target.checked
                          )
                        }
                        className="mr-2"
                      />
                      <FaChair className="text-blue-500 mr-1" /> Preferred Seat
                      (1,499 THB)
                    </label>
                  </div>
                </div>

                {inbound && (
                  <div className="mt-6">
                    <label className="block mb-2 font-medium text-gray-700">
                      Inbound Flight Add-ons (Optional)
                    </label>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          checked={inboundAddons[idx]?.some(
                            (addon) => addon.type === "meal"
                          )}
                          onChange={(e) =>
                            handleFlightAddonToggle(
                              idx,
                              "inbound",
                              "meal",
                              inbound.flightNumber,
                              "On Board Meal", // Specific meal value
                              199,
                              "THB",
                              e.target.checked
                            )
                          }
                          className="mr-2"
                        />
                        <FaUtensils className="text-green-500 mr-1" /> On Board
                        Meal (199 THB)
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          checked={inboundAddons[idx]?.some(
                            (addon) => addon.type === "seat"
                          )}
                          onChange={(e) =>
                            handleFlightAddonToggle(
                              idx,
                              "inbound",
                              "seat",
                              inbound.flightNumber,
                              "12B", // Example seat value
                              1499,
                              "THB",
                              e.target.checked
                            )
                          }
                          className="mr-2"
                        />
                        <FaChair className="text-blue-500 mr-1" /> Preferred
                        Seat (1,499 THB)
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Total Price Summary Section */}
          <div className="mt-10 border rounded-xl p-6 bg-white shadow-md">
            <h2 className="text-xl font-bold mb-4 text-blue-800">
              Payment Summary
            </h2>
            <div className="space-y-2 text-gray-800">
              {/* Ticket Price */}
              <div className="flex justify-between">
                <span>Ticket Price:</span>
                <span className="font-semibold">
                  {(
                    parseFloat(selectedOutbound.price.amount) +
                    (inbound ? parseFloat(inbound.price.amount) : 0)
                  ).toFixed(2)}{" "}
                  {selectedOutbound.price.currency}
                </span>
              </div>

              {/* Add-ons Price */}
              {passengers.map((passenger, idx) => (
                <div key={idx} className="space-y-1">
                  {outboundAddons[idx]?.some(
                    (addon) => addon.type === "seat"
                  ) && (
                    <div className="flex justify-between">
                      <span>
                        Outbound Preferred Seat for{" "}
                        {idx < adults
                          ? `Adult (${idx + 1})`
                          : idx < adults + children
                          ? `Child (${idx + 1 - adults})`
                          : `Infant (${idx + 1 - adults - children})`}
                        :
                      </span>
                      <span className="font-semibold">1499.00 THB</span>
                    </div>
                  )}
                  {outboundAddons[idx]?.some(
                    (addon) => addon.type === "meal"
                  ) && (
                    <div className="flex justify-between">
                      <span>
                        Outbound On Board Meal for{" "}
                        {idx < adults
                          ? `Adult (${idx + 1})`
                          : idx < adults + children
                          ? `Child (${idx + 1 - adults})`
                          : `Infant (${idx + 1 - adults - children})`}
                        :
                      </span>
                      <span className="font-semibold">199.00 THB</span>
                    </div>
                  )}
                  {inboundAddons[idx]?.some((addon) => addon.type === "seat") &&
                    inbound && (
                      <div className="flex justify-between">
                        <span>
                          Inbound Preferred Seat for{" "}
                          {idx < adults
                            ? `Adult (${idx + 1})`
                            : idx < adults + children
                            ? `Child (${idx + 1 - adults})`
                            : `Infant (${idx + 1 - adults - children})`}
                          :
                        </span>
                        <span className="font-semibold">1499.00 THB</span>
                      </div>
                    )}
                  {inboundAddons[idx]?.some((addon) => addon.type === "meal") &&
                    inbound && (
                      <div className="flex justify-between">
                        <span>
                          Inbound On Board Meal for{" "}
                          {idx < adults
                            ? `Adult (${idx + 1})`
                            : idx < adults + children
                            ? `Child (${idx + 1 - adults})`
                            : `Infant (${idx + 1 - adults - children})`}
                          :
                        </span>
                        <span className="font-semibold">199.00 THB</span>
                      </div>
                    )}
                </div>
              ))}

              {/* Total Price */}
              <div className="flex justify-between border-t pt-2 mt-2 font-bold text-lg">
                <span>You pay:</span>
                <span>
                  {(
                    parseFloat(selectedOutbound.price.amount) +
                    (inbound ? parseFloat(inbound.price.amount) : 0) +
                    passengers.reduce((total, _, index) => {
                      const outboundAddonTotal = (
                        outboundAddons[index] || []
                      ).reduce(
                        (sum, addon) => sum + parseFloat(addon.price.amount),
                        0
                      );
                      const inboundAddonTotal = (
                        inboundAddons[index] || []
                      ).reduce(
                        (sum, addon) => sum + parseFloat(addon.price.amount),
                        0
                      );
                      return total + outboundAddonTotal + inboundAddonTotal;
                    }, 0)
                  ).toFixed(2)}{" "}
                  THB
                </span>
              </div>
            </div>
          </div>

          <div className="text-center mt-10">
          <button
            onClick={handleSubmit}
            className={`bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 rounded-lg shadow flex items-center gap-2 mx-auto ${isBookingLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isBookingLoading}
          >
            {isBookingLoading ? (
              <FaClock className="animate-spin" /> // Or a custom loading spinner
            ) : (
              <FaCheckCircle />
            )}
            {isBookingLoading ? "Confirming Booking..." : "Confirm Booking"}
          </button>

          {bookingError && (
            <p className="text-red-500 mt-4">{bookingError}</p>
          )}

          {bookingSuccess && (
            <p className="text-green-500 mt-4">Booking successful!</p>
            // Optionally add a link to a confirmation page
          )}
        </div>
        </div>
      </div>
    </div>
  );
};

export default SelectFlight;
