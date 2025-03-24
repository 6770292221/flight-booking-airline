import MailService from '../utils/mail_utils.js';
import bookingPendingPaymentTemplate from './templates/ booking_pending_payment.js';

export async function sendBookingPendingPaymentEmail({ bookingResponse, reqUser }) {
    const { subject, text, html } = bookingPendingPaymentTemplate({ bookingResponse, reqUser });

    try {
        const userEmail = reqUser.email;
        await MailService.sendEmail(userEmail, subject, text, html);
        console.log(`Pending Payment email sent to ${userEmail}`);
    } catch (error) {
        console.error("Failed to send Pending Payment email:", error);
    }
}
