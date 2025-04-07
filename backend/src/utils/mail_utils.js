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
            const info = await this.transporter.sendMail(mailOptions);
            return info;
        } catch (err) {
            console.error('Failed to send email:', err);
            throw err;
        }
    }

}


export default MailService.getInstance()