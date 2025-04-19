import bookingAPI from './axiosInstances/booking';


export const getAllBookings = () => {
    return bookingAPI.get("/admin/booking");
};

export const cancelBookingById = (bookingId) => {
    return bookingAPI.patch(`/booking/${bookingId}/admin/cancel`, {
        status: "CANCELLED",
    });
};