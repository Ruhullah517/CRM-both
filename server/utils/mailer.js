const nodemailer = require('nodemailer');

// Single reusable transporter. Reads credentials from environment variables.
// Expected envs:
// SMTP_HOST, SMTP_PORT, SMTP_SECURE ("true"/"false"), SMTP_USER, SMTP_PASS, SMTP_FROM

let cachedTransporter = null;

function createTransporter() {
    const host = 'smtp.hostinger.com';
    const port = 587; // ✅ Correct SSL port
    const secure = false; // SSL
    const user = 'hello@blackfostercarersalliance.co.uk';
    const pass = 'Tinytoe08'; // ✅ Your email password

    const transporter = nodemailer.createTransport({
        host,
        port,
        secure, // true for port 465, false for 587
        auth: { user, pass },
        tls: {
            rejectUnauthorized: false // prevents certificate issues
        }
    });

    return transporter;
}

function getTransporter() {
    if (!cachedTransporter) {
        cachedTransporter = createTransporter();
    }
    return cachedTransporter;
}

function getFromAddress() {
    return process.env.SMTP_FROM || 'Black Foster Carers Alliance <hello@blackfostercarersalliance.co.uk>';
}

async function sendMail(options) {
    const transporter = getTransporter();
    const fromAddress = options.from || getFromAddress();
    return transporter.sendMail({ ...options, from: fromAddress });
}

module.exports = {
    getTransporter,
    sendMail,
    getFromAddress,
};


