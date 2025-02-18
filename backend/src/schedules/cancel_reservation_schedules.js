import axios from "axios";

const API_URL = `http://localhost:${process.env.PORT || 3001}/api/v1/reservation-core-api/reservation/expire`;

export const cancelReservation = async () => {
    try {
        const response = await axios.patch(API_URL);
        console.log(`[Scheduler] Cancel pending reservation successfully:`, response.data);
    } catch (error) {
        console.error("[Scheduler] Cancel pending reservation failed:", error.message);
    }
};
