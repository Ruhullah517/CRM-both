const nodemailer = require('nodemailer');

// Single reusable transporter. Reads credentials from environment variables.
// Expected envs:
// SMTP_HOST, SMTP_PORT, SMTP_SECURE ("true"/"false"), SMTP_USER, SMTP_PASS, SMTP_FROM

let cachedTransporter = null;

function createTransporter() {
	const host = 'smtp.hostinger.com';
	const port = '587';
	const secure = 'false';
	const user = 'hello@blackfostercarersalliance.co.uk';
	const pass = 'IYght8061';

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


