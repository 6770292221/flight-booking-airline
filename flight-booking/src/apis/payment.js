
import payment from './axiosInstances/payment';

export const getPaymentDetail = (bookingId) => {
    const token = localStorage.getItem("token");

    return payment.get(
        `/payment/booking/${bookingId}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
};