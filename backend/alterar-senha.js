// ------------------------------------
// ARQUIVO COMPLETO: backend/alterar-senha.js
// ------------------------------------
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const db = require("./database.js"); // Ajuste o caminho se necessário

/**
 * ROTA 1: Verificar Identidade
 * Verifica se os 4 campos (CPF, Registro, Email, Data de Nascimento)
 * correspondem a um usuário.
 */
router.post("/verificar-identidade", async (req, res) => {
  const { cpf, registro, email, dataNascimento } = req.body; // MODIFICADO

  if (!cpf || !registro || !email || !dataNascimento) {
    // MODIFICADO
    return res
      .status(400)
      .json({ mensagem: "Todos os campos são obrigatórios." });
  }

  try {
    // 1. Encontra o usuário pelos 4 dados
    const sqlFind =
      "SELECT * FROM funcionarios WHERE cpf = ? AND numero_registro = ? AND email = ? AND data_nascimento = ?"; // MODIFICADO

    // O formato da data do HTML (YYYY-MM-DD) deve ser o mesmo do banco
    const [rows] = await db.execute(sqlFind, [
      cpf,
      registro,
      email,
      dataNascimento,
    ]); // MODIFICADO

    if (rows.length > 0) {
      // 2. Sucesso! Encontrou o usuário com os 4 dados
      const funcionario = rows[0];
      res.status(200).json({
        id: funcionario.id_funcionario,
        mensagem: "Verificação bem-sucedida.",
      });
    } else {
      // 3. Se não encontrou, os dados não batem
      return res.status(404).json({ mensagem: "Dados não conferem." });
    }
  } catch (error) {
    console.error("Erro ao verificar identidade:", error);
    res.status(500).json({ mensagem: "Erro interno no servidor." });
  }
});

/**
 * ROTA 2: Atualizar Senha
 * (Esta rota não muda em nada)
 */
router.post("/atualizar-senha", async (req, res) => {
  const { id, novaSenha } = req.body;

  if (!id || !novaSenha) {
    return res.status(400).json({ mensagem: "ID ou nova senha ausente." });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(novaSenha, salt);

    const sqlUpdate =
      "UPDATE funcionarios SET senha = ? WHERE id_funcionario = ?";
    const [result] = await db.execute(sqlUpdate, [senhaHash, id]);

    if (result.affectedRows > 0) {
      res.status(200).json({ mensagem: "Senha alterada com sucesso!" });
    } else {
      return res
        .status(404)
        .json({ mensagem: "Usuário não encontrado para atualização." });
    }
  } catch (error) {
    console.error("Erro ao atualizar senha:", error);
    res.status(500).json({ mensagem: "Erro interno no servidor." });
  }
});

module.exports = router;
