const express = require("express");
const connection = require("../database.js");
const router = express.Router();

// ==============================
// 1️⃣ LISTAR TODAS AS ATIVIDADES
// ==============================
router.get("/atividades", async (req, res) => {
  const conn = await connection.getConnection();
  try {
    const [rows] = await conn.query(`
      SELECT a.id_atividade AS id,
             a.nome AS nome_atividade,
             a.categoria_atividade AS categoria,
             a.local_atividade AS local,
             a.data_atividade AS data,
             a.horario,
             a.duracao,
             a.responsavel_atividade AS responsavel,
             GROUP_CONCAT(f.residente_id_residente) AS participantes_ids
      FROM atividades a
      LEFT JOIN faz f ON f.atividade_id_atividade = a.id_atividade
      GROUP BY a.id_atividade
      ORDER BY a.data_atividade ASC, a.horario ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error("Erro ao listar atividades:", err);
    res.status(500).json({ error: "Erro ao listar atividades." });
  } finally {
    conn.release();
  }
});

// ==============================
// 2️⃣ BUSCAR ATIVIDADE POR ID
// ==============================
router.get("/atividades/:id", async (req, res) => {
  const { id } = req.params;
  const conn = await connection.getConnection();
  try {
    const [rows] = await conn.query(`
      SELECT a.id_atividade AS id,
             a.nome AS nome_atividade,
             a.categoria_atividade AS categoria,
             a.local_atividade AS local,
             a.data_atividade AS data,
             a.horario,
             a.duracao,
             a.responsavel_atividade AS responsavel,
             GROUP_CONCAT(f.residente_id_residente) AS participantes_ids
      FROM atividades a
      LEFT JOIN faz f ON f.atividade_id_atividade = a.id_atividade
      WHERE a.id_atividade = ?
      GROUP BY a.id_atividade
    `, [id]);

    if (rows.length === 0) return res.status(404).json({ error: "Atividade não encontrada" });
    res.json(rows[0]);
  } catch (err) {
    console.error("Erro ao buscar atividade:", err);
    res.status(500).json({ error: "Erro ao buscar atividade." });
  } finally {
    conn.release();
  }
});

// ==============================
// 3️⃣ CADASTRAR NOVA ATIVIDADE
// ==============================
router.post("/atividades", async (req, res) => {
  const { nome, categoria, local, data, horario, duracao, responsavel, participantes_ids } = req.body;
  const conn = await connection.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.query(`
      INSERT INTO atividades 
        (nome, categoria_atividade, local_atividade, data_atividade, horario, duracao, responsavel_atividade)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [nome, categoria, local, data, horario, duracao, responsavel]);

    const atividadeId = result.insertId;

    if (participantes_ids) {
      const participantes = participantes_ids.split(",");
      for (const residenteId of participantes) {
        await conn.query(`
          INSERT INTO faz (residente_id_residente, atividade_id_atividade, data_registro)
          VALUES (?, ?, CURDATE())
        `, [residenteId, atividadeId]);
      }
    }

    await conn.commit();
    res.json({ message: "Atividade cadastrada com sucesso!", atividadeId });
  } catch (err) {
    await conn.rollback();
    console.error("Erro ao cadastrar atividade:", err);
    res.status(500).json({ error: "Erro ao cadastrar atividade." });
  } finally {
    conn.release();
  }
});

// ==============================
// 4️⃣ ATUALIZAR ATIVIDADE
// ==============================
router.put("/atividades/:id", async (req, res) => {
  const { id } = req.params;
  const { nome, categoria, local, data, horario, duracao, responsavel, participantes_ids } = req.body;
  const conn = await connection.getConnection();
  try {
    await conn.beginTransaction();

    // Atualiza todos os campos da atividade
    await conn.query(`
      UPDATE atividades
      SET nome = ?, 
          categoria_atividade = ?, 
          local_atividade = ?, 
          data_atividade = ?, 
          horario = ?, 
          duracao = ?, 
          responsavel_atividade = ?
      WHERE id_atividade = ?
    `, [nome, categoria, local, data, horario, duracao, responsavel, id]);

    // Remove participantes antigos
    await conn.query("DELETE FROM faz WHERE atividade_id_atividade = ?", [id]);

    // Insere participantes novos
    if (participantes_ids) {
      const participantes = participantes_ids.split(",");
      for (const residenteId of participantes) {
        await conn.query(`
          INSERT INTO faz (residente_id_residente, atividade_id_atividade, data_registro)
          VALUES (?, ?, CURDATE())
        `, [residenteId, id]);
      }
    }

    await conn.commit();
    res.json({ message: "Atividade atualizada com sucesso!" });
  } catch (err) {
    await conn.rollback();
    console.error("Erro ao atualizar atividade:", err);
    res.status(500).json({ error: "Erro ao atualizar atividade." });
  } finally {
    conn.release();
  }
});

// ==============================
// 5️⃣ EXCLUIR ATIVIDADE
// ==============================
router.delete("/atividades/:id", async (req, res) => {
  const { id } = req.params;
  const conn = await connection.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query("DELETE FROM faz WHERE atividade_id_atividade = ?", [id]);
    await conn.query("DELETE FROM atividades WHERE id_atividade = ?", [id]);

    await conn.commit();
    res.json({ message: "Atividade excluída com sucesso!" });
  } catch (err) {
    await conn.rollback();
    console.error("Erro ao excluir atividade:", err);
    res.status(500).json({ error: "Erro ao excluir atividade." });
  } finally {
    conn.release();
  }
});

module.exports = router;
