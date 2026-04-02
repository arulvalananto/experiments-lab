# Email Testing Server

A simple Node.js Express server to test email sending using Nodemailer.

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your email configuration:

```bash
cp .env.example .env
```

Edit `.env` with your email provider details:

```env
PORT=3000
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password  # Use App Passwords for Gmail
EMAIL_FROM=noreply@example.com
```

### 3. Start Server

```bash
npm start
```

The server will run on `http://localhost:3000`

## API Endpoints

### 1. Health Check

```string
GET /
```

Check if server is running and see available endpoints.

### 2. Verify Email Configuration

```string
GET /verify
```

Test if your email transporter is properly configured and ready to send.

### 3. Send Email

```string
POST /send-email
Content-Type: application/json

{
  "to": "recipient@example.com",
  "subject": "Hello",
  "text": "Plain text email body",
  "html": "<h1>HTML email body</h1>"
}
```

Note: Provide either `text` or `html` (or both).

### 4. Send Test Email

```string
POST /test-email
Content-Type: application/json

{
  "recipientEmail": "recipient@example.com"
}
```

Quick way to send a pre-formatted test email.

## Example Usage

### Using curl

```bash
# Verify setup
curl http://localhost:3000/verify

# Send test email
curl -X POST http://localhost:3000/test-email \
  -H "Content-Type: application/json" \
  -d '{"recipientEmail": "your-email@example.com"}'

# Send custom email
curl -X POST http://localhost:3000/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "recipient@example.com",
    "subject": "Test Subject",
    "html": "<h1>Test</h1><p>This is a test email</p>"
  }'
```

## Email Provider Setup

### Gmail

1. Enable 2-Factor Authentication
2. Generate an App Password: <https://myaccount.google.com/apppasswords>
3. Use the app password in `.env`

### Other Providers

Adjust `EMAIL_HOST` and `EMAIL_PORT` accordingly:

- **Outlook**: smtp.office365.com:587
- **SendGrid**: smtp.sendgrid.net:587
- **Mailgun**: smtp.mailgun.org:587

## Troubleshooting

- **Auth Error**: Check EMAIL_USER and EMAIL_PASSWORD
- **Connection Error**: Verify EMAIL_HOST and EMAIL_PORT
- **Email not received**: Check spam folder, verify recipient email address
