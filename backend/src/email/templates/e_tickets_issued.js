export default function eTicketsIssuedTemplate({ bookingResponse, reqUser }) {
  const { passengers, bookingNubmer, flights } = bookingResponse;

  const subject = `Your E-Tickets Are Ready - Booking ID ${bookingNubmer}`;

  const text = `
Dear ${reqUser.firstName} ${reqUser.lastName},

Your E-Tickets have been issued successfully for Booking ID: ${bookingNubmer}.

Passenger Tickets:
${passengers.map((p, index) => `
${index + 1}. ${p.firstName} ${p.lastName}
${(p.tickets || []).map(ticket => `- Flight ${ticket.flightNumber} | Ticket No: ${ticket.ticketNumber}`).join('\n')}
`).join('\n')}

Thank you and have a nice trip!
  `;

  const html = `
  <h1 style="color: #4CAF50;">🎟️ E-Tickets Issued</h1>
  <p>Dear ${reqUser.firstName} ${reqUser.lastName},</p>

  <p>Your E-Tickets are now available for Booking <strong>${bookingNubmer}</strong>.</p>

  <h3>Passenger Tickets:</h3>
  ${passengers.map((p, index) => `
      <div style="margin-bottom:15px;">
          <strong>${index + 1}. ${p.firstName} ${p.lastName}</strong>
          <ul>
              ${(p.tickets || []).map(ticket => `
                  <li>Flight: ${ticket.flightNumber} | Ticket No: <strong>${ticket.ticketNumber}</strong></li>
              `).join('')}
          </ul>
      </div>
  `).join('')}

  <p>Thank you for flying with us. Have a safe and pleasant journey!</p>
  `;

  return { subject, text, html };
}
