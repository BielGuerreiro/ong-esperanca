const express = require("express");
const db = require("../database.js");
const router = express.Router();

router.get("/relatorios", async (req, res) => {
  let conn;
  try {
    conn = await db.getConnection();
    const [rows] = await conn.query(`
      SELECT 
        rel.id_relatorio AS id,
        rel.data_relatorio,
        rel.medicamento,
        rel.responsavel_nome_registro AS responsavelNome,
        rel.statusMedicacao,
        res.primeiro_nome,
        res.sobrenome
      FROM relatorios rel
      LEFT JOIN residentes res ON rel.residente_id_residente = res.id_residente
      ORDER BY rel.data_relatorio DESC
    `);

    const relatorios = rows.map((rel) => ({
      ...rel,
      data: rel.data_relatorio
        ? new Date(rel.data_relatorio).toISOString().split("T")[0]
        : null,
      residenteNome:
        `${rel.primeiro_nome || ""} ${rel.sobrenome || ""}`.trim() ||
        "Residente não encontrado",
    }));

    res.json(relatorios);
  } catch (err) {
    console.error("Erro ao listar relatórios:", err);
    res.status(500).json({ error: "Erro ao listar relatórios." });
  } finally {
    if (conn) conn.release();
  }
});

router.get("/relatorios/:id", async (req, res) => {
  const { id } = req.params;
  let conn;
  try {
    conn = await db.getConnection();
    const [rows] = await conn.query(
      "SELECT * FROM relatorios WHERE id_relatorio = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Relatório não encontrado" });
    }

    const data = rows[0];

    const formatISODate = (date) => {
      if (!date) return null;
      return new Date(date).toISOString().split("T")[0];
    };

    res.json({
      ...data,
      data: formatISODate(data.data_relatorio),
      residenteId: data.residente_id_residente,
      responsavelNome: data.responsavel_nome_registro,
      horaMedicacao: data.horaMedicacao,
      "foi-medicado": data.statusMedicacao === "Medicado",
      descricao_fisio: data.descricao_fisica,
      evolucao_fisio: data.evolucao_fisica,
      funcionarioId: data.funcionario_id_funcionario,
    });
  } catch (err) {
    console.error("Erro ao buscar relatório:", err);
    res.status(500).json({ error: "Erro ao buscar relatório." });
  } finally {
    if (conn) conn.release();
  }
});

router.get("/relatorios/residente/:id", async (req, res) => {
  const { id } = req.params;
  let conn;
  try {
    conn = await db.getConnection();
    const [rows] = await conn.query(
      `SELECT 
        data_relatorio, evolucao_social, evolucao_pedagogica, 
        evolucao_psicologica, evolucao_saude, evolucao_fisica, 
        evolucao_comunicacao 
      FROM relatorios 
      WHERE residente_id_residente = ?`,
      [id]
    );
    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar relatórios do residente:", err);
    res.status(500).json({ error: "Erro ao buscar relatórios do residente." });
  } finally {
    if (conn) conn.release();
  }
});

