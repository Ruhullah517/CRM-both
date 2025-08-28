const nodemailer = require('nodemailer');

// Single reusable transporter. Reads credentials from environment variables.
// Expected envs:
// SMTP_HOST, SMTP_PORT, SMTP_SECURE ("true"/"false"), SMTP_USER, SMTP_PASS, SMTP_FROM

let cachedTransporter = null;

function createTransporter() {
    const service = 'Outlook365';
    const port = 587; // ✅ Correct SSL port
    const secure = false; // SSL
    const user = 'hello@blackfostercarersalliance.co.uk';
    const pass = 'Tinytoe08'; // ✅ Your email password

    const transporter = nodemailer.createTransport({
        service,
        auth: { user, pass },

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


