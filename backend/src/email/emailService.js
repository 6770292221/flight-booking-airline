import MailService from '../utils/mail_utils.js';
import bookingPendingPaymentTemplate from './templates/ booking_pending_payment.js';
import eTicketsIssuedTemplate from './templates/e_tickets_issued.js';
import paymentSuccessTemplate from './templates/payment_success.js';
import paymentFailedTemplate from './templates/payment_failed.js';
import verifyRegisterTemplate from './templates/verify_register.js';
import eTicketsFailedTemplate from './templates/e_tickets_issued_failed.js'


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

export async function sendPaymentSuccessEmail({ bookingResponse, reqUser }) {
    const { subject, text, html } = paymentSuccessTemplate({ bookingResponse, reqUser });

    try {
        const userEmail = reqUser.email;
        await MailService.sendEmail(userEmail, subject, text, html);
        console.log(`Payment Success email sent to ${userEmail}`);
    } catch (error) {
        console.error("Failed to send Payment Success email:", error);
    }
}


export async function sendPaymentFailedEmail({ bookingResponse, reqUser }) {
    const { subject, text, html } = paymentFailedTemplate({ bookingResponse, reqUser });

    try {
        const userEmail = reqUser.email;
        await MailService.sendEmail(userEmail, subject, text, html);
        console.log(`Payment Failed email sent to ${userEmail}`);
    } catch (error) {
        console.error("Failed to send Payment Failed email:", error);
    }
}


export async function sendVerifyRegisterEmail(reqUser) {
    const { subject, text, html } = verifyRegisterTemplate({ reqUser });
    try {
        const userEmail = reqUser.email;
        await MailService.sendEmail(userEmail, subject, text, html);
        console.log(`Verify email sent to ${userEmail}`);

    } catch (error) {
        console.error("Failed to send Verify email:", error);
    }
}


export async function sendETicketsFailedTemplate({ bookingResponse, reqUser, reason }) {
    try {
        const { subject, text, html } = eTicketsFailedTemplate({ bookingResponse, reqUser, reason });
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