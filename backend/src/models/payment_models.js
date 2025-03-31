import mongoose from "mongoose";
import { paymentDb } from "../config/connections.js";

const eventSchema = new mongoose.Schema({
    type: { type: String, required: true },
    status: { type: String, enum: ["SUCCESS", "FAILED", "REFUNDED"], required: true },
    source: { type: String, enum: ["SYSTEM", "USER", "WEBHOOK"], required: true },
    message: { type: String },
    payload: { type: mongoose.Schema.Types.Mixed },
    createdAt: { type: Date, default: Date.now }
}, { _id: false });

const refundSchema = new mongoose.Schema({
    isRefunded: { type: Boolean, default: false },
    refundAmount: { type: Number },
    refundStatus: { type: String, enum: ["PENDING", "SUCCESS", "FAILED", "REFUNDED"], default: null },
    refundTransactionId: { type: String },
    refundedAt: { type: Date }
}, { _id: false });

const paymentSchema = new mongoose.Schema({
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
    paymentRef: {
        type: String,
        unique: true,
        required: false
    },
    paymentStatus: {
        type: String,
        enum: ["SUCCESS", "PENDING", "REFUNDED", "FAILED"],
        default: "PENDING"
    },
    paymentMethod: { type: String, enum: ["CREDIT_CARD", "BANK_TRANSFER"] },
    paymentProvider: { type: String },
    paymentTransactionId: { type: String },
    amount: { type: Number, required: true },
    currency: { type: String, default: "THB" },
    paidAt: { type: Date },

    refund: refundSchema,
    events: [eventSchema]

}, { timestamps: true });

paymentSchema.pre('save', function (next) {
    if (!this.paymentRef) {
        this.paymentRef = `TXN-${this._id.toString().slice(-6).toUpperCase()}`;
    }
    next();
});


const PaymentMongooseModel = paymentDb.model("Payment", paymentSchema);
export { PaymentMongooseModel };
