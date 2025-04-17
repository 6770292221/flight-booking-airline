import { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const PaymentEvents = ({ events }) => {
  const [showEvents, setShowEvents] = useState(false);

  if (!events || events.length === 0) return null;

  const labelMap = {
    SUCCESS_PAID: "Payment Successful",
    FAILED_PAID: "Payment Failed",
    REFUNDED_SUCCESS: "Refund Successful",
  };

  const toggleEvents = () => setShowEvents(!showEvents);

  return (
    <div className="mt-3">
      <button
        onClick={toggleEvents}
        className="flex items-center text-blue-600 hover:underline font-medium text-sm"
      >
        {showEvents ? (
          <FaChevronUp className="mr-1" />
        ) : (
          <FaChevronDown className="mr-1" />
        )}
        {showEvents ? "Hide Events" : "Show Events"}
      </button>

      {showEvents && (
        <div className="mt-2 space-y-2 text-sm">
          {events.map((event, idx) => {
            const payload = event.payload;
            const date = new Date(payload.paidAt || payload.refundedAt);

            return (
              <div
                key={idx}
                className="bg-gray-50 border-l-4 border-blue-400 p-3 rounded"
              >
                <p className="text-gray-800 font-medium">
                  {labelMap[payload.event] || payload.event}
                </p>
                {payload.paymentTransactionId && (
                  <p className="text-gray-600">
                    <span className="font-semibold">Transaction ID:</span>{" "}
                    {payload.paymentTransactionId}
                  </p>
                )}
                {payload.refundTransactionId && (
                  <p className="text-gray-600">
                    <span className="font-semibold">Refund ID:</span>{" "}
                    {payload.refundTransactionId}
                  </p>
                )}
                <p className="text-gray-600">
                  <span className="font-semibold">Date:</span>{" "}
                  {date.toLocaleString("en-GB", {
                    year: "numeric",
                    month: "short",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Amount:</span>{" "}
                  {payload.amount} {payload.currency}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PaymentEvents;
