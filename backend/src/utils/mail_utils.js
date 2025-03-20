import nodemailer from 'nodemailer';
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), "config/config.env") });



class MailService {
    static instance;
    constructor() {
        if (MailService.instance) {
            return MailService.instance;
        }
        console.log(process.env.EMAIL_USER)
        this.transporter = nodemailer.createTransport({
            service: 'Gmail',
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        MailService.instance = this;
    }

    static getInstance() {
        if (!MailService.instance) {
            MailService.instance = new MailService();
        }
        return MailService.instance;
    }

    async sendEmail(to, subject, text, html = null) {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            text,
            html
        };

        try {
            const info = this.transporter.sendMail(mailOptions);
            console.log('Email sent successfully:', info.response);
            return info;
        } catch (error) {
            console.error('Error sending email:', error);
            throw new Error('Email sending failed.');
        }
    }
}


export default MailService.getInstance()


// import nodemailer from 'nodemailer';
// import dotenv from 'dotenv'
// dotenv.config({ path: "../config/config.env" });
// let transporter = nodemailer.createTransport({
//     service: 'Gmail',
//     host: 'smtp.gmail.com',
//     port: 465,
//     secure: true,
//     auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASSWORD
//     }
// });

// const mailOptions = {
//     from: "titi.changpoo@gmail.com",
//     to: "mindwua@gmail.com",
//     subject: "Hello from Node.js",
//     text: "This is a test email sent from Node.js using Nodemailer!",
// };

// async function sendMail() {
//     transporter.sendMail(mailOptions, (error, info) => {
//         if (error) {
//             console.error("Error sending email:", error);
//         } else {
//             console.log("Email sent:", info.response);
//         }
//     });
// }


// export default sendMail