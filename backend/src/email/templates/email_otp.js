export default function emailOtpTemplate({ reqUser, otp }) {
    const fullName = `${reqUser.firstName || ''} ${reqUser.lastName || ''}`.trim() || reqUser.email;

    return {
        subject: '🔐Your One-Time Password (OTP) for Login',
        html: `
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 30px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); font-family: Arial, sans-serif; padding: 40px;">
  
                <tr>
                  <td align="center" style="padding-bottom: 20px;">
                    <h2 style="color: #2F54EB; margin: 0;">Hi ${fullName},</h2>
                  </td>
                </tr>
  
                <tr>
                  <td style="text-align: center;">
                    <p style="font-size: 16px; color: #333;">
                      Please use the following OTP code to complete your login:
                    </p>
  
                    <div style="font-size: 40px; font-weight: bold; color: #2F54EB; margin: 30px 0;">
                      ${otp}
                    </div>
  
                    <p style="font-size: 14px; color: #555;">
                      This code is valid for <strong>5 minutes</strong>.
                    </p>
  
                    <p style="font-size: 13px; color: #999;">
                      If you didn’t request this code, you can safely ignore this email.
                    </p>
                  </td>
                </tr>
  
                <tr>
                  <td align="center" style="padding-top: 30px; font-size: 12px; color: #aaa;">
                    &copy; ${new Date().getFullYear()} Airline App
                  </td>
                </tr>
  
              </table>
            </td>
          </tr>
        </table>
      `,
    };
}
