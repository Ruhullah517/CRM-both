const nodemailer = require('nodemailer');

// Single reusable transporter. Reads credentials from environment variables.
// Expected envs:
// SMTP_HOST, SMTP_PORT, SMTP_SECURE ("true"/"false"), SMTP_USER, SMTP_PASS, SMTP_FROM

let cachedTransporter = null;

function createTransporter() {
	const host = process.env.SMTP_HOST || 'smtp.hostinger.com';
	const port = parseInt(process.env.SMTP_PORT || '587', 10);
	const secure = String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true';
	const user = process.env.SMTP_USER || 'hello@blackfostercarersalliance.co.uk';
	const pass = process.env.SMTP_PASS || 'IYght8061';

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


