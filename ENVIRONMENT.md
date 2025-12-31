# SMS provider setup and environment variables

This file explains the environment variables required to enable real SMS delivery for the backend.

Fast2SMS (recommended for India)
- Sign up at https://www.fast2sms.com/
- In the dashboard create / view your API key (the dashboard UI shows where to create keys)
- Add the key to your backend `.env` as:

  FAST2SMS_API_KEY=your_fast2sms_api_key

Twilio (global)
- Sign up at https://www.twilio.com/
- Note your `Account SID`, `Auth Token` and buy/allocate a phone number
- Add these to `.env`:

  TWILIO_ACCOUNT_SID=your_twilio_account_sid
  TWILIO_AUTH_TOKEN=your_twilio_auth_token
  TWILIO_PHONE_NUMBER=+<countrycode><number>

Important
- Never commit your real `.env` file or API keys to source control.
- Use `.env.example` (included) in repo and keep `.env` local/private.

Quick local test
1. Copy `.env.example` to `.env` and fill values.
2. From `d:\help\backend` restart the server:

```bash
npm run dev
```

3. Run the Twilio test script (if Twilio configured):

```bash
node send_sms_test.js +91XXXXXXXXXX
```

4. Or trigger the OTP flow from the frontend and watch the backend console for `Fast2SMS` or `SMS sent` logs.

If you want, paste your Fast2SMS API key here and I can save it into `.env` for you locally — but I cannot store private keys in the repo. Alternatively, follow the steps above and I can help verify logs/requests.