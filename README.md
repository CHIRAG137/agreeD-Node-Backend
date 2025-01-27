# Backend Setup for agreeD

## Overview
**agreeD** is an innovative platform designed to redefine contract management through a hybrid approach. While many solutions focus on fully autonomous systems, agreeD emphasizes collaboration between cutting-edge AI and human decision-making. By blending automation with real-time assistance and user-focused design, agreeD empowers users to streamline contract workflows without compromising the nuanced judgment needed in legal agreements.

This guide will help you set up the backend for agreeD, built on Node.js with a `server.js` entry point. As the application is not hosted, you will need to configure environment variables and manually obtain API keys for integrations.

---

## Prerequisites

1. **Node.js**: Ensure that Node.js is installed on your machine. [Download Node.js](https://nodejs.org/)
2. **npm or yarn**: Comes with Node.js; check by running `npm -v` or `yarn -v`.
3. **MongoDB**: A MongoDB cluster is required. Set up a cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) or host MongoDB locally.

---

## Environment Variables
Create a `.env` file in the root directory of the project and add the following variables:

```env
JWT_SECRET=your_jwt_secret
PORT=3000
MONGO_URI=your_mongo_connection_string
SESSION_SECRET=your_session_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000
GOOGLE_REFRESH_TOKEN=your_google_refresh_token

# DocuSign
DOCUSIGN_CLIENT_ID=your_docusign_client_id
DOCUSIGN_IMPERSONATED_USER_GUID=your_docusign_user_guid
DOCUSIGN_PRIVATE_KEY_PATH=path_to_your_private_key
DOCUSIGN_ACCOUNT_ID=your_docusign_account_id
DOCUSIGN_BASE_PATH=https://demo.docusign.net/restapi
DOCUSIGN_AUTH_SERVER=account-d.docusign.com

# Gemini and Heygen APIs
GEMINI_API_KEY=your_gemini_api_key
HEYGEN_API_KEY=your_heygen_api_key

# Twilio
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
TWILIO_SERVICE_SID=your_twilio_service_sid

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Google Credentials
GOOGLE_CREDENTIALS={"type":"service_account","project_id":"your_project_id","private_key_id":"your_private_key_id","private_key":"your_private_key","client_email":"your_client_email","client_id":"your_client_id","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"your_client_x509_cert_url"}
```

Replace the placeholder values with your actual API keys and secrets. Keep this file secure and never expose it in public repositories.

---

## Obtaining API Keys

### Google OAuth
1. Visit the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project and enable the **Google+ API** and **OAuth 2.0**.
3. Create credentials for a web application.
4. Add `http://localhost:3000` as the redirect URI.
5. Copy the `Client ID` and `Client Secret`.

### DocuSign
1. Sign up for a [DocuSign Developer Account](https://developers.docusign.com/).
2. Create an integration key under **Apps and Keys**.
3. Add a redirect URI and download the private key.

### Twilio
1. Sign up for a [Twilio Account](https://www.twilio.com/).
2. Navigate to the **Console Dashboard** to obtain your `Account SID`, `Auth Token`, and phone number.
3. Since we are using a testing account for Twilio, you can test the account using the phone number `+918168824369`.

### Stripe
1. Create a [Stripe Account](https://stripe.com/).
2. Get the `Secret Key` and `Webhook Secret` from the Developers section.

### Gemini API
1. Follow the steps to obtain your Gemini API Key on their developer portal.

### Heygen API
1. Sign up on [Heygen](https://www.heygen.com/) to retrieve your API key.

---

## Running the Application

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm start
   ```
3. Access the application at [http://localhost:3000](http://localhost:3000).

---

## Notes

- Always keep your `.env` file private and do not commit it to version control.
- If you encounter issues, ensure all required services are correctly configured.
- Use tools like [Postman](https://www.postman.com/) to test your APIs.

---

## License
This project is licensed under the [MIT License](LICENSE).

---

Feel free to reach out for further assistance or issues!
