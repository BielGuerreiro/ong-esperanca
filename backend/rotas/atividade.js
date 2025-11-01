const express = require("express");
const connection = require("../database.js");

const router = express.Router();

// Cadastrar nova atividade
router.post("/atividades", async (req, res) => {
  const {
    nome,
    categoria,
    local,
    data,
    horario,
    duracao,
    responsavel,
  } = req.body;

  const conn = await connection.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.query(
      `
      INSERT INTO atividades 
        (nome, categoria_atividade, local_atividade, data_atividade, horario, duracao, responsavel_atividade)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [nome, categoria, local, data, horario, duracao, responsavel]
    );

    const atividadeId = result.insertId;

    await conn.commit();

    res.json({
      message: "✅ Atividade cadastrada com sucesso!",
      atividadeId,
    });
  } catch (err) {
    await conn.rollback();
    console.error("❌ Erro ao cadastrar atividade:", err);
    res.status(500).json({ error: "Erro ao cadastrar atividade." });
  } finally {
    conn.release();
  }
});

module.exports = router;
