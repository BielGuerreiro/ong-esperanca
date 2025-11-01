// rotas/residentes.js
const express = require("express");
const connection = require("../database.js");

const router = express.Router();

// Listar todos os residentes
router.get("/residentes", async (req, res) => {
  const conn = await connection.getConnection();
  try {
    const [rows] = await conn.query(`
      SELECT id_residente AS id_residente, primeiro_nome, sobrenome
      FROM residentes
      ORDER BY primeiro_nome ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error("Erro ao listar residentes:", err);
    res.status(500).json({ error: "Erro ao listar residentes." });
  } finally {
    conn.release();
  }
});

module.exports = router;
