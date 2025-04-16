// src/components/FlightJourneyTracker.jsx

import React from 'react';
import { FaPlaneDeparture, FaPlaneArrival, FaCheckCircle, FaArrowRight } from 'react-icons/fa';

const FlightJourneyTracker = ({
  direction,
  selectedOutboundFlight,
  selectedInboundFlight,
  onOutboundClick,
  onInboundClick,
}) => {
  const stepBaseClasses = 'flex flex-col items-center cursor-pointer'; // Added cursor-pointer
  const iconBaseClasses = 'rounded-full p-3 border-2';
  const textBaseClasses = 'mt-2 font-semibold text-sm text-center';
  const arrowBaseClasses = 'text-gray-400';

  return (
    <div className="flex items-center justify-center mb-8">
      {/* Step 1: Select Outbound Flight */}
      <div
        className={`${stepBaseClasses} ${selectedOutboundFlight ? 'opacity-50' : 'text-blue-600'}`}
        onClick={onOutboundClick}
        disabled={selectedOutboundFlight} // Disable if already selected
      >
        <div className={`${iconBaseClasses} ${selectedOutboundFlight ? 'border-gray-400' : 'border-blue-600'} ${!selectedOutboundFlight && 'bg-blue-100'}`}>
          <FaPlaneDeparture size={24} />
        </div>
        <span className={`${textBaseClasses} ${!selectedOutboundFlight && 'text-blue-600'}`}>
          Select Outbound
        </span>
      </div>

      {/* Arrow 1 */}
      <div className={`mx-4 ${arrowBaseClasses}`}>
        <FaArrowRight size={20} />
      </div>

      {direction === "ROUNDTRIP" && (
        <>
          {/* Step 2: Select Inbound Flight */}
          <div
            className={`${stepBaseClasses} ${selectedOutboundFlight && !selectedInboundFlight ? 'text-blue-600' : 'opacity-50'}`}
            onClick={onInboundClick}
            disabled={!selectedOutboundFlight || selectedInboundFlight} // Disable if outbound not selected or inbound already selected
          >
            <div className={`${iconBaseClasses} ${selectedOutboundFlight && !selectedInboundFlight ? 'border-blue-600' : 'border-gray-400'} ${selectedOutboundFlight && !selectedInboundFlight && 'bg-blue-100'}`}>
              <FaPlaneArrival size={24} />
            </div>
            <span className={`${textBaseClasses} ${selectedOutboundFlight && !selectedInboundFlight && 'text-blue-600'}`}>
              Select Inbound
            </span>
          </div>

          {/* Arrow 2 */}
          <div className={`mx-4 ${arrowBaseClasses}`}>
            <FaArrowRight size={20} />
          </div>
        </>
      )}

      {/* Step 3: Confirm Flight */}
      <div className={`${stepBaseClasses} ${direction === "ONEWAY" && selectedOutboundFlight ? 'text-green-600' : (direction === "ROUNDTRIP" && selectedOutboundFlight && selectedInboundFlight ? 'text-green-600' : 'opacity-50')}`}>
        <div className={`${iconBaseClasses} ${direction === "ONEWAY" && selectedOutboundFlight ? 'border-green-600' : (direction === "ROUNDTRIP" && selectedOutboundFlight && selectedInboundFlight ? 'border-green-600' : 'border-gray-400')} ${ (direction === "ONEWAY" && selectedOutboundFlight) || (direction === "ROUNDTRIP" && selectedOutboundFlight && selectedInboundFlight) ? 'bg-green-100' : ''}`}>
          <FaCheckCircle size={24} />
        </div>
        <span className={`${textBaseClasses} ${ (direction === "ONEWAY" && selectedOutboundFlight) || (direction === "ROUNDTRIP" && selectedOutboundFlight && selectedInboundFlight) ? 'text-green-600' : ''}`}>
          {direction === "ONEWAY" ? 'Proceed to Booking' : 'Proceed to Booking'}
        </span>
      </div>
    </div>
  );
};

export default FlightJourneyTracker;