import mongoose from "mongoose";

export const flightDb = mongoose.createConnection(
    "mongodb+srv://imaikungki:1wS7n7lGvEyiSo66@cluster0.r662p.mongodb.net/flight?retryWrites=true&w=majority"
);

export const userDb = mongoose.createConnection(
    "mongodb+srv://imaikungki:1wS7n7lGvEyiSo66@cluster0.r662p.mongodb.net/user?retryWrites=true&w=majority"
);


export const paymentDb = mongoose.createConnection(
    "mongodb+srv://imaikungki:1wS7n7lGvEyiSo66@cluster0.r662p.mongodb.net/payment?retryWrites=true&w=majority"
);

export const bookingDb = mongoose.createConnection(
    "mongodb+srv://imaikungki:1wS7n7lGvEyiSo66@cluster0.r662p.mongodb.net/booking?retryWrites=true&w=majority"
);
