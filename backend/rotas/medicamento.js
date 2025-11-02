const express = require("express");
const db = require("../database.js"); // 1. CORRIGIDO: Usa 'db'
const { enviarEmailMedicamento } = require("../alerta/notificacao.js");
const router = express.Router();

// ==============================
// 0️⃣ BUSCAR MEDICAMENTO POR ID
// ==============================
router.get("/medicamentos/:id", async (req, res) => {
  const { id } = req.params;
  let conn;
  try {
    conn = await db.getConnection(); // 2. CORRIGIDO: Usa 'db' // 3. CORRIGIDO: Usa 'id_tratamento'
    const [rows] = await conn.query(
      `
      SELECT 
        m.id_tratamento AS id, 
        m.nome_medicamento AS medicamento,
        m.dosagem, m.tipo, m.horario, m.frequencia, m.duracao, m.data_vencimento,
        r.id_residente AS residenteId,
        r.primeiro_nome, r.sobrenome
      FROM medicamentos m
      JOIN recebe rec ON rec.medicamento_id_tratamento = m.id_tratamento
      JOIN residentes r ON r.id_residente = rec.residente_id_residente
      WHERE m.id_tratamento = ?
    `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Medicamento não encontrado" });
    }

    const row = rows[0];
    const medicamento = {
      id: row.id,
      medicamento: row.medicamento,
      dosagem: row.dosagem,
      tipo: row.tipo,
      horario: row.horario,
      frequencia: row.frequencia,
      duracao: row.duracao,
      validade: row.data_vencimento
        ? row.data_vencimento.toISOString().split("T")[0]
        : null,
      residenteId: row.residenteId,
    };

    res.json(medicamento);
  } catch (err) {
    console.error("Erro ao buscar medicamento:", err);
    res.status(500).json({ error: "Erro ao buscar medicamento." });
  } finally {
    if (conn) conn.release();
  }
});

// ==============================
// 1️⃣ LISTAR TODOS OS MEDICAMENTOS
// ==============================
router.get("/medicamentos", async (req, res) => {
  let conn;
  try {
    conn = await db.getConnection(); // CORRIGIDO: Usa 'db' // CORRIGIDO: Usa 'id_tratamento'
    const [rows] = await conn.query(`
      SELECT 
        m.id_tratamento AS id,
        m.nome_medicamento AS medicamento,
        m.dosagem, m.tipo, m.horario, m.frequencia, m.duracao, m.data_vencimento,
        r.id_residente AS residenteId,
        r.primeiro_nome, r.sobrenome
      FROM medicamentos m
      JOIN recebe rec ON rec.medicamento_id_tratamento = m.id_tratamento
      JOIN residentes r ON r.id_residente = rec.residente_id_residente
      ORDER BY m.horario ASC
    `);

    const listaTratamentos = rows.map((row) => ({
      id: row.id,
      medicamento: row.medicamento,
      dosagem: row.dosagem,
      tipo: row.tipo,
      // Formata o horário para HH:MM
      horario: row.horario ? row.horario.substring(0, 5) : "N/A",
      frequencia: row.frequencia,
      duracao: row.duracao,
      validade: row.data_vencimento,
      residenteId: row.residenteId,
      residenteNome: `${row.primeiro_nome} ${row.sobrenome}`,
    }));

    res.json(listaTratamentos);
  } catch (err) {
    console.error("Erro ao listar medicamentos:", err);
    res.status(500).json({ error: "Erro ao listar medicamentos." });
  } finally {
    if (conn) conn.release();
  }
});

// ==============================
// 2️⃣ CADASTRAR MEDICAMENTO
// ==============================
router.post("/medicamentos", async (req, res) => {
  const {
    residenteId,
    medicamento,
    tipo,
    horario,
    dosagem,
    frequencia,
    duracao,
    validade,
  } = req.body;
  let conn;
  try {
    conn = await db.getConnection(); // CORRIGIDO: Usa 'db'
    await conn.beginTransaction();

    const [result] = await conn.query(
      `INSERT INTO medicamentos 
        (nome_medicamento, dosagem, tipo, horario, frequencia, duracao, data_vencimento)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
      [medicamento, dosagem, tipo, horario, frequencia, duracao, validade]
    );

    const medicamentoId = result.insertId; // Este ID é o 'id_tratamento' // CORRIGIDO: Usa 'medicamento_id_tratamento'

    await conn.query(
      `
      INSERT INTO recebe 
        (residente_id_residente, medicamento_id_tratamento, data_prescricao)
      VALUES (?, ?, CURDATE())
    `,
      [residenteId, medicamentoId]
    );

    const [row] = await conn.query(
      `
      SELECT CONCAT(primeiro_nome, ' ', sobrenome) AS nome_completo
      FROM residentes
      WHERE id_residente = ?
    `,
      [residenteId]
    );

    const residenteNome = row[0]?.nome_completo || "Desconhecido";

    await conn.commit(); // O envio de e-mail continua igual

    await enviarEmailMedicamento({
      residenteNome,
      medicamento,
      tipo,
      dosagem,
      horario,
      frequencia,
      duracao,
      validade,
    });

    res.json({
      message: "Medicamento cadastrado e vinculado com sucesso!",
      medicamentoId,
    });
  } catch (err) {
    if (conn) await conn.rollback();
    console.error("Erro ao cadastrar medicamento:", err);
    res.status(500).json({ error: "Erro ao cadastrar medicamento." });
  } finally {
    if (conn) conn.release();
  }
});

// ==============================
// 3️⃣ ATUALIZAR MEDICAMENTO
// ==============================
router.put("/medicamentos/:id", async (req, res) => {
  const { id } = req.params;
  const { medicamento, dosagem, tipo, horario, frequencia, duracao, validade } =
    req.body;
  let conn;
  try {
    conn = await db.getConnection(); // CORRIGIDO: Usa 'db' // CORRIGIDO: Usa 'id_tratamento'
    await conn.query(
      `
      UPDATE medicamentos
      SET nome_medicamento = ?, dosagem = ?, tipo = ?, horario = ?, frequencia = ?, duracao = ?, data_vencimento = ?
      WHERE id_tratamento = ?
    `,
      [medicamento, dosagem, tipo, horario, frequencia, duracao, validade, id]
    );

    res.json({ message: "Medicamento atualizado com sucesso!" });
  } catch (err) {
    console.error("Erro ao atualizar medicamento:", err);
    res.status(500).json({ error: "Erro ao atualizar medicamento." });
  } finally {
    if (conn) conn.release();
  }
});

// ==============================
// 4️⃣ EXCLUIR MEDICAMENTO
// ==============================
router.delete("/medicamentos/:id", async (req, res) => {
  const { id } = req.params;
  let conn;
  try {
    conn = await db.getConnection(); // CORRIGIDO: Usa 'db'
    await conn.beginTransaction(); // CORRIGIDO: Usa 'medicamento_id_tratamento' e 'id_tratamento'
    await conn.query("DELETE FROM recebe WHERE medicamento_id_tratamento = ?", [
      id,
    ]);
    await conn.query("DELETE FROM medicamentos WHERE id_tratamento = ?", [id]);
    await conn.commit();

    res.json({ message: "Medicamento excluído com sucesso!" });
  } catch (err) {
    if (conn) await conn.rollback();
    console.error("Erro ao excluir medicamento:", err);
    res.status(500).json({ error: "Erro ao excluir medicamento." });
  } finally {
    if (conn) conn.release();
  }
});

module.exports = router;
