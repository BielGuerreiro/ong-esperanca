const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const db = require("./database.js");

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

const medicamentoRoutes = require("./rotas/medicamento");
const residenteRouter = require("./rotas/residente");
const atividadesRouter = require("./rotas/atividade");
const funcionariosRouter = require("./rotas/funcionarios");
const estoqueRouter = require("./estoque-backend");

app.use("/api", residenteRouter);
app.use("/api", medicamentoRoutes);
app.use("/api", atividadesRouter);
app.use("/api", funcionariosRouter);
app.use("/api", estoqueRouter);

app.get("/", (req, res) => {
  res.json({
    message: "✅ API do Sistema de Gestão - Funcionando!",
    version: "1.0.0",
    database_status: db
      ? "Conexão Pool Carregada"
      : "ERRO: Pool não carregado, verifique o database.js",
  });
});

app.use((req, res) => {
  res.status(404).json({
    error:
      "Rota não encontrada. Você precisa criar e registrar a rota aqui no index.js.",
    path: req.path,
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 Acesse: http://localhost:${PORT}`);
});

module.exports = app;
