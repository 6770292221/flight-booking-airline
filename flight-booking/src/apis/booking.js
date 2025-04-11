import booking from './axiosInstances/booking';

export const getBookings = () => {
    const token = localStorage.getItem("token");

    return booking.get('/my/booking', {
        headers: {
            Authorization: `Bearer ${token}`,
        }
    });
};

export const cancelBooking = (bookingId) => {
    const token = localStorage.getItem("token");

    return booking.patch(
        `/booking/${bookingId}/cancel`, // Use the booking instance for the cancel API
        {},
        {
            headers: {
                Authorization: `Bearer ${token}`, // Send the token in headers
            },
        }
    );
};

export const getPendingBookings = () => {
    const token = localStorage.getItem("token");

    return booking.get('/pending/booking', {
        headers: {
            Authorization: `Bearer ${token}`,
        }
    });
};