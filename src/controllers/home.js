function home (req, res) {
  const welcomeMessage = "Bem vindo(a) ao Essay Vision! Seu corretor de redação manuscrita.";
  const errorMessage = "Erro ao fazer a requisição:"

  try {
    res.status(200).send(welcomeMessage);
  }
  catch(error) {
    console.error(errorMessage, error);
  }
}

module.exports = home;