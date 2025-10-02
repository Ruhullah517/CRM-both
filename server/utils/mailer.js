const nodemailer = require('nodemailer');

// Single reusable transporter. Reads credentials from environment variables.
// Expected envs:
// SMTP_HOST, SMTP_PORT, SMTP_SECURE ("true"/"false"), SMTP_USER, SMTP_PASS, SMTP_FROM

let cachedTransporter = null;

function createTransporter() {
    const user = 'ruhullah517@gmail.com';
    const pass = 'syya ehhp eioy gpwf'; // Gmail App Password

    // Try multiple configurations for better compatibility
    const configs = [
        {
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, // SSL directly
            auth: { user, pass },
            tls: { minVersion: 'TLSv1.2' },
            connectionTimeout: 60000,
            greetingTimeout: 30000,
            socketTimeout: 60000,
        },
    ];

    // Use the first configuration for now
    const transporter = nodemailer.createTransport(configs[0]);

    console.log('Mailer: Using SMTP configuration:', {
        host: configs[0].host,
        port: configs[0].port,
        secure: configs[0].secure,
        user: user
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


