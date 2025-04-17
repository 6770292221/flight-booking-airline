import payment from './axiosInstances/payment';

export const getPaymentDetail = (bookingId) => {
    return payment.get(`/payment/booking/${bookingId}`);
};

export const getPayments = (bookingId) => {
    return payment.get(`/payments`);
};