router.post("/relatorios", async (req, res) => {
  let conn;
  try {
    const data = req.body;

    conn = await db.getConnection();
    await conn.beginTransaction();

    const [funcRows] = await conn.query(
      "SELECT id_funcionario FROM funcionarios WHERE id_funcionario = ?",
      [data.funcionarioId]
    );

    if (funcRows.length === 0) {
      await conn.rollback();
      return res.status(400).json({
        error: "Funcionário responsável não encontrado.",
      });
    }

    const sql = `
      INSERT INTO relatorios (
        residente_id_residente, funcionario_id_funcionario, data_relatorio, 
        descricao_social, evolucao_social, 
        descricao_pedagogica, evolucao_pedagogica,
        descricao_psicologica, evolucao_psicologica,
        descricao_saude, evolucao_saude,
        descricao_fisica, evolucao_fisica,
        descricao_comunicacao, evolucao_comunicacao,
        medicamento, horaMedicacao, statusMedicacao,
        descricao_geral, responsavel_nome_registro, status
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pendente'
      )
    `;

    await conn.query(sql, [
      data.residenteId,
      data.funcionarioId,
      data.data,
      data.descricao_social,
      data.evolucao_social,
      data.descricao_pedagogica,
      data.evolucao_pedagogica,
      data.descricao_psicologica,
      data.evolucao_psicologica,
      data.descricao_saude,
      data.evolucao_saude,
      data.descricao_fisio,
      data.evolucao_fisio,
      data.descricao_comunicacao,
      data.evolucao_comunicacao,
      data.medicamento,
      data.horaMedicacao || null,
      data.statusMedicacao,
      data.descricao_geral,
      data.responsavelNome,
    ]);

    if (data.medicamento && data.statusMedicacao === "Medicado") {
      const sqlEstoque = `
        UPDATE estoque 
        SET quantidade = GREATEST(0, quantidade - 1) 
        WHERE nome = ? AND quantidade > 0
      `;
      await conn.query(sqlEstoque, [data.medicamento]);
    }

    await conn.commit();
    res.status(201).json({ message: "Ficha de Evolução salva com sucesso!" });
  } catch (err) {
    if (conn) await conn.rollback();
    console.error("Erro ao cadastrar relatório:", err);
    res.status(500).json({
      error: "Erro ao cadastrar relatório.",
      sqlMessage: err.sqlMessage,
    });
  } finally {
    if (conn) conn.release();
  }
});

router.put("/relatorios/:id", async (req, res) => {
  const { id } = req.params;
  let conn;
  try {
    const data = req.body;
    conn = await db.getConnection();

    const sql = `
      UPDATE relatorios SET
        residente_id_residente = ?,
        data_relatorio = ?,
        descricao_social = ?, evolucao_social = ?,
        descricao_pedagogica = ?, evolucao_pedagogica = ?,
        descricao_psicologica = ?, evolucao_psicologica = ?,
        descricao_saude = ?, evolucao_saude = ?,
        descricao_fisica = ?, evolucao_fisica = ?,
        descricao_comunicacao = ?, evolucao_comunicacao = ?,
        medicamento = ?, horaMedicacao = ?, statusMedicacao = ?,
        descricao_geral = ?, responsavel_nome_registro = ?
      WHERE id_relatorio = ?
    `;

    await conn.query(sql, [
      data.residenteId,
      data.data,
      data.descricao_social,
      data.evolucao_social,
      data.descricao_pedagogica,
      data.evolucao_pedagogica,
      data.descricao_psicologica,
      data.evolucao_psicologica,
      data.descricao_saude,
      data.evolucao_saude,
      data.descricao_fisio,
      data.evolucao_fisio,
      data.descricao_comunicacao,
      data.evolucao_comunicacao,
      data.medicamento,
      data.horaMedicacao || null,
      data.statusMedicacao,
      data.descricao_geral,
      data.responsavelNome,
      id,
    ]);

    res.json({ message: "Ficha de Evolução atualizada com sucesso!" });
  } catch (err) {
    console.error("Erro ao atualizar relatório:", err);
    res.status(500).json({
      error: "Erro ao atualizar relatório.",
      sqlMessage: err.sqlMessage,
    });
  } finally {
    if (conn) conn.release();
  }
});

router.delete("/relatorios/:id", async (req, res) => {
  const { id } = req.params;
  let conn;
  try {
    conn = await db.getConnection();
    await conn.query("DELETE FROM relatorios WHERE id_relatorio = ?", [id]);
    res.json({ message: "Relatório excluído com sucesso." });
  } catch (err) {
    console.error("Erro ao excluir relatório:", err);
    res.status(500).json({ error: "Erro ao excluir relatório." });
  } finally {
    if (conn) conn.release();
  }
});

module.exports = router;
