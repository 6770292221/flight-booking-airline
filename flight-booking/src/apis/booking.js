import booking from './axiosInstances/booking';

export const getBookings = () => {
    const token = localStorage.getItem("token");

    return booking.get('/my/booking', {
        headers: {
            Authorization: `Bearer ${token}`,
        }
    });
};