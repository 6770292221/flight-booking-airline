import axios from "axios";

const API_URL = `http://localhost:${process.env.PORT}/api/v1/booking-core-api/bookings/cancel-expired`;

export const cancelBooking = async () => {
    try {
        const response = await axios.patch(API_URL);
        console.log(`[Scheduler] Cancel pending booking successfully:`, response.data);
    } catch (error) {
        console.error("[Scheduler] Cancel pending booking failed:", error.message);
    }
};
