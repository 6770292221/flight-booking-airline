import bookingAPI from './axiosInstances/booking';


export const getAllBookings = () => {
    return bookingAPI.get("/admin/booking");
};
