const docusign = require("docusign-esign");
const fs = require('fs');
const { EnvelopesApi, EnvelopeDefinition, Signer, RecipientViewRequest } =
  docusign;
require('dotenv').config();

const apiClient = new docusign.ApiClient();
const accessToken = "eyJ0eXAiOiJNVCIsImFsZyI6IlJTMjU2Iiwia2lkIjoiNjgxODVmZjEtNGU1MS00Y2U5LWFmMWMtNjg5ODEyMjAzMzE3In0.AQoAAAABAAUABwCAm-mi8y3dSAgAgAOuBPwt3UgCADbPPWtPZjxJoypVoNHVIgAVAAEAAAAYAAIAAAAFAAAAHQAAAA0AJAAAADc5YmQ1OTU1LTExMmUtNDk0OS1hZDZmLTdiYjc2MGI5Y2I5YiIAJAAAADc5YmQ1OTU1LTExMmUtNDk0OS1hZDZmLTdiYjc2MGI5Y2I5YhIAAQAAAAYAAABqd3RfYnIjACQAAAA3OWJkNTk1NS0xMTJlLTQ5NDktYWQ2Zi03YmI3NjBiOWNiOWI.wlzTGdQj6pPKBOTs_7sSrdbM8iEQO85G6YMCMd_NlV5HvAbzdrur0BL6jBVqTHzdLQ0AfZv00yEV4IRXoMrZkciR7NFBUNp0ui7mfy4wgGfvGGkXWboWvOe3jdZRI19LBn_mLHPrfopQv6P9GEvjzqAV_hlcL6DXKsaRQDlvRwZB2J39JHzzPq-8rW3pwKaGtSU7dZ1p5609mGj6pcTiyDtAATtAqXJjazNuqEGHAthyMejifAoIaGsaRZxqjHBgLibJrU_jDUM3ErgqoNhtnm2orWfiPBGEioQM7iPU5Kq2R4s8yfwRbNqu-fXtHyaNVQxXqBxRitJwUEOWj7-vaQ";
const accountId = "32010460"; 
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

// Controller to handle the creation of a DocuSign template
async function createTemplate(req, res){
  try {
    const { docFile, templateName } = req.body;

    if (!docFile || !templateName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Read the document file
    const docPdfBytes = fs.readFileSync(docFile);

    // Create the document object
    const doc = new docusign.Document();
    const docB64 = Buffer.from(docPdfBytes).toString('base64');
    doc.documentBase64 = docB64;
    doc.name = 'Sample Document';
    doc.fileExtension = 'pdf';
    doc.documentId = '1';

    // Create recipients
    const signer = docusign.Signer.constructFromObject({
      roleName: 'signer',
      recipientId: '1',
      routingOrder: '1',
    });

    const cc = docusign.CarbonCopy.constructFromObject({
      roleName: 'cc',
      routingOrder: '2',
      recipientId: '2',
    });

    // Create tabs
    const signHere = docusign.SignHere.constructFromObject({
      documentId: '1',
      pageNumber: '1',
      xPosition: '100',
      yPosition: '150',
    });

    signer.tabs = docusign.Tabs.constructFromObject({
      signHereTabs: [signHere],
    });

    const recipients = docusign.Recipients.constructFromObject({
      signers: [signer],
      carbonCopies: [cc],
    });

    // Create the template definition
    const envelopeTemplate = docusign.EnvelopeTemplate.constructFromObject({
      documents: [doc],
      emailSubject: 'Please sign this document',
      description: 'Example template created via API',
      name: templateName,
      shared: false,
      recipients: recipients,
      status: 'created',
    });

    // Configure API client and request
    const apiClient = new docusign.ApiClient();
    apiClient.setBasePath(basePath);
    apiClient.addDefaultHeader('Authorization', `Bearer ${accessToken}`);

    const templatesApi = new docusign.TemplatesApi(apiClient);
    const results = await templatesApi.createTemplate(accountId, { envelopeTemplate });

    res.status(201).json({ message: 'Template created successfully', templateId: results.templateId });
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ error: 'Failed to create template', details: error.message });
  }
};

module.exports = {
  createAndSendEnvelope,
  createRecipientView,
  createTemplate
};
