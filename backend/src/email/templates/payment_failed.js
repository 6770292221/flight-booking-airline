export default function paymentFailedTemplate({ bookingResponse, reqUser }) {
    const payment = bookingResponse.payments[0];
    const subject = `Payment Failed - Booking ID ${bookingResponse.bookingId}`;

    const text = `
  Dear ${reqUser.firstName} ${reqUser.lastName},
  
  Unfortunately, your payment was not successful.
  
  Booking ID: ${bookingResponse.bookingId}
  Payment Reference: ${payment.paymentRef}
  Amount: ${payment.amount} ${payment.currency}
  Payment Method: ${payment.paymentMethod}
  Transaction ID: ${payment.paymentTransactionId}
  Attempted At: ${new Date(payment.paidAt).toLocaleString()}
  
  Please try again to secure your booking.
  
  Thank you for choosing our service.
  `;

    const html = `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f9f9f9; padding: 20px;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; padding: 20px; font-family: Arial, sans-serif;">
            <tr>
              <td align="center" style="padding-bottom: 20px;">
                <h1 style="color: #E53935;">❌ Payment Failed</h1>
              </td>
            </tr>
  
            <tr>
              <td>
                <p style="font-size: 16px;">Dear ${reqUser.firstName} ${reqUser.lastName},</p>
                <p style="font-size: 16px;">Unfortunately, we couldn't process your payment.</p>
  
                <h3>Booking Details</h3>
                <ul>
                  <li><strong>Booking ID:</strong> ${bookingResponse.bookingId}</li>
                  <li><strong>Status:</strong> ${bookingResponse.status}</li>
                </ul>
  
                <h3>Payment Attempt Details</h3>
                <ul>
                  <li><strong>Payment Ref:</strong> ${payment.paymentRef}</li>
                  <li><strong>Transaction ID:</strong> ${payment.paymentTransactionId}</li>
                  <li><strong>Method:</strong> ${payment.paymentMethod} via ${payment.paymentProvider}</li>
                  <li><strong>Amount:</strong> ${payment.amount} ${payment.currency}</li>
                  <li><strong>Attempted At:</strong> ${new Date(payment.paidAt).toLocaleString()}</li>
                </ul>
  
                <p style="color: #E53935;">Please try again to complete your booking. Your seat is not secured until the payment is completed.</p>
  
                <p style="text-align: center; margin: 30px 0;">
                  <a href="https://yourwebsite.com/payments/${bookingResponse.bookingId}" style="background-color: #E53935; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px;">Retry Payment</a>
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
