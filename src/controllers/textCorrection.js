const axios = require("axios");

// Open AI key
const openAIapiKey = process.env.OPEN_AI_KEY;

async function textCorrection(req, res) {
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
}

module.exports = textCorrection;