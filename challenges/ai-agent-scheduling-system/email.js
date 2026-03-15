const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

async function sendEmail(to, subject, html) {
    const mailOptions = {
        from: process.env.SMTP_USER,
        to,
        subject,
        html,
    };
    return transporter.sendMail(mailOptions);
}

module.exports = {
    sendEmail,
};
