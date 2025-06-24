import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MenuBar from "../pages/MenuBar";
import { getPaymentDetail, postPaymentWebhook } from "../apis/payment";
import Swal from "sweetalert2";

const PaymentPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const bookingId = state?.bookingId;

  const [paymentData, setPaymentData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("-- Please select --");
  const [cardType, setCardType] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [nameOnCard, setNameOnCard] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaymentAvailable, setIsPaymentAvailable] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [bookingNumber, setBookingNumber] = useState("");

  useEffect(() => {
    if (bookingId) {
      const fetchPaymentData = async () => {
        setIsLoading(true);
        try {
          const response = await getPaymentDetail(bookingId);
          if (response.data.status === "success") {
            setPaymentData(response.data.data.payment);
            setBookingNumber(response.data.data.bookingNumber);
          } else {
            setError(response.data.message);
          }
        } catch {
          setError("Failed to fetch payment data. Please try again.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchPaymentData();
    }
  }, [bookingId]);

  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
    setIsPaymentAvailable(e.target.value === "Credit / Debit Card");
  };

  const handleCardTypeChange = (e) => setCardType(e.target.value);

  const handlePayment = async () => {
    setError("");

    if (
      !paymentData ||
      paymentMethod === "-- Please select --" ||
      !cardNumber ||
      !nameOnCard ||
      !expiryDate ||
      !cvv
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    // ลบขีดออกจากหมายเลขบัตรก่อนตรวจสอบ
    const sanitizedCardNumber = cardNumber.replace(/-/g, "");

    if (!/^\d{16}$/.test(sanitizedCardNumber)) {
      setError("Card number must be 16 digits.");
      return;
    }

    // ลบขีดเฉียงออกจากวันหมดอายุก่อนตรวจสอบ
    const sanitizedExpiryDate = expiryDate.replace(/\//g, "");

    if (!/^(0[1-9]|1[0-2])\d{2}$/.test(sanitizedExpiryDate)) {
      setError("Expiry must be in MM/YY format.");
      return;
    }

    if (!/^\d{3}$/.test(cvv)) {
      setError("CVV must be a 3-digit number.");
      return;
    }

    setIsProcessing(true);
    try {
      const eventPayload = {
        event: cardType === "JCB" ? "FAILED_PAID" : "SUCCESS_PAID",
        paymentRef: paymentData.paymentRef,
        paymentTransactionId: `PYND-${Date.now()}`,
        paymentMethod: "CREDIT_CARD",
        paymentProvider: "2C2P",
        cardType: cardType.toUpperCase(),
        amount: paymentData.amount,
        currency: paymentData.currency,
        paidAt: new Date().toISOString(),
      };

      const response = await postPaymentWebhook(eventPayload);

      if (response.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Payment Successful!",
          text: "Your payment has been completed. Click OK to view your payment status.",
          confirmButtonText: "Go to History",
        }).then((result) => {
          if (result.isConfirmed) {
            navigate("/payments");
          }
        });
      } else {
        setError("Payment failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to process payment. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50">
      <MenuBar />
      <div className="max-w-md mx-auto mt-8 bg-white shadow-md rounded-lg p-4">
        <h2 className="text-xl font-semibold text-blue-700 text-center mb-1">
          Transaction Details
        </h2>
        {paymentData?.paymentRef && (
          <p className="text-center text-xs text-gray-500 mb-4">
            Payment Ref: {paymentData.paymentRef}
          </p>
        )}

        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 mb-3 rounded text-sm"
            data-testid="payment-error"
          >
            {error}
          </div>
        )}

        {isLoading ? (
          <p className="text-center text-blue-600 text-sm">Loading...</p>
        ) : (
          <>
            <Input label="Payment Provider" value="2C2P" readOnly />
            <Input label="Booking Number" value={bookingNumber} readOnly />
            <Input
              label="Amount"
              value={
                paymentData
                  ? `${paymentData.amount} ${paymentData.currency}`
                  : ""
              }
              readOnly
            />

            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">
                Payment Method
              </label>
              <select
                className="w-full p-2 border rounded focus:ring-1 focus:ring-blue-500 text-sm"
                data-testid="select-payment-method"
                value={paymentMethod}
                onChange={handlePaymentMethodChange}
              >
                <option>-- Please select --</option>
                <option value="Credit / Debit Card">Credit Card</option>
                <option value="Bank Transfer" disabled>
                  Bank Transfer (Not Available)
                </option>
                <option value="PromptPay" disabled>
                  PromptPay (Not Available)
                </option>
              </select>
              {!isPaymentAvailable && (
                <p className="text-xs text-red-500 mt-1">
                  This payment method is not available.
                </p>
              )}
            </div>

            {paymentMethod === "Credit / Debit Card" && (
              <>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">
                    Card Type
                  </label>
                  <div className="flex flex-wrap gap-4 items-center">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="cardType"
                        value="Visa"
                        checked={cardType === "Visa"}
                        onChange={handleCardTypeChange}
                        className="form-radio text-blue-600"
                        data-testid="radio-card-visa"
                      />
                      <img
                        src="https://img.icons8.com/color/48/visa.png"
                        alt="Visa"
                        className="w-8 h-8"
                      />
                      <span className="text-sm">Visa</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="cardType"
                        value="MasterCard"
                        checked={cardType === "MasterCard"}
                        onChange={handleCardTypeChange}
                        className="form-radio text-blue-600"
                        data-testid="radio-card-mastercard"
                      />
                      <img
                        src="https://img.icons8.com/color/48/mastercard.png"
                        alt="MasterCard"
                        className="w-8 h-8"
                      />
                      <span className="text-sm">MasterCard</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="cardType"
                        value="JCB"
                        checked={cardType === "JCB"}
                        onChange={handleCardTypeChange}
                        className="form-radio text-blue-600"
                        data-testid="radio-card-jcb"
                      />
                      <img
                        src="https://img.icons8.com/color/48/jcb.png"
                        alt="JCB"
                        className="w-8 h-8"
                      />
                      <span className="text-sm">JCB</span>
                    </label>
                  </div>
                </div>

                <Input
                  label="Card Number"
                  value={cardNumber}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, "").slice(0, 16);
                    value = value.replace(/(.{4})/g, "$1-").replace(/-$/, "");
                    setCardNumber(value);
                  }}
                  placeholder="0000-0000-0000-0000"
                  testId="input-card-number"
                />

                <Input
                  label="Name on Card"
                  value={nameOnCard}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^[A-Za-z\s]*$/.test(value)) {
                      setNameOnCard(value);
                    }
                  }}
                  placeholder="John Doe"
                  testId="input-name-on-card"
                />
                <div className="flex gap-3">
                  <div className="w-1/2">
                    <Input
                      label="Expiry Date"
                      value={expiryDate}
                      onChange={(e) => {
                        let value = e.target.value
                          .replace(/[^\d]/g, "")
                          .slice(0, 4);
                        if (value.length >= 3) {
                          value = `${value.slice(0, 2)}/${value.slice(2)}`;
                        }
                        setExpiryDate(value);
                      }}
                      placeholder="MM/YY"
                      testId="input-expiry"
                    />
                  </div>
                  <div className="w-1/2">
                    <Input
                      label="CVV"
                      value={cvv}
                      onChange={(e) => {
                        const value = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 3);
                        setCvv(value);
                      }}
                      placeholder="123"
                      testId="input-cvv"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="text-center mt-4">
              <button
                onClick={handlePayment}
                disabled={isProcessing}
                data-testid="btn-confirm-payment"
                className={`w-full bg-blue-600 text-white py-1.5 rounded text-sm hover:bg-blue-700 transition ${
                  isProcessing ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isProcessing ? "Processing..." : "Confirm Payment"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const Input = ({
  label,
  value,
  onChange,
  placeholder = "",
  readOnly = false,
  testId,
}) => (
  <div className="mb-3">
    <label className="block text-sm font-medium mb-1">{label}</label>
    <input
      type="text"
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      placeholder={placeholder}
      data-testid={testId}
      className="w-full p-2 border rounded focus:ring-1 focus:ring-blue-500 text-sm"
    />
  </div>
);

export default PaymentPage;
