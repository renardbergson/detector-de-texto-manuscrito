const axios = require("axios");

// Open AI key
const openAIapiKey = process.env.OPEN_AI_KEY;

async function textFormat(req, res) {
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
}

module.exports = textFormat;