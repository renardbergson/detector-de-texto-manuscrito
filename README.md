# Essay Vision - Backend/API
Bem-vindo à documentação da API que alimenta o reconhecimento de texto manuscrito!

## 📚 O que é o Essay Vision?

O **Essay Vision** é uma aplicação que combina reconhecimento de caracteres manuscritos e inteligência artificial para análise e correção de redações. Este repositório descreve o backend da aplicação, responsável por gerenciar o fluxo de dados, integrar as APIs externas e fornecer os serviços que compõem a experiência do Essay Vision.

Este projeto foi desenvolvido pelos alunos Renard (RU: 3426934) e Esdras (RU: 4752645) como parte de um projeto de extensão do curso de Análise e Desenvolvimento de Sistemas da UNINTER. O backend utiliza várias APIs, incluindo o Google Vision e o ChatGPT, para oferecer correção de textos manuscritos de forma simples e acessível.

## 🚀 Funcionalidades da API
- **Reconhecimento de Texto Manuscrito**: Envia uma imagem para a API do Google Vision, que retorna o texto manuscrito extraído.
- **Correção Ortográfica**: Integra-se com a API do ChatGPT para fornecer correções ortográficas e sugestões de aprimoramento.
- **Feedback Detalhado**: A API analisa a redação com base nas cinco competências principais utilizadas em contextos educacionais e profissionais.

## 🛠️ Endpoints da API

### 1. **Boas-vindas**
- **Descrição**: Retorna uma mensagem ao usuário, confirmando que o sistema está online
- **Endpoint**: `GET "/"`

### 2. **Reconhecimento de Manuscrito**
- **Descrição**: Converte uma imagem manuscrita em texto digital
- **Endpoint**: `POST "/file-upload"`

### 3. **Correção Ortográfica**
- **Descrição**: Envia o texto para a API do ChatGPT para correção ortográfica e formatação
- **Endpoint**: `POST "/text-format"`

### 4. **Análise de Competências**
- **Descrição**: Fornece uma análise detalhada do texto com base nas competências esperadas
- **Endpoint**: `POST "/text-correction"`

## 📦 Principais Tecnologias Utilizadas
- **Node.js/Express**: Framework backend para construção da API RESTful
- **Google Vision API**: Para reconhecimento de caracteres manuscritos
- **ChatGPT API**: Para correção ortográfica e análise de redação

## ⚙️ Como Executar o Backend Localmente

1. Clone o repositório:
  git clone https://github.com/seu-usuario/essay-vision-backend.git

2. Instale as dependências:
  npm install

3. Configure as variáveis de ambiente:
  GOOGLE_API_KEY=seu_google_vision_api_key
  OPEN_AI_KEY=sua_openai_api_key

4. Inicie o servidor:
  npm start

## 🌐 Live Link
O backend está disponível para testes através deste link: [Live API](https://essay-vision-server.onrender.com/)

## 📞 Contato

Se você tiver perguntas, sugestões ou precisar de ajuda, entre em contato conosco:

- **Renard**  
  Email: [renard.contato@gmail.com](mailto:renard.contato@gmail.com)  
  LinkedIn: [Renard LinkedIn](https://linkedin.com/in/renardbergson)

- **Esdras**  
  Email: [esdras.medeiros43@gmail.com](mailto:esdras.medeiros43@gmail.com)  

## 📄 Licença

Esse projeto está sob a licença [MIT](https://opensource.org/licenses/MIT)