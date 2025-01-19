const docusign = require('docusign-esign');
const fs = require('fs');
require('dotenv').config();

class DocuSignAuth {
  constructor() {
    this.apiClient = new docusign.ApiClient();
    this.accessToken = null;
    this.tokenExpirationTime = null;
    this.refreshThreshold = 30 * 60 * 1000; // 30 minutes before expiration
    
    // DocuSign configuration
    this.clientId = process.env.DOCUSIGN_CLIENT_ID;
    this.impersonatedUserGuid = process.env.DOCUSIGN_IMPERSONATED_USER_GUID;
    this.privateKeyPath = process.env.DOCUSIGN_PRIVATE_KEY_PATH;
    this.authServer = process.env.DOCUSIGN_AUTH_SERVER || 'account-d.docusign.com';

    // Set the base path for authentication
    this.apiClient.setOAuthBasePath(this.authServer);
  }

  async refreshAccessToken() {
    try {
      const privateKey = fs.readFileSync(this.privateKeyPath);
      
      const scopes = [
        'signature',
        'impersonation'
      ];

      const jwtLifeSec = 10 * 60; // 10 minutes

      // Request the JWT user token
      const results = await this.apiClient.requestJWTUserToken(
        this.clientId,
        this.impersonatedUserGuid,
        scopes,
        privateKey,
        jwtLifeSec
      );
      
      this.accessToken = results.body.access_token;
      this.tokenExpirationTime = Date.now() + (results.body.expires_in * 1000);
      
      // Set the base path for API calls
      this.apiClient.setBasePath(process.env.DOCUSIGN_BASE_PATH || 'https://demo.docusign.net/restapi');
      this.apiClient.addDefaultHeader('Authorization', `Bearer ${this.accessToken}`);

      console.log('DocuSign access token refreshed successfully');
      return this.accessToken;
    } catch (error) {
      console.error('Error refreshing DocuSign access token:', error);
      throw error;
    }
  }

  async getAccessToken() {
    if (
      this.accessToken &&
      this.tokenExpirationTime &&
      Date.now() < this.tokenExpirationTime - this.refreshThreshold
    ) {
      return this.accessToken;
    }

    return await this.refreshAccessToken();
  }
}

const docuSignAuth = new DocuSignAuth();
module.exports = docuSignAuth;