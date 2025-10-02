const nodemailer = require('nodemailer');

// Single reusable transporter. Reads credentials from environment variables.
// Expected envs:
// SMTP_HOST, SMTP_PORT, SMTP_SECURE ("true"/"false"), SMTP_USER, SMTP_PASS, SMTP_FROM

let cachedTransporter = null;

function createTransporter() {
    const user = 'blackfostercarersalliance@gmail.com';
    const pass = 'vvho ubhi akem wzsq'; // Gmail App Password

    // Try multiple configurations for better compatibility
    const configs = [
        // Configuration 1: TLS on port 587 (most compatible with cloud hosting)
        {
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: { user, pass },
            tls: { rejectUnauthorized: false },
            connectionTimeout: 60000,
            greetingTimeout: 30000,
            socketTimeout: 60000,
        },
        // Configuration 2: SSL on port 465 (fallback)
        {
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: { user, pass },
            connectionTimeout: 60000,
            greetingTimeout: 30000,
            socketTimeout: 60000,
        }
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


