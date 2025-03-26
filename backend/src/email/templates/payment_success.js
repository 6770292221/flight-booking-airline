export default function paymentSuccessTemplate({ bookingResponse, reqUser }) {
  const payment = bookingResponse.payments[0];
  const subject = `Payment Successful - Booking ID ${bookingResponse.bookingNubmer}`;

  const text = `
  Dear ${reqUser.firstName} ${reqUser.lastName},
  
  We have received your payment successfully!
  
  Booking ID: ${bookingResponse.bookingNubmer}
  Payment Reference: ${payment.paymentRef}
  Amount Paid: ${payment.amount} ${payment.currency}
  Payment Method: ${payment.paymentMethod}
  Transaction ID: ${payment.paymentTransactionId}
  Paid At: ${new Date(payment.paidAt).toLocaleString()}
  
  Thank you for choosing our service.
  `;

  const html = `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f9f9f9; padding: 20px;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; padding: 20px; font-family: Arial, sans-serif;">
            <tr>
              <td align="center" style="padding-bottom: 20px;">
                <h1 style="color: #4CAF50;">✅ Payment Successful!</h1>
              </td>
            </tr>
  
            <tr>
              <td>
                <p style="font-size: 16px;">Dear ${reqUser.firstName} ${reqUser.lastName},</p>
                <p style="font-size: 16px;">We have successfully received your payment.</p>
  
                <h3>Booking Details</h3>
                <ul>
                  <li><strong>Booking ID:</strong> ${bookingResponse.bookingNubmer}</li>
                  <li><strong>Status:</strong> ${bookingResponse.status}</li>
                </ul>
  
                <h3>Payment Information</h3>
                <ul>
                  <li><strong>Payment Ref:</strong> ${payment.paymentRef}</li>
                  <li><strong>Transaction ID:</strong> ${payment.paymentTransactionId}</li>
                  <li><strong>Method:</strong> ${payment.paymentMethod} via ${payment.paymentProvider}</li>
                  <li><strong>Amount:</strong> ${payment.amount} ${payment.currency}</li>
                  <li><strong>Paid At:</strong> ${new Date(payment.paidAt).toLocaleString()}</li>
                </ul>
  
                <p style="margin-top: 20px;">Thank you for choosing our airline service.</p>
  
                <p style="text-align: center; margin: 30px 0;">
                  <a href="https://yourwebsite.com/bookings/${bookingResponse.bookingNubmer}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px;">View Booking</a>
                </p>
              </td>
            </tr>
  
          </table>
        </td>
      </tr>
    </table>
    `;

  return { subject, text, html };
}
