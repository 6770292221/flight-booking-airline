import MailService from '../utils/mail_utils.js';
import bookingPendingPaymentTemplate from './templates/ booking_pending_payment.js';
import eTicketsIssuedTemplate from './templates/e_tickets_issued.js';


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

export async function sendETicketsIssuedEmail({ bookingResponse, reqUser }) {
    try {
        const { subject, text, html } = eTicketsIssuedTemplate({ bookingResponse, reqUser });
        const userEmail = reqUser?.email;

        if (!userEmail) {
            console.error("No recipient email found for E-Tickets issued email");
            return;
        }

        await MailService.sendEmail(userEmail, subject, text, html);
        console.log(`E-Tickets email sent to ${userEmail}`);
    } catch (error) {
        console.error("Failed to send E-Tickets email:", error);
    }
}
