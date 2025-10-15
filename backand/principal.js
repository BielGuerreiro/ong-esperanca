const express = require("express");
const { conectarBancoDeDados } = require("./bd.js");

const app = express();
const PORTA = 3000;

app.get("/", (req, res) => {
  res.json({
    mensagem: "Backend da ONG Esperança está no ar! Conexão bem-sucedida.",
  });
});

app.listen(PORTA, () => {
  console.log(`🚀 Servidor rodando na porta http://localhost:${PORTA}`);

  conectarBancoDeDados();
});
