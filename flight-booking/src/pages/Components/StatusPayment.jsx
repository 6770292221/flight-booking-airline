import React from "react";
import {
  FaCheckCircle,
  FaHourglassHalf,
  FaUndoAlt,
  FaTimesCircle,
  FaExclamationTriangle,
} from "react-icons/fa";

const StatusPayment = ({ status }) => {
  switch (status) {
    case "SUCCESS":
      return (
        <span className="inline-flex items-center px-2 py-1 text-sm font-medium text-green-800 bg-green-100 rounded-full">
          <FaCheckCircle className="mr-1" /> Success
        </span>
      );
    case "PENDING":
      return (
        <span className="inline-flex items-center px-2 py-1 text-sm font-medium text-yellow-800 bg-yellow-100 rounded-full">
          <FaHourglassHalf className="mr-1" /> Pending
        </span>
      );
    case "REFUNDED":
      return (
        <span className="inline-flex items-center px-2 py-1 text-sm font-medium text-blue-800 bg-blue-100 rounded-full">
          <FaUndoAlt className="mr-1" /> Refunded
        </span>
      );
    case "FAILED":
      return (
        <span className="inline-flex items-center px-2 py-1 text-sm font-medium text-rose-800 bg-rose-100 rounded-full">
          <FaExclamationTriangle className="mr-1" /> Failed
        </span>
      );
    case "REJECTED":
      return (
        <span className="inline-flex items-center px-2 py-1 text-sm font-medium text-red-800 bg-red-100 rounded-full">
          <FaTimesCircle className="mr-1" /> Rejected
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-1 text-sm font-medium text-gray-800 bg-gray-100 rounded-full">
          {status}
        </span>
      );
  }
};

export default StatusPayment;
