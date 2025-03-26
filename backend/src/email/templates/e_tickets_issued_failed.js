export default function eTicketsFailedTemplate({ bookingResponse, reqUser, reason }) {
    const { passengers, bookingNubmer } = bookingResponse;

    const subject = `Important: Issue with Your Booking ID ${bookingNubmer}`;

    const text = `
Dear ${reqUser.firstName} ${reqUser.lastName},

We regret to inform you that there was an issue issuing the tickets for your booking number: ${bookingNubmer} due to: ${reason}

Affected passenger(s):
${passengers.map((p, index) => `
${index + 1}. ${p.firstName} ${p.lastName}
`).join('')}

We will process your refund within 24 hours. Please check your account later. If you have any questions or concerns, feel free to contact our customer service at [contact information].

We sincerely apologize for the inconvenience.
    `;

    const html = `
    <h1 style="color: #FF5733;">⚠️ Ticket Issuance Issue</h1>
    <p>Dear ${reqUser.firstName} ${reqUser.lastName},</p>

    <p>We regret to inform you that there was an issue issuing the tickets for your booking number: <strong>${bookingNubmer}</strong> due to: <strong>${reason}</strong></p>

    <h3>Affected passenger(s):</h3>
    ${passengers.map((p, index) => `
        <div style="margin-bottom:15px;">
            <strong>${index + 1}. ${p.firstName} ${p.lastName}</strong>
        </div>
    `).join('')}

    <p>We will process your refund within 24 hours. Please check your account later. If you have any questions or concerns, feel free to contact our customer service at [contact information].</p>

    <p>We sincerely apologize for the inconvenience.</p>
    `;

    return { subject, text, html };
}
