import MailService from '../utils/mail_utils.js';
import bookingPendingPaymentTemplate from './templates/ booking_pending_payment.js';
import eTicketsIssuedTemplate from './templates/e_tickets_issued.js';
import paymentSuccessTemplate from './templates/payment_success.js';
import paymentFailedTemplate from './templates/payment_failed.js';
import verifyRegisterTemplate from './templates/verify_register.js';
import eTicketsFailedTemplate from './templates/e_tickets_issued_failed.js'
import refundEmailTemplate from './templates/refunds_success.js'
import emailOtpTemplate from './templates/email_otp.js';
import bookingCancelledTemplate from './templates/booking_cancelled.js';
import logger from '../utils/logger_utils.js';


export async function sendBookingPendingPaymentEmail({ bookingResponse, reqUser }) {
    const { subject, text, html } = bookingPendingPaymentTemplate({ bookingResponse, reqUser });

    try {
        const userEmail = reqUser.email;
        await MailService.sendEmail(userEmail, subject, text, html);
        logger.info(`Pending Payment email sent to ${userEmail}`);
    } catch (error) {
        logger.error("Failed to send Pending Payment email:", error);
    }
}

export async function sendETicketsIssuedEmail({ bookingResponse, reqUser }) {
    try {
        const { subject, text, html } = eTicketsIssuedTemplate({ bookingResponse, reqUser });
        const userEmail = reqUser?.email;

        if (!userEmail) {
            logger.error("No recipient email found for E-Tickets issued email");
            return;
        }

        await MailService.sendEmail(userEmail, subject, text, html);
        logger.info(`E-Tickets email sent to ${userEmail}`);
    } catch (error) {
        logger.error("Failed to send E-Tickets email:", error);
    }
}

export async function sendPaymentSuccessEmail({ bookingResponse, reqUser, payment }) {
    const { subject, text, html } = paymentSuccessTemplate({ bookingResponse, reqUser, payment });

    try {
        const userEmail = reqUser.email;
        await MailService.sendEmail(userEmail, subject, text, html);
        logger.info(`Payment Success email sent to ${userEmail}`);
    } catch (error) {
        logger.error("Failed to send Payment Success email:", error);
    }
}



export async function sendPaymentFailedEmail({ bookingResponse, reqUser, payment }) {
    const { subject, text, html } = paymentFailedTemplate({
        bookingResponse: bookingResponse,
        reqUser: reqUser,
        payment: payment
    });

    try {
        const userEmail = reqUser.email;
        await MailService.sendEmail(userEmail, subject, text, html);
        logger.info(`Payment Failed email sent to ${userEmail}`);
    } catch (error) {
        logger.error("Failed to send Payment Failed email:", error);
    }
}

export async function sendVerifyRegisterEmail(reqUser) {
    const { subject, text, html } = verifyRegisterTemplate({ reqUser });
    try {
        const userEmail = reqUser.email;
        await MailService.sendEmail(userEmail, subject, text, html);
        logger.info(`Verify email sent to ${userEmail}`);

    } catch (error) {
        logger.error("Failed to send Verify email:" + JSON.stringify(error));
    }
}


export async function sendETicketsFailedTemplate({ bookingResponse, reqUser, reason, refundAmount }) {
    try {
        const { subject, text, html } = eTicketsFailedTemplate({ bookingResponse, reqUser, reason, refundAmount });
        const userEmail = reqUser?.email;

        if (!userEmail) {
            logger.error("No recipient email found for E-Tickets issued email");
            return;
        }

        await MailService.sendEmail(userEmail, subject, text, html);
        logger.info(`E-Tickets email sent to ${userEmail}`);
    } catch (error) {
        logger.error("Failed to send E-Tickets email:", error);
    }
}

export async function sendRefundsTemplate({ bookingResponse, reqUser, reason, refundTxnId, refundAmount }) {
    try {
        const { subject, text, html } = refundEmailTemplate({ bookingResponse, reqUser, reason, refundTxnId, refundAmount });
        const userEmail = reqUser?.email;

        if (!userEmail) {
            logger.error("No recipient email found for Refunds email");
            return;
        }

        await MailService.sendEmail(userEmail, subject, text, html);
        logger.info(`Refunds email sent to ${userEmail}`);
    } catch (error) {
        logger.error("Failed to send E-Tickets email:", error);
    }
}

export async function sendOtpEmail(reqUser, otp) {
    const { subject, html } = emailOtpTemplate({ reqUser, otp });

    const to = reqUser.email;

    await MailService.sendEmail(to, subject, null, html);
}

export async function sendBookingCancelledEmail({ bookingResponse, reqUser, reason }) {
    try {
        const { subject, text, html } = bookingCancelledTemplate({ bookingResponse, reqUser, reason });
        const userEmail = reqUser?.email;

        if (!userEmail) {
            logger.error("No recipient email found for Booking Cancelled email");
            return;
        }

        await MailService.sendEmail(userEmail, subject, text, html);
        logger.info(`Booking Cancelled email sent to ${userEmail}`);
    } catch (error) {
        logger.error("Failed to send Booking Cancelled email:", error);
    }
}
