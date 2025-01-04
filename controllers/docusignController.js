const docusign = require("docusign-esign");
const fs = require('fs');
const { EnvelopesApi, EnvelopeDefinition, Signer, RecipientViewRequest } =
  docusign;

const apiClient = new docusign.ApiClient();
const accessToken = process.env.DOCUSIGN_ACCESS_TOKEN;
const accountId = process.env.DOCUSIGN_ACCOUNT_ID; 
const basePath = "https://demo.docusign.net/restapi";

apiClient.setBasePath(basePath);
apiClient.addDefaultHeader("Authorization", `Bearer ${accessToken}`);

// Create an envelope and send for signing
async function createAndSendEnvelope(req, res) {
  try {
    // Create a signer
    const signer = new Signer();
    signer.email = req.body.signerEmail;
    signer.name = req.body.signerName;
    signer.recipientId = "1";
    signer.routingOrder = "1";

    // Create the envelope definition
    const envelopeDefinition = new EnvelopeDefinition();
    envelopeDefinition.emailSubject = "Please Sign this Document";
    envelopeDefinition.status = "sent"; 

    // Read the document from the file system
    const filePath = req.body.filePath; 
    const documentBuffer = fs.readFileSync(filePath);

    // Convert document to base64
    const documentBase64 = documentBuffer.toString("base64");

    const doc = {
      documentBase64: documentBase64,
      name: "Sample Document", 
      fileExtension: "pdf", 
      documentId: "1", 
    };

    envelopeDefinition.documents = [doc];
    envelopeDefinition.recipients = { signers: [signer] };

    // Create the envelope and send it for signing
    const envelopesApi = new EnvelopesApi(apiClient);
    const results = await envelopesApi.createEnvelope(accountId, {
      envelopeDefinition,
    });

    res.status(200).json({
      message: "Envelope sent for signing",
      envelopeId: results.envelopeId,
    });
  } catch (error) {
    console.error("Error sending envelope for signing:", error);
    res.status(500).json({ error: "Error sending envelope for signing" });
  }
}

// Create a recipient view (to allow signer to view and sign)
async function createRecipientView(req, res) {
  try {
    const envelopeId = req.params.envelopeId;
    const recipientViewRequest = new RecipientViewRequest();
    recipientViewRequest.returnUrl = "http://www.docusign.com/developer-center"; 
    recipientViewRequest.authenticationMethod = "none";
    recipientViewRequest.userName = req.body.signerName;
    recipientViewRequest.email = req.body.signerEmail;

    const envelopesApi = new EnvelopesApi(apiClient);
    const viewUrl = await envelopesApi.createRecipientView(
      accountId,
      envelopeId,
      { recipientViewRequest }
    );

    res.status(200).json({
      viewUrl: viewUrl.url,
    });
  } catch (error) {
    console.error("Error creating recipient view:", error);
    res.status(500).json({ error: "Error creating recipient view" });
  }
}

module.exports = {
  createAndSendEnvelope,
  createRecipientView,
};
