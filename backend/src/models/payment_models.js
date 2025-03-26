import mongoose from "mongoose";
import { paymentDb } from "../config/connections.js";

const paymentSchema = new mongoose.Schema({
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
    paymentRef: { type: String, required: true, unique: true },
    paymentStatus: { type: String, default: "PENDING" }, // PENDING, PAID, FAILED, REFUNDED
    paymentMethod: { type: String },
    paymentProvider: { type: String },
    paymentTransactionId: { type: String },
    amount: { type: Number, required: true },
    currency: { type: String, default: "THB" },
    paidAt: { type: Date },

    isRefunded: { type: Boolean, default: false },
    refundAmount: { type: Number },
    refundStatus: { type: String, enum: ["PENDING", "SUCCESS", "FAILED"], default: null },
    refundTransactionId: { type: String },
    refundedAt: { type: Date }

}, { timestamps: true });

const PaymentMongooseModel = paymentDb.model("Payment", paymentSchema);

export { PaymentMongooseModel };
