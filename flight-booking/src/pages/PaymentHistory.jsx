import React, { useEffect, useState } from "react";
import { getPayments } from "../apis/payment";
import StatusPayment from "../pages/Components/StatusPayment";
import MenuBar from "../pages/MenuBar";
import PaymentEvents from "../pages/Components/PaymentEvents";
import {
  FaMoneyBillWave,
  FaClock,
  FaCreditCard,
  FaLink,
  FaMoneyCheckAlt,
} from "react-icons/fa";

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchRef, setSearchRef] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const response = await getPayments();
        if (response.data.status === "success") {
          setPayments(response.data.data);
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        setError("Failed to fetch payment history.");
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const filtered = payments.filter((p) => {
    const matchRef = p.paymentRef
      .toLowerCase()
      .includes(searchRef.toLowerCase());
    const matchStatus =
      statusFilter === "ALL" || p.paymentStatus === statusFilter;
    return matchRef && matchStatus;
  });

  const getCardLogo = (cardType) => {
    if (cardType === "VISA") return "https://img.icons8.com/color/48/visa.png";
    if (cardType === "MasterCard")
      return "https://img.icons8.com/color/48/mastercard.png";
    if (cardType === "JCB") return "https://img.icons8.com/color/48/jcb.png";
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-blue-50 pb-10">
      <MenuBar />

      <div className="max-w-5xl mx-auto px-6 py-10">
        <h2 className="text-3xl font-bold text-blue-900 mb-8 border-b pb-2">
          Payment History
        </h2>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <input
            type="text"
            placeholder="🔍 Search by Payment Ref"
            value={searchRef}
            onChange={(e) => setSearchRef(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg flex-1 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg w-52 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUCCESS">Success</option>
            <option value="REJECTED">Rejected</option>
            <option value="PENDING">Pending</option>
            <option value="REFUNDED">Refunded</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>

        {/* Payment List */}
        {loading ? (
          <div className="text-center text-gray-600">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-gray-500">No matching results.</div>
        ) : (
          <div className="space-y-6">
            {filtered.map((payment) => (
              <div
                key={payment._id}
                className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition"
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="text-base font-semibold text-gray-800">
                    Ref:{" "}
                    <span className="text-blue-600">{payment.paymentRef}</span>
                  </div>
                  <StatusPayment status={payment.paymentStatus} />
                </div>

                <div className="text-sm text-gray-700 space-y-1">
                  <p className="flex items-center gap-2">
                    <FaMoneyBillWave className="text-green-500" />
                    <span className="font-semibold">Amount:</span>{" "}
                    {payment.amount} {payment.currency}
                  </p>

                  {payment.paidAt && (
                    <p className="flex items-center gap-2">
                      <FaClock className="text-blue-500" />
                      <span className="font-semibold">Paid At:</span>{" "}
                      {new Date(payment.paidAt).toLocaleString("en-GB")}
                    </p>
                  )}

                  <p className="flex items-center gap-2">
                    <FaCreditCard className="text-purple-500" />
                    <span className="font-semibold">Method:</span>{" "}
                    {payment.paymentMethod}{" "}
                    {payment.cardType && (
                      <>
                        <img
                          src={getCardLogo(payment.cardType)}
                          alt={payment.cardType}
                          className="w-6 h-6 inline-block"
                        />{" "}
                        ({payment.cardType})
                      </>
                    )}{" "}
                    via {payment.paymentProvider}
                  </p>

                  <p className="flex items-center gap-2">
                    <FaLink className="text-gray-600" />
                    <span className="font-semibold">Booking ID:</span>{" "}
                    {payment.bookingId}
                  </p>
                </div>

                {payment.refund && (
                  <div className="mt-3 bg-green-100 p-3 rounded-lg text-sm text-green-800 border border-green-200 flex items-start gap-2">
                    <FaMoneyCheckAlt className="text-green-600 mt-1" />
                    <div>
                      <span className="font-semibold">Refunded:</span>{" "}
                      {payment.refund.refundAmount} {payment.currency} (
                      {payment.refund.refundStatus}) at{" "}
                      {new Date(payment.refund.refundedAt).toLocaleString(
                        "en-GB"
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-4">
                  <PaymentEvents events={payment.events} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentHistory;
