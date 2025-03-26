export default function eTicketsIssuedTemplate({ bookingResponse, reqUser }) {
  const { passengers, bookingNubmer } = bookingResponse;

  const subject = `✈️ Your E-Tickets Are Ready - Booking ${bookingNubmer}`;

  const text = `
Dear ${reqUser.firstName} ${reqUser.lastName},

Your E-Tickets have been issued successfully for Booking ID: ${bookingNubmer}.

Passenger Tickets:
${passengers.map((p, index) => `
${index + 1}. ${p.firstName} ${p.lastName}
${(p.tickets || []).map(ticket => `- Flight ${ticket.flightNumber} | Ticket No: ${ticket.ticketNumber}`).join('\n')}
`).join('\n')}

Thank you and have a pleasant journey!
  `;

  const html = `
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f0f0f0; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; padding: 30px; font-family: Arial, sans-serif;">

          <tr>
            <td align="center" style="padding-bottom: 20px;">
              <h2 style="color: #4CAF50;">🎟️ E-Tickets Issued Successfully</h2>
            </td>
          </tr>

          <tr>
            <td>
              <p>Dear <strong>${reqUser.firstName} ${reqUser.lastName}</strong>,</p>

              <p>Your E-Tickets have been issued for Booking <strong>${bookingNubmer}</strong>.</p>

              <h3 style="color: #4CAF50;">Passenger Tickets</h3>

              ${passengers.map((p, index) => `
                <div style="margin-bottom: 15px;">
                  <strong>${index + 1}. ${p.firstName} ${p.lastName}</strong>
                  <ul>
                    ${(p.tickets || []).map(ticket => `
                      <li>Flight: ${ticket.flightNumber} | Ticket No: <strong>${ticket.ticketNumber}</strong></li>
                    `).join("")}
                  </ul>
                </div>
              `).join('')}

              <p>Thank you for flying with us. We wish you a safe and enjoyable journey!</p>

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
