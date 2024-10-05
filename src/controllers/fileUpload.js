const fs = require('fs-extra');
const vision = require("@google-cloud/vision").v1p3beta1;
const {GoogleAuth, grpc} = require("google-gax");
const storage = require("./storage");

// Google apy key
const googleApiKey = process.env.GOOGLE_API_KEY;

// Authentication with google api
function getApiKeyCredentials() {
  const sslCreds = grpc.credentials.createSsl();
  const googleAuth = new GoogleAuth();
  const authClient = googleAuth.fromAPIKey(googleApiKey);
  const credentials = grpc.credentials.combineChannelCredentials(
    sslCreds,
    grpc.credentials.createFromGoogleCredential(authClient)
  );
  return credentials;
}

// Upload function (main function)
async function fileUpload(req, res) {
  try {
    const sslCreds = getApiKeyCredentials();
    const client = new vision.ImageAnnotatorClient({sslCreds});

    const directory = storage.directory;
    const file = `${directory}/${req.file.filename}`;
    const request = {
      image: {
        content: await fs.readFile(file),
      }
    };

    // Image processing and text detection
    const [result] = await client.documentTextDetection(request);
    const fullTextAnnotation = result.fullTextAnnotation;

    // Remove file after processing
    await fs.remove(`${directory}/${req.file.filename}`);

    return res.status(200).send(fullTextAnnotation);
  } 
  catch(error) {
    res.status(500).json({error: error});
  }
};

module.exports = fileUpload;