import React from "react";
import {
  FaHourglassHalf,
  FaTimesCircle,
  FaCheckCircle,
  FaTicketAlt,
  FaBan,
  FaExclamationTriangle,
  FaMoneyCheckAlt,
} from "react-icons/fa";

const StatusBadge = ({ status }) => {
  switch (status) {
    case "PENDING":
      return (
        <span className="inline-flex items-center px-2 py-1 text-sm font-medium text-yellow-800 bg-yellow-100 rounded-full">
          <FaHourglassHalf className="mr-1" /> Pending
        </span>
      );
    case "CANCELLED":
      return (
        <span className="inline-flex items-center px-2 py-1 text-sm font-medium text-red-800 bg-red-100 rounded-full">
          <FaBan className="mr-1" /> Cancelled
        </span>
      );
    case "ISSUED":
      return (
        <span className="inline-flex items-center px-2 py-1 text-sm font-medium text-green-800 bg-green-100 rounded-full">
          <FaTicketAlt className="mr-1" /> Issued
        </span>
      );
    case "FAILED_ISSUED":
      return (
        <span className="inline-flex items-center px-2 py-1 text-sm font-medium text-red-800 bg-red-100 rounded-full">
          <FaExclamationTriangle className="mr-1" /> Failed Issued
        </span>
      );
    case "FAILED_PAID":
      return (
        <span className="inline-flex items-center px-2 py-1 text-sm font-medium text-rose-800 bg-rose-100 rounded-full">
          <FaTimesCircle className="mr-1" /> Failed Paid
        </span>
      );
    case "PAID":
      return (
        <span className="inline-flex items-center px-2 py-1 text-sm font-medium text-emerald-800 bg-emerald-100 rounded-full">
          <FaMoneyCheckAlt className="mr-1" /> Paid
        </span>
      );
    case "TICKETING":
      return (
        <span className="inline-flex items-center px-2 py-1 text-sm font-medium text-blue-800 bg-blue-100 rounded-full">
          <FaCheckCircle className="mr-1" /> Ticketing
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

export default StatusBadge;
