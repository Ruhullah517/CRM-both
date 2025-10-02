const nodemailer = require('nodemailer');

// Single reusable transporter. Reads credentials from environment variables.
// Expected envs:
// SMTP_HOST, SMTP_PORT, SMTP_SECURE ("true"/"false"), SMTP_USER, SMTP_PASS, SMTP_FROM

let cachedTransporter = null;

function createTransporter() {
    const user = 'blackfostercarersalliance@gmail.com';
    const pass = 'fhxp oqqm zksb dngn'; // Gmail App Password

    // Try multiple configurations for better compatibility
    const configs = [
        // Configuration 1: SSL on port 465 (most common)
        {
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: { user, pass },
            connectionTimeout: 30000,
            greetingTimeout: 15000,
            socketTimeout: 30000,
        },
        // Configuration 2: TLS on port 587 (alternative)
        {
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: { user, pass },
            tls: { rejectUnauthorized: false },
            connectionTimeout: 30000,
            greetingTimeout: 15000,
            socketTimeout: 30000,
        },
        // Configuration 3: Gmail with different TLS settings
        {
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: { user, pass },
            tls: { minVersion: 'TLSv1.2' },
            connectionTimeout: 30000,
            greetingTimeout: 15000,
            socketTimeout: 30000,
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
    const fromAddress = options.from || getFromAddress();

    console.log('Mailer: Sending email with options:', {
        from: fromAddress,
        to: options.to,
        subject: options.subject,
        hasHtml: !!options.html
    });

    const user = 'ruhullah517@gmail.com';
    const pass = 'syya ehhp eioy gpwf';
    
    // Try different configurations if one fails
    const configs = [
        {
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: { user, pass },
            connectionTimeout: 30000,
            greetingTimeout: 15000,
            socketTimeout: 30000,
        },
        {
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: { user, pass },
            tls: { rejectUnauthorized: false },
            connectionTimeout: 30000,
            greetingTimeout: 15000,
            socketTimeout: 30000,
        }
    ];

    let lastError = null;
    
    for (let i = 0; i < configs.length; i++) {
        try {
            console.log(`Mailer: Trying configuration ${i + 1}/${configs.length}...`);
            const transporter = nodemailer.createTransport(configs[i]);
            
            const result = await transporter.sendMail({ ...options, from: fromAddress });
            console.log('Mailer: Email sent successfully with config', i + 1, ':', result.messageId);
            return result;
            
        } catch (error) {
            console.error(`Mailer: Configuration ${i + 1} failed:`, error.message);
            lastError = error;
            
            // If it's not a timeout error, don't try other configs
            if (error.code !== 'ETIMEDOUT' && error.code !== 'ECONNREFUSED') {
                break;
            }
        }
    }
    
    console.error('Mailer: All configurations failed');
    throw lastError;
}

module.exports = {
    getTransporter,
    sendMail,
    getFromAddress,
};


