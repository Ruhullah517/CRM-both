const nodemailer = require('nodemailer');

// Single reusable transporter. Reads credentials from environment variables.
// Expected envs:
// SMTP_HOST, SMTP_PORT, SMTP_SECURE ("true"/"false"), SMTP_USER, SMTP_PASS, SMTP_FROM

let cachedTransporter = null;

function createTransporter() {
    // Prefer SendGrid if API key is provided
    if (process.env.SENDGRID_API_KEY) {
        const transporter = nodemailer.createTransport({
            host: 'smtp.sendgrid.net',
            port: 587,
            secure: false,
            auth: { user: 'apikey', pass: process.env.SENDGRID_API_KEY },
            connectionTimeout: 30000,
            greetingTimeout: 15000,
            socketTimeout: 30000,
        });
        console.log('Mailer: Using SendGrid SMTP configuration');
        return transporter;
    }

    // Fallback to Gmail (existing behavior)
    const user = 'blackfostercarersalliance@gmail.com';
    const pass = 'lwvx onhb nujr mqnp'; // Gmail App Password

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass },
        connectionTimeout: 30000,
        greetingTimeout: 15000,
        socketTimeout: 30000,
    });
    console.log('Mailer: Using Gmail service configuration');
    return transporter;
}


function getTransporter() {
    if (!cachedTransporter) {
        cachedTransporter = createTransporter();
    }
    return cachedTransporter;
}

function getFromAddress() {
    return process.env.SMTP_FROM || 'Black Foster Carers Alliance <blackfostercarersalliance@gmail.com>';
}

async function sendMail(options) {
    const fromAddress = options.from || getFromAddress();

    console.log('Mailer: Sending email with options:', {
        from: fromAddress,
        to: options.to,
        subject: options.subject,
        hasHtml: !!options.html
    });

    try {
        const transporter = getTransporter();
        const result = await transporter.sendMail({ ...options, from: fromAddress });
        console.log('Mailer: Email sent:', result.messageId || 'OK');
        return result;
    } catch (error) {
        console.error('Mailer: Send failed:', error && (error.response || error.message || error));
        throw error;
    }
}

module.exports = {
    getTransporter,
    sendMail,
    getFromAddress,
};


