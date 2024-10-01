// Main server elements
const express = require("express");
const cors = require("cors");
const app = express();
const IP = require("ip");
const fs = require('fs-extra');
const multer = require("multer");
const axios = require("axios");

// Cors
app.use(cors()); 

// Json
app.use(express.json());

// Environment variables
require("dotenv").config();

// Google cloud vision - Auth with api key - Apy key reference
const vision = require("@google-cloud/vision").v1p3beta1;
const {GoogleAuth, grpc} = require("google-gax");
const googleApiKey = process.env.GOOGLE_API_KEY;

// Credentials
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

// Directory and Storage
const directory = "./uploads";
!fs.existsSync(directory) ? fs.mkdirSync(directory) : null;

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, directory);
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

    const file = `${directory}/${req.file.filename}`;
    const request = {
      image: {
        content: await fs.readFile(file),
      }
    }

    const [result] = await client.documentTextDetection(request);
    const fullTextAnnotation = result.fullTextAnnotation;

    await fs.remove(`${directory}/${req.file.filename}`);

    return res.status(200).send(fullTextAnnotation);
  } 
  catch(error) {
    res.status(500).json({error: error});
  }
})

//const openAIapiKey = process.env.OPEN_AI_KEY;
app.post('/text-correction', async (req, res) => {
  const { text } = req.body;

  // Faz a requisição para a API do LanguageTool
  try {
      const response = await fetch('https://api.languagetool.org/v2/check', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
              text: text,
              language: 'pt-BR'
              // O new URLSearchParams, converte um objeto ou um conjunto de pares chave-valor em uma string no formato key1=value1&key2=value2. Este formato é o que a maioria das APIs espera quando se usa Content-Type: application/x-www-form-urlencoded. (Como se os dados estivessem vindo de um formulário)
          })
      });

      const data = await response.json();
      let correctedText = text; // Inicia com o texto original, obtido na requisição

      data.matches.reverse().forEach(error => {
        // "matches" são possíveis erros encontrados
        // Chamamos de "error", cada possível erro encontrado e, cada "error" possui uma propriedade chamada "replacements", que é um array de objetos, contendo sugestões de correção 
        // Cada objeto desse array possui a propriedade que interessa: "value"
        // com "error.replacements[0]", usaremos apenas a primeira correção sugerida
        // "data.matches.reverse()" faz as substituições acontecerem do final para o início do texto. Isso evita problemas de deslocamento de índices ao modificar o texto, já que cada substituição pode alterar o comprimento do texto
        const start = error.offset;
        const end = error.offset + error.length;
        const correction = error.replacements[0] ? error.replacements[0].value : null;
        // "error" possui as propriedades "offset" (início do erro) e "length" (comprimento do erro)

        if (correction) {
          correctedText = correctedText.slice(0, start) + correction + correctedText.slice(end);
          // "correctedText.slice(0, start)" é o recorte de todos os caracteres do texto original, desde o início (índice 0) até o início do erro
          // "correction" contém a correção escolhida anteriormente
          // "error.offset + error.length" é o recorte do restante de tudo, começando pelo final do erro 
          // "correctedText" agora é a junção desses 3 recortes
        }
      })

      res.status(200).json(correctedText);
  } catch (error) {
      console.error('Erro ao acessar a API do LanguageTool:', error);
      res.status(500).send('Erro ao acessar a API de correção.');
  }
});

// 404 (not found)
app.use((req, res) => {
  res.send("Ops, página não encontrada...");
})

// Server info
const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`server is listening on port ${port} and localhost ${IP.address()}`));