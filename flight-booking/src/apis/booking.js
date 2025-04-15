import booking from './axiosInstances/booking';

export const getBookings = () => {
    return booking.get('/my/booking');
};

export const cancelBooking = (bookingId) => {
    return booking.patch(`/booking/${bookingId}/cancel`);
};

export const getPendingBookings = () => {
    return booking.get('/pending/booking');
};
