const nodemailer = require('nodemailer');

// Single reusable transporter. Reads credentials from environment variables.
// Expected envs:
// SMTP_HOST, SMTP_PORT, SMTP_SECURE ("true"/"false"), SMTP_USER, SMTP_PASS, SMTP_FROM

let cachedTransporter = null;

function createTransporter() {
    const host = 'smtp.gmail.com'; // ✅ Correct host
    const port = 465; // SSL
    const secure = true; // true for port 465
    const user = 'blackfostercarersalliance@gmail.com';
    const pass = 'vvho ubhi akem wzsq'; // Gmail App Password

    const transporter = nodemailer.createTransport({
        host,
        port,
        secure,
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
    return process.env.SMTP_FROM || 'Black Foster Carers Alliance <blackfostercarersalliance@gmail.com>';
}

async function sendMail(options) {
    const transporter = getTransporter();
    const fromAddress = options.from || getFromAddress();
    
    console.log('Mailer: Sending email with options:', {
        from: fromAddress,
        to: options.to,
        subject: options.subject,
        hasHtml: !!options.html
    });
    
    try {
        const result = await transporter.sendMail({ ...options, from: fromAddress });
        console.log('Mailer: Email sent successfully:', result.messageId);
        return result;
    } catch (error) {
        console.error('Mailer: Email sending failed:', error);
        throw error;
    }
}

module.exports = {
    getTransporter,
    sendMail,
    getFromAddress,
};


