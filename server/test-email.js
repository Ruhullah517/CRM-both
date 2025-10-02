const { sendMail, getFromAddress } = require('./utils/mailer');

async function testEmail() {
  console.log('Testing email configuration...');
  
  const testEmail = {
    from: getFromAddress(),
    to: 'test@example.com', // Replace with your actual email
    subject: 'Test Email from CRM',
    html: '<h1>Test Email</h1><p>This is a test email from the CRM system.</p>'
  };
  
  try {
    console.log('Sending test email...');
    const result = await sendMail(testEmail);
    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', result.messageId);
    console.log('Response:', result.response);
  } catch (error) {
    console.error('❌ Test email failed:');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    console.error('Command:', error.command);
  }
}

// Run the test
testEmail().then(() => {
  console.log('Test completed');
  process.exit(0);
}).catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});
