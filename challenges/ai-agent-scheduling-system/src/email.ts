import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export async function sendEmail(
    to: string,
    subject: string,
    html: string,
): Promise<any> {
    const mailOptions = {
        from: process.env.SMTP_USER,
        to,
        subject,
        html,
    };
    return transporter.sendMail(mailOptions);
}
