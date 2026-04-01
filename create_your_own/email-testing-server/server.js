require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const options = {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
};
console.log('Email transporter options:', options);

// Create email transporter
const transporter = nodemailer.createTransport(options);

// Health check route
app.get('/', (req, res) => {
    res.json({
        message: 'Email Testing Server is running',
        endpoints: {
            send_email: 'POST /send-email',
            verify: 'GET /verify',
        },
    });
});

// Verify transporter connection
app.get('/verify', async (req, res) => {
    try {
        await transporter.verify();
        res.json({
            success: true,
            message: 'Email transporter is ready to send emails',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Email transporter error',
            error: error.message,
        });
    }
});

// Send email route
app.post('/send-email', async (req, res) => {
    try {
        const { to, subject, text, html } = req.body;

        // Validation
        if (!to || !subject || (!text && !html)) {
            return res.status(400).json({
                success: false,
                message:
                    'Missing required fields: to, subject, and either text or html',
            });
        }

        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to,
            subject,
            text: text || undefined,
            html: html || undefined,
        };

        const info = await transporter.sendMail(mailOptions);

        res.json({
            success: true,
            message: 'Email sent successfully',
            messageId: info.messageId,
        });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send email',
            error: error.message,
        });
    }
});

// Test email route with pre-filled data
app.post('/test-email', async (req, res) => {
    try {
        const { recipientEmail } = req.body;

        if (!recipientEmail) {
            return res.status(400).json({
                success: false,
                message: 'recipientEmail is required',
            });
        }

        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: recipientEmail,
            subject: 'Test Email from Node Server',
            text: 'This is a test email',
            html: `
        <h1>Test Email</h1>
        <p>This is a test email from your Node.js Express server.</p>
        <p>Sent at: ${new Date().toLocaleString()}</p>
      `,
        };

        const info = await transporter.sendMail(mailOptions);

        res.json({
            success: true,
            message: 'Test email sent successfully',
            messageId: info.messageId,
            info,
        });
    } catch (error) {
        console.error('Error sending test email:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send test email',
            error: error.message,
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`📧 Email Testing Server running on http://localhost:${PORT}`);
    console.log(`Use POST /send-email or POST /test-email to send emails`);
});
