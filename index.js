// Main server elements
const express = require("express");
const cors = require("cors");
const app = express();
const IP = require("ip");
const fs = require('fs-extra');
const multer = require("multer");

// Cors
app.use(cors()); 

// Environment variables
require("dotenv").config();

// Google cloud vision - Auth with api key - Apy key reference
const vision = require("@google-cloud/vision").v1p3beta1;
const {GoogleAuth, grpc} = require("google-gax");
const apiKey = process.env.GOOGLE_API_KEY;

// Credentials
function getApiKeyCredentials() {
  const sslCreds = grpc.credentials.createSsl();
  const googleAuth = new GoogleAuth();
  const authClient = googleAuth.fromAPIKey(apiKey);
  const credentials = grpc.credentials.combineChannelCredentials(
    sslCreds,
    grpc.credentials.createFromGoogleCredential(authClient)
  );
  return credentials;
}

// Storage
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "./uploads");
  },
  filename: (req, file, callback) => {
    callback(null, `${Date.now()}-${file.originalname}`);
  }
})

const upload = multer({storage});

// Routes
app.post("/file-upload", upload.single("file"), async (req, res) => {
  try {
    const sslCreds = getApiKeyCredentials();
    const client = new vision.ImageAnnotatorClient({sslCreds});

    const file = `./uploads/${req.file.filename}`;
    const request = {
      image: {
        content: fs.readFileSync(file),
      }
    }

    const [result] = await client.documentTextDetection(request);
    const fullTextAnnotation = result.fullTextAnnotation;

    await fs.remove(`./uploads/${req.file.filename}`);

    return res.send(fullTextAnnotation);
  } 
  catch(error) {
    res.status(500).json({error: error});
  }
})

// 404 (not found)
app.use((req, res) => {
  res.send("Ops, página não encontrada...");
})

// Server info
const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`server is listening on port ${port} and localhost ${IP.address()}`));