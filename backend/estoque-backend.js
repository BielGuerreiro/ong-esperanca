const express = require("express");
const db = require("./database.js");
const router = express.Router();

router.get("/estoque", async (req, res) => {
  let conn;
  try {
    conn = await db.getConnection();
    const [rows] = await conn.query(
      "SELECT id_estoque, nome, quantidade FROM estoque ORDER BY nome ASC"
    );
    res.json(rows);
  } catch (err) {
    console.error("Erro ao listar estoque:", err);
    res.status(500).json({ error: "Erro ao listar estoque." });
  } finally {
    if (conn) conn.release();
  }
});

router.post("/estoque", async (req, res) => {
  const { nome, quantidade } = req.body;
  let conn;

  if (!nome || !quantidade || isNaN(quantidade) || quantidade <= 0) {
    return res.status(400).json({ error: "Dados inválidos." });
  }

  try {
    conn = await db.getConnection();

    const sql = `
      INSERT INTO estoque (nome, quantidade)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE
        quantidade = quantidade + VALUES(quantidade)
    `;

    await conn.query(sql, [nome, quantidade]);

    res.status(200).json({ message: "Estoque atualizado com sucesso!" });
  } catch (err) {
    console.error("Erro ao atualizar estoque:", err);
    res.status(500).json({ error: "Erro ao atualizar estoque." });
  } finally {
    if (conn) conn.release();
  }
});

module.exports = router;
