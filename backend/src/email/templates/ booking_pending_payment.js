export default function bookingPendingPaymentTemplate({ bookingResponse, reqUser }) {

  const outboundFlight = bookingResponse.flights.find(f => f.direction === "OUTBOUND");
  const inboundFlight = bookingResponse.flights.find(f => f.direction === "INBOUND");
  const passengers = bookingResponse.passengers || [];

  const paymentDeadline = bookingResponse.expiresAt
    ? new Date(bookingResponse.expiresAt).toLocaleString()
    : "N/A";

  const flightTotalPrice = bookingResponse.flights.reduce((sum, f) => sum + parseFloat(f.price.amount || 0), 0);
  const addonsTotalPrice = passengers.reduce((sum, p) => {
    return sum + (p.addons || []).reduce((aSum, a) => aSum + parseFloat(a.price.amount || 0), 0);
  }, 0);

  const totalPrice = (flightTotalPrice + addonsTotalPrice).toFixed(2);

  const subject = `Booking Pending Payment - ${bookingResponse.bookingNubmer}`;


  const html = `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f4f4; padding: 20px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; padding: 20px; font-family: Arial, sans-serif;">
            
            <!-- Header -->
            <tr>
              <td align="center" style="padding-bottom: 20px;">
                <h1 style="color: #333333;">✈️ Flight Booking Confirmation</h1>
              </td>
            </tr>
  
            <!-- Booking Summary -->
            <tr>
              <td>
                <p style="font-size: 16px; color: #333;">Dear ${reqUser.firstName} ${reqUser.lastName || ""},</p>
                <p style="font-size: 16px; color: #333;">Thank you for booking with us! Your booking ID is <strong>${bookingResponse.bookingNubmer}</strong>.</p>
              </td>
            </tr>
  
           <!-- Flight Details -->
<tr>
  <td style="padding: 20px 0;">
    <h2 style="color: #4CAF50; border-bottom: 1px solid #eee; padding-bottom: 10px;">Flight Details</h2>
    
    <!-- OUTBOUND -->
    <table width="100%" cellpadding="5" cellspacing="0" border="0">
      <tr>
        <td><strong>Departure</strong></td>
        <td>${outboundFlight?.flightNumber || 'N/A'} - ${outboundFlight?.airlineName || 'N/A'}</td>
      </tr>
      <tr>
        <td>From</td>
        <td>${outboundFlight?.departure.cityName || 'N/A'} (${outboundFlight?.departure.iataCode || 'N/A'})</td>
      </tr>
      <tr>
        <td>To</td>
        <td>${outboundFlight?.arrival.cityName || 'N/A'} (${outboundFlight?.arrival.iataCode || 'N/A'})</td>
      </tr>
      <tr>
        <td>Departure</td>
        <td>${outboundFlight ? new Date(outboundFlight.departure.time).toLocaleString() : 'N/A'}</td>
      </tr>
      <tr>
        <td>Arrival</td>
        <td>${outboundFlight ? new Date(outboundFlight.arrival.time).toLocaleString() : 'N/A'}</td>
      </tr>
      <tr>
        <td><strong>Price</strong></td>
        <td><strong>${outboundFlight?.price.amount || '0.00'} ${outboundFlight?.price.currency || ''}</strong></td>
      </tr>
    </table>

    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">

    <!-- INBOUND -->
    <table width="100%" cellpadding="5" cellspacing="0" border="0">
      <tr>
        <td><strong>Return</strong></td>
        <td>${inboundFlight?.flightNumber || 'N/A'} - ${inboundFlight?.airlineName || 'N/A'}</td>
      </tr>
      <tr>
        <td>From</td>
        <td>${inboundFlight?.departure.cityName || 'N/A'} (${inboundFlight?.departure.iataCode || 'N/A'})</td>
      </tr>
      <tr>
        <td>To</td>
        <td>${inboundFlight?.arrival.cityName || 'N/A'} (${inboundFlight?.arrival.iataCode || 'N/A'})</td>
      </tr>
      <tr>
        <td>Departure</td>
        <td>${inboundFlight ? new Date(inboundFlight.departure.time).toLocaleString() : 'N/A'}</td>
      </tr>
      <tr>
        <td>Arrival</td>
        <td>${inboundFlight ? new Date(inboundFlight.arrival.time).toLocaleString() : 'N/A'}</td>
      </tr>
      <tr>
        <td><strong>Price</strong></td>
        <td><strong>${inboundFlight?.price.amount || '0.00'} ${inboundFlight?.price.currency || ''}</strong></td>
      </tr>
    </table>
  </td>
</tr>

  
            <!-- Passenger Details -->
            <tr>
              <td style="padding: 20px 0;">
                <h2 style="color: #4CAF50; border-bottom: 1px solid #eee; padding-bottom: 10px;">Passengers</h2>
                ${passengers.map(p => `
                  <p>
                    <strong>${p.firstName} ${p.lastName}</strong> (${p.type})<br/>
                    Passport: ${p.passportNumber}<br/>
                    Addons:
                    <ul style="padding-left: 20px;">
                      ${(p.addons || []).map(addon => `
                        <li>
                          Flight: ${addon.flightNumber}, Seat: ${addon.seat}, Meal: ${addon.meal} (${addon.price.amount} ${addon.price.currency})
                        </li>
                      `).join("")}
                    </ul>
                  </p>
                `).join("")}
              </td>
            </tr>
  
                    <h2 style="color: #E53935;">Payment Instructions</h2>
            <p>
            Please complete the payment of <strong>${totalPrice} THB</strong> through our secure payment gateway to confirm your booking.
            </p>
            <p>
            The payment must be completed by <strong>${paymentDeadline}</strong> to secure your seat. If payment is not received by this time, your booking will be automatically cancelled.
            </p>

            <!-- CTA Button -->
            <p style="text-align: center; margin: 30px 0;">
            <a href="https://yourwebsite.com/payments/${bookingResponse.bookingId}" 
                style="background-color: #4CAF50; color: #ffffff; padding: 15px 25px; text-decoration: none; border-radius: 5px;">
                Proceed to Payment
            </a>
            </p>

          </table>
        </td>
      </tr>
    </table>
    `;

  return { subject, html };
}
