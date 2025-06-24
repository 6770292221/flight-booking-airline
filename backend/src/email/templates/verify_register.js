export default function verifyRegisterTemplate({ reqUser }) {
    const { email } = reqUser;
    const subject = `Verify Your Email Address`;

    const text = `Verify your email address by clicking the link below:\n\nhttps://flight-booking-airline.onrender.com/user-core-api/verifyUser/${email}`;

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Verify Your Email</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; background-color: #f9f9f9; padding: 20px; }
            .container { background-color: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); max-width: 500px; margin: auto; }
            h1 { color: #4CAF50; text-align: center; }
            p { margin-bottom: 15px; }
            .btn { display: inline-block; background-color: #4CAF50; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { margin-top: 20px; font-size: 12px; color: #888; text-align: center; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🔒 Verify Your Email</h1>
            <p>Dear <strong>${reqUser.firstName} ${reqUser.lastName}</strong>,</p>
            <p>Thank you for registering with us! Please verify your email address by clicking the button below:</p>
            <div style="text-align: center;">
                <a href="https://flight-booking-airline.onrender.com/user-core-api/verifyUser/${email}" class="btn" style="color: #ffffff !important;">Verify Email</a>
            </div>
            <div class="footer">If you did not create this account, please ignore this email.</div>
        </div>
    </body>
    </html>`;

    return { subject, text, html };
}
