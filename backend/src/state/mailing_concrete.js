import bookingPendingPaymentTemplate from "../email/templates/ booking_pending_payment.js"
import eTicketsIssuedTemplate from "../email/templates/e_tickets_issued.js";
import paymentSuccessTemplate from "../email/templates/payment_success.js";
import paymentFailedTemplate from "../email/templates/payment_failed.js";
import verifyRegisterTemplate from "../email/templates/verify_register.js";
import {EmailState} from './mailing_state.js'
import MailService from "../utils/mail_utils.js";
export class BookingPendingPaymentState extends EmailState {
  async sendEmail({ bookingResponse, reqUser }) {
    const { subject, text, html } = bookingPendingPaymentTemplate({
      bookingResponse,
      reqUser,
    });
    const userEmail = reqUser.email;

    await MailService.sendEmail(userEmail, subject, text, html);
    console.log(`✅ Pending Payment email sent to ${userEmail}`);
  }
}

export class ETicketsIssuedState extends EmailState {
  async sendEmail({ bookingResponse, reqUser }) {
    const { subject, text, html } = eTicketsIssuedTemplate({
      bookingResponse,
      reqUser,
    });
    const userEmail = reqUser?.email;

    if (!userEmail) {
      console.error("❗ No recipient email found for E-Tickets issued email");
      return;
    }

    await MailService.sendEmail(userEmail, subject, text, html);
    console.log(`✅ E-Tickets email sent to ${userEmail}`);
  }
}

export class PaymentSuccessState extends EmailState {
  async sendEmail({ bookingResponse, reqUser }) {
    const { subject, text, html } = paymentSuccessTemplate({
      bookingResponse,
      reqUser,
    });
    const userEmail = reqUser.email;

    await MailService.sendEmail(userEmail, subject, text, html);
    console.log(`✅ Payment Success email sent to ${userEmail}`);
  }
}

export class PaymentFailedState extends EmailState {
  async sendEmail({ bookingResponse, reqUser }) {
    const { subject, text, html } = paymentFailedTemplate({
      bookingResponse,
      reqUser,
    });
    const userEmail = reqUser.email;

    await MailService.sendEmail(userEmail, subject, text, html);
    console.log(`❌ Payment Failed email sent to ${userEmail}`);
  }
}

export class VerifyRegisterState extends EmailState {
  async sendEmail({ bookingResponse, reqUser }) {
    const { subject, text, html } = verifyRegisterTemplate({ reqUser });
    const userEmail = reqUser.email;

    await MailService.sendEmail(userEmail, subject, text, html);
    console.log(`✅ Verify email sent to ${userEmail}`);
  }
}
