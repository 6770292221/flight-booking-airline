export default function bookingCancelledTemplate({ bookingResponse, reqUser, reason }) {
    const fullName = `${reqUser.firstName || ""} ${reqUser.lastName || ""}`.trim() || "Valued Customer";

    const subject = `Booking Cancelled - Booking ID ${bookingResponse.bookingNubmer}`;

    const text = `
  Dear ${fullName},
  
  We’d like to inform you that your booking has been cancelled.
  
  Booking ID: ${bookingResponse.bookingNubmer}
  Status: ${bookingResponse.status}
  Reason: ${reason}
  
  If this was a mistake or you need help, please contact our support team.
  
  Thank you,
  The Airline Team
  `;

    const html = `
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5; padding: 30px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; padding: 30px; font-family: Arial, sans-serif; border-radius: 8px;">
          <tr>
            <td align="center" style="padding-bottom: 20px;">
              <h2 style="color: #d9534f;">📌 Booking Cancelled</h2>
            </td>
          </tr>
          <tr>
            <td>
              <p style="font-size: 16px;">Dear ${fullName},</p>
              <p style="font-size: 16px;">We’d like to inform you that your booking has been <strong>cancelled</strong>.</p>
  
              <h3 style="margin-top: 30px;">Booking Details</h3>
              <ul style="font-size: 16px; line-height: 1.6;">
                <li><strong>Booking ID:</strong> ${bookingResponse.bookingNubmer}</li>
                <li><strong>Status:</strong> ${bookingResponse.status}</li>
                <li><strong>Reason:</strong> ${reason}</li>
              </ul>
  
              <p style="font-size: 14px; color: #666;">If this was a mistake or you need help, please contact our support team.</p>
  
              <p style="font-size: 14px; color: #999; text-align: center;">&copy; ${new Date().getFullYear()} Your Airline Company</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
  `;

    return { subject, text, html };
}
