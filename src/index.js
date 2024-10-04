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

// Directory, storage and upload
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

// Open AI key
const openAIapiKey = process.env.OPEN_AI_KEY;

// Routes
app.get("/", (req, res) => {
  try {
    res.status(200).send("Bem vindo(a) ao Essay Vision! Seu corretor de redação manuscrita.");
  }
  catch(error) {
    console.error("Erro ao fazer a requisição:", error);
  }
})

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

app.post('/text-format', async (req, res) => {
  const { text } = req.body;
  const prompt = `
        Corrija a ortografia e formate o seguinte texto, garantindo que:
        1. Se hover títulos, que fiquei separados
        2. Se houver parágrafos, que fiquem separados
        3. O texto fique visualmente agradável
        4. Insira quebra de linhas nos pontos em que achar necessário.
        5. Na resposta não haja nada além do texto corrigido
        Texto: ${text}
    `;

  try {
    const response = await axios.post("https://api.openai.com/v1/chat/completions", {
        model: "gpt-3.5-turbo",
        messages: [
            { role: "system", content: "Você é um assistente que corrige ortografia e formatação de textos." },
            { role: "user", content: prompt }
        ],
        max_tokens: null,
        temperature: 0.7
    }, {
        headers: {
            "Authorization": `Bearer ${openAIapiKey}`,
            "Content-Type": "application/json"
        }
    });

    res.status(200).send(JSON.stringify(response.data.choices[0].message.content));
  } 
  catch (error) {
    console.error("Erro ao fazer a requisição:", error.response ? error.response.data : error.message);
  }
});

app.post("/text-correction", async (req, res) => {
  const { theme, text } = req.body;
  
  const prompt = `
        Tema: ${theme}
        Texto: ${text}
        
        O ${theme} tem a ver com o ${text}? O ${theme} foi bem explorado?
        
        Com base nas 5 competências geralmente avaliadas ao corrigir uma redação, corrija ${text}.

        Aborde cada competência dentro dos parágrafos, insira margens de espaçamento entre eles.

        Em "nota sugerida", insira a nota que você daria à redação, considerando valores entre 0 e 1000.

        Em "sugestão de melhorias", insira as tuas sugestões para aprimorar ${text}.

        O html deve seguir mais ou menos este modelo:

        "<div>
          <h2>Competência 1: Domínio da norma culta da língua escrita</h2>
          <p> ... </p>

          <hr>

          <h2>Competência 2: Compreensão da proposta e desenvolvimento do tema</h2>
          <p> ... </p>

          <hr>

          <h2>Competência 3: Organização das ideias e coesão</h2>
          <p> ... </p>

          <hr>

          <h2>Competência 4: Argumentação e conhecimento dos mecanismos linguísticos</h2>
          <p> ... </p>

          <hr>

          <h2>Competência 5: Proposta de intervenção para o problema apresentado</h2>
          <p> ... </p>

          <hr>

          <h2>Sugestões de melhorias</h2>
          <p> ... </p>

          <hr>

          <div style="margin-top: 20px; color: red;">Nota sugerida: ...</div>
        </div>"
    `;

  try {
    const response = await axios.post("https://api.openai.com/v1/chat/completions", {
        model: "gpt-3.5-turbo",
        messages: [
            { role: "system", content: "Você é um especialista que analisa aspectos de uma redação para corrigí-la." },
            { role: "user", content: prompt }
        ],
        max_tokens: null,
        temperature: 0.7
    }, {
        headers: {
            "Authorization": `Bearer ${openAIapiKey}`,
            "Content-Type": "application/json"
        }
    });

    let correction = response.data.choices[0].message.content;
    
    // remove delimiters
    correction = correction.replace(/```html/g, '').replace(/```/g, '').replace(/\n/g, '');

    res.status(200).send(JSON.stringify(correction));
  } 
  catch (error) {
    console.error("Erro ao fazer a requisição:", error.response ? error.response.data : error.message);
  }
})

// 404 (not found)
app.use((req, res) => {
  res.send("Ops, página não encontrada...");
})

// Server info
const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`server is listening on port ${port} and localhost ${IP.address()}`));