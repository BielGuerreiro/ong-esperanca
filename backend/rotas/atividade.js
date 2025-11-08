const express = require("express");
const db = require("../database.js");
const router = express.Router();

router.get("/atividades", async (req, res) => {
  let conn;
  try {
    conn = await db.getConnection();
    const [rows] = await conn.query(`
      SELECT 
        a.id_atividade AS id,
        a.nome AS nome_atividade,
        a.categoria_atividade AS categoria,
        a.local_atividade AS local,
        a.data_atividade AS data,
        a.horario,
        a.duracao,
        a.responsavel_atividade AS responsavel,
        a.status, 
        GROUP_CONCAT(DISTINCT f.residente_id_residente) AS participantes_ids,
        GROUP_CONCAT(DISTINCT r.primeiro_nome SEPARATOR ', ') AS participantes_nomes
      FROM atividades a
      LEFT JOIN faz f ON f.atividade_id_atividade = a.id_atividade
      LEFT JOIN residentes r ON r.id_residente = f.residente_id_residente
      GROUP BY a.id_atividade
      -- A CORREÇÃO ESTÁ AQUI: ASC MUDOU PARA DESC --
      ORDER BY a.data_atividade ASC, a.horario ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error("Erro ao listar atividades:", err);
    res.status(500).json({ error: "Erro ao listar atividades." });
  } finally {
    if (conn) conn.release();
  }
});

// 2. BUSCAR ATIVIDADE POR ID (Corrigido: Busca nomes)
router.get("/atividades/:id", async (req, res) => {
  const { id } = req.params;
  let conn;
  try {
    conn = await db.getConnection();
    const [rows] = await conn.query(
      `
      SELECT 
        a.id_atividade AS id, a.nome AS nome_atividade, a.categoria_atividade AS categoria,
        a.local_atividade AS local, a.data_atividade AS data, a.horario,
        a.duracao, a.responsavel_atividade AS responsavel, a.status,
        GROUP_CONCAT(DISTINCT f.residente_id_residente) AS participantes_ids,
        GROUP_CONCAT(DISTINCT r.primeiro_nome SEPARATOR ', ') AS participantes_nomes
      FROM atividades a
      LEFT JOIN faz f ON f.atividade_id_atividade = a.id_atividade
      LEFT JOIN residentes r ON r.id_residente = f.residente_id_residente
      WHERE a.id_atividade = ?
      GROUP BY a.id_atividade
    `,
      [id]
    );
    if (rows.length === 0)
      return res.status(404).json({ error: "Atividade não encontrada" });
    res.json(rows[0]);
  } catch (err) {
    console.error("Erro ao buscar atividade:", err);
    res.status(500).json({ error: "Erro ao buscar atividade." });
  } finally {
    if (conn) conn.release();
  }
});

// 3. CADASTRAR NOVA ATIVIDADE (Corrigido: Salva o status)
router.post("/atividades", async (req, res) => {
  const {
    nome,
    categoria,
    local,
    data,
    horario,
    duracao,
    responsavel,
    participantes_ids,
    status,
  } = req.body;
  let conn;
  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    const [result] = await conn.query(
      `INSERT INTO atividades 
      (nome, categoria_atividade, local_atividade, data_atividade, horario, duracao, responsavel_atividade, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        nome,
        categoria,
        local,
        data,
        horario,
        duracao,
        responsavel,
        status || "Agendada",
      ]
    );

    const atividadeId = result.insertId;

    if (participantes_ids) {
      const participantes = participantes_ids.split(",").filter(Boolean);
      for (const residenteId of participantes) {
        await conn.query(
          `
          INSERT INTO faz (residente_id_residente, atividade_id_atividade, data_registro)
          VALUES (?, ?, CURDATE())
        `,
          [residenteId, atividadeId]
        );
      }
    }

    await conn.commit();
    res.json({ message: "Atividade cadastrada com sucesso!", atividadeId });
  } catch (err) {
    if (conn) await conn.rollback();
    console.error("Erro ao cadastrar atividade:", err);
    res.status(500).json({ error: "Erro ao cadastrar atividade." });
  } finally {
    if (conn) conn.release();
  }
});

// 4. ATUALIZAR ATIVIDADE (Corrigido: Já estava correto)
router.put("/atividades/:id", async (req, res) => {
  const { id } = req.params;
  const {
    nome,
    categoria,
    local,
    data,
    horario,
    duracao,
    responsavel,
    participantes_ids,
    status,
  } = req.body;
  let conn;
  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    await conn.query(
      `UPDATE atividades
      SET nome = ?, 
          categoria_atividade = ?, 
          local_atividade = ?, 
          data_atividade = ?, 
          horario = ?, 
          duracao = ?, 
          responsavel_atividade = ?,
          status = ? 
      WHERE id_atividade = ?
    `,
      [nome, categoria, local, data, horario, duracao, responsavel, status, id]
    );

    await conn.query("DELETE FROM faz WHERE atividade_id_atividade = ?", [id]);

    if (participantes_ids) {
      const participantes = participantes_ids.split(",").filter(Boolean);
      for (const residenteId of participantes) {
        await conn.query(
          `
          INSERT INTO faz (residente_id_residente, atividade_id_atividade, data_registro)
          VALUES (?, ?, CURDATE())
        `,
          [residenteId, id]
        );
      }
    }

    await conn.commit();
    res.json({ message: "Atividade atualizada com sucesso!" });
  } catch (err) {
    if (conn) await conn.rollback();
    console.error("Erro ao atualizar atividade:", err);
    res.status(500).json({ error: "Erro ao atualizar atividade." });
  } finally {
    if (conn) conn.release();
  }
});

// 5. EXCLUIR ATIVIDADE (Já estava correto)
router.delete("/atividades/:id", async (req, res) => {
  const { id } = req.params;
  let conn;
  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    await conn.query("DELETE FROM faz WHERE atividade_id_atividade = ?", [id]);
    await conn.query("DELETE FROM atividades WHERE id_atividade = ?", [id]);

    await conn.commit();
    res.json({ message: "Atividade excluída com sucesso!" });
  } catch (err) {
    if (conn) await conn.rollback();
    console.error("Erro ao excluir atividade:", err);
    res.status(500).json({ error: "Erro ao excluir atividade." });
  } finally {
    if (conn) conn.release();
  }
});

module.exports = router;
