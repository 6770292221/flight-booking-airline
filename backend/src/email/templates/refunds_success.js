export default function refundEmailTemplate({ bookingResponse, reqUser, reason, refundTxnId, refundAmount }) {
    const subject = `✅ Refund Completed - Booking ${bookingResponse.bookingNubmer}`;

    const text = `
  Dear ${reqUser.firstName} ${reqUser.lastName},
  
  Your refund for Booking ID ${bookingResponse.bookingNubmer} has been successfully processed.
  
  Reason for refund: "${reason}"
  
  Refund Amount: ${refundAmount} THB  
  Refund Transaction ID: ${refundTxnId}
  
  The refund has been completed and should reflect in your account within 24 hours.
  
  Thank you for your patience and understanding.  
  If you need further assistance, please contact our support team.
  
  Best regards,  
  Customer Service Team
    `;

    const html = `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f0f0f0; padding: 20px;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; padding: 30px; font-family: Arial, sans-serif;">
            
            <tr>
              <td align="center" style="padding-bottom: 20px;">
                <h2 style="color: #4CAF50;">✅ Refund Completed</h2>
              </td>
            </tr>
  
            <tr>
              <td>
                <p>Dear <strong>${reqUser.firstName} ${reqUser.lastName}</strong>,</p>
  
                <p>Your refund for booking <strong>${bookingResponse.bookingNubmer}</strong> has been successfully processed.</p>
  
                <p><strong>Reason:</strong> <em>${reason}</em></p>
  
                <hr/>
  
                <p><strong>Refund Amount:</strong> ${refundAmount} THB</p>
                <p><strong>Transaction ID:</strong> ${refundTxnId}</p>
                <p>The refund has been completed and should be reflected in your account within <strong>24 hours</strong>.</p>
  
                <p>If you need any help or have questions, please don't hesitate to contact our support team.</p>
  
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
