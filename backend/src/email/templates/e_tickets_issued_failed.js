export default function eTicketsFailedTemplate({ bookingResponse, reqUser, reason, refundAmount, refundTransactionId }) {
    const { bookingNubmer } = bookingResponse;

    const subject = `❌ Ticket Issuance Failed - Booking ID ${bookingNubmer}`;

    const text = `
  Dear ${reqUser.firstName} ${reqUser.lastName},
  
  Unfortunately, your ticket issuance for Booking ID ${bookingNubmer} has failed.
  
  Reason: ${reason}
  
  A refund of ${refundAmount} THB has been issued.
  
  
  Please allow up to 24 hours for the refund to be reflected in your account.
  
  We apologize for the inconvenience. If you have any questions, please contact our support team.
  
  Best regards,  
  Customer Service Team
    `;

    const html = `
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9f9f9; padding: 20px;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; padding: 30px; font-family: Arial, sans-serif;">
  
            <tr>
              <td align="center" style="padding-bottom: 20px;">
                <h2 style="color: #e53935;">❌ Ticket Issuance Failed</h2>
              </td>
            </tr>
  
            <tr>
              <td>
                <p>Dear <strong>${reqUser.firstName} ${reqUser.lastName}</strong>,</p>
  
                <p>We regret to inform you that the ticket issuance for your booking <strong>${bookingNubmer}</strong> was not successful.</p>
  
                <p><strong>Reason:</strong> <em style="color:#e53935;">${reason}</em></p>
  
                <hr/>
  
                <p>A refund has been issued for the full amount of <strong>${refundAmount} THB</strong>.</p>
                <p>Please allow up to <strong>24 hours</strong> for the refund to reflect in your account.</p>
  
                <p>If you have any questions or need assistance, please feel free to contact our support team.</p>
  
                <br/>
                <p>Best regards,</p>
                <p><strong>Customer Service Team</strong></p>
              </td>
            </tr>
  
          </table>
        </td>
      </tr>
    </table>
    `;

    return { subject, text, html };
}