const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./database.js");

const JWT_SECRET = process.env.JWT_SECRET || "SEU_SEGREDO_SUPER_SECRETO_AQUI";

router.post("/login", async (req, res) => {
  const { cpf, registro, senha } = req.body;
  if (!cpf || !registro || !senha) {
    return res.status(400).json({ mensagem: "Preencha todos os campos." });
  }

  try {
    const sql =
      "SELECT * FROM funcionarios WHERE cpf = ? AND numero_registro = ?";
    const [rows] = await db.execute(sql, [cpf, registro]);

    if (rows.length === 0) {
      return res.status(401).json({ mensagem: "Credenciais inválidas." });
    }

    const funcionario = rows[0];
    const senhaCorreta = await bcrypt.compare(senha, funcionario.senha);

    if (senhaCorreta) {
      const usuarioParaToken = {
        id: funcionario.id_funcionario,
        nome: funcionario.primeiro_nome,
        sobrenome: funcionario.sobrenome,
        sexo: funcionario.sexo,
      };

      const token = jwt.sign(usuarioParaToken, JWT_SECRET, {
        expiresIn: "24h",
      });

      const umDia = 24 * 60 * 60 * 1000;
      const dataExpiracao = new Date(Date.now() + umDia);

      res.cookie("authToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        expires: dataExpiracao,
        sameSite: "lax",
      });

      res.status(200).json(usuarioParaToken);
    } else {
      return res.status(401).json({ mensagem: "Credenciais inválidas." });
    }
  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ mensagem: "Erro interno no servidor." });
  }
});

router.post("/logout", (req, res) => {
  try {
    res.clearCookie("authToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
    res.status(200).json({ mensagem: "Logout bem-sucedido." });
  } catch (error) {
    console.error("Erro no logout:", error);
    res.status(500).json({ mensagem: "Erro interno no servidor." });
  }
});

module.exports = router;
