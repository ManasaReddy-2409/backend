// Simple Twilio test script. Usage: node send_sms_test.js +91xxxxxxxxxx
require('dotenv').config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const from = process.env.TWILIO_PHONE_NUMBER;

if (!accountSid || !authToken || !from) {
  console.error('Twilio env vars not set. Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER in .env');
  process.exit(1);
}

const twilio = require('twilio');
const client = twilio(accountSid, authToken);

const to = process.argv[2];
if (!to) {
  console.error('Usage: node send_sms_test.js +91xxxxxxxxxx');
  process.exit(1);
}

(async () => {
  try {
    const resp = await client.messages.create({
      body: 'Test SMS from HelpMeeOut - if you receive this, Twilio works.',
      from,
      to
    });
    console.log('Message sent. SID:', resp.sid);
  } catch (err) {
    console.error('Twilio send failed:', err && err.message ? err.message : err);
    console.error(err);
  }
})();
