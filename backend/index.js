require("./alerta/agendamento.js");

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const db = require("./database.js");
const cookieParser = require("cookie-parser");

dotenv.config();
const app = express();

app.use(
  cors({
    origin: "http://127.0.0.1:5502",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const medicamentoRoutes = require("./rotas/medicamento");
const residenteRouter = require("./rotas/residente");
const atividadesRouter = require("./rotas/atividade");
const funcionariosRouter = require("./rotas/funcionarios");
const estoqueRouter = require("./estoque-backend");
const relatorioRouter = require("./rotas/relatorio");
const loginRouter = require("./logar.js");
const authMiddleware = require("./auth-middleware.js");
const alterarSenhaRouter = require("./alterar-senha.js");

app.use("/api", residenteRouter);
app.use("/api", medicamentoRoutes);
app.use("/api", atividadesRouter);
app.use("/api", funcionariosRouter);
app.use("/api", estoqueRouter);
app.use("/api", relatorioRouter);
app.use("/api", loginRouter);
app.use("/api", alterarSenhaRouter);

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
