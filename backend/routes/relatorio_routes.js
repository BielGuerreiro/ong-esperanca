import express from "express";
import connection from "../config/database.js";

const router = express.Router();

// 🔹 COUNT - contar relatórios
router.get("/count", (req, res) => {
  const sql = "SELECT COUNT(*) AS total FROM relatorio";
  connection.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Erro ao contar relatórios");
    }
    res.json({ total: results[0].total });
  });
});

// 🔹 CREATE - adicionar novo relatório
router.post("/", (req, res) => {
  const {
    data,
    id_residente,
    descricao,
    medicamento,
    horaMedicacao,
    medicacao_confirmada,
    responsavel
  } = req.body;

  const sql = `
    INSERT INTO relatorio 
      (data, id_residente, descricao, medicamento, horaMedicacao, medicacao_confirmada, responsavel)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  connection.query(
    sql,
    [data, id_residente, descricao, medicamento, horaMedicacao, medicacao_confirmada, responsavel],
    (err, result) => {
      if (err) {
        console.error("Erro ao inserir relatório:", err);
        return res.status(500).json({ erro: "Erro ao criar relatório." });
      }
      res.status(201).json({ mensagem: "Relatório criado com sucesso!", id_relatorio: result.insertId });
    }
  );
});

// 🔹 READ - listar todos os relatórios
router.get("/", (req, res) => {
  const sql = `
    SELECT 
      r.*, 
      c.primeiro_nome, 
      c.sobrenome
    FROM relatorio r
    JOIN crianca c ON r.id_residente = c.id
    ORDER BY r.data DESC, r.horaMedicacao DESC
  `;
  
  connection.query(sql, (err, results) => {
    if (err) {
      console.error("Erro ao buscar relatórios:", err);
      return res.status(500).json({ erro: "Erro ao buscar relatórios." });
    }
    const formatados = results.map(r => ({
      ...r,
      data: r.data && r.data !== "0000-00-00" ? new Date(r.data).toISOString().split("T")[0] : null
    }));
    res.status(200).json(formatados);
  });
});

// 🔹 READ (1) - buscar relatório específico
router.get("/:id_relatorio", (req, res) => {
  const { id_relatorio } = req.params;
  const sql = `
    SELECT 
      r.*, 
      c.primeiro_nome, 
      c.sobrenome
    FROM relatorio r
    JOIN crianca c ON r.id_residente = c.id
    WHERE r.id_relatorio = ?
  `;
  
  connection.query(sql, [id_relatorio], (err, results) => {
    if (err) {
      console.error("Erro ao buscar relatório:", err);
      return res.status(500).json({ erro: "Erro ao buscar relatório." });
    }
    if (results.length === 0) {
      return res.status(404).json({ mensagem: "Relatório não encontrado." });
    }
    res.status(200).json(results[0]);
  });
});

// 🔹 UPDATE - atualizar relatório
router.put("/:id_relatorio", (req, res) => {
  const { id_relatorio } = req.params;
  const {
    data,
    id_residente,
    descricao,
    medicamento,
    horaMedicacao,
    medicacao_confirmada,
    responsavel
  } = req.body;

  const sql = `
    UPDATE relatorio 
    SET 
      data = ?, 
      id_residente = ?, 
      descricao = ?, 
      medicamento = ?, 
      horaMedicacao = ?, 
      medicacao_confirmada = ?, 
      responsavel = ?
    WHERE id_relatorio = ?
  `;

  connection.query(
    sql,
    [data, id_residente, descricao, medicamento, horaMedicacao, medicacao_confirmada, responsavel, id_relatorio],
    (err) => {
      if (err) {
        console.error("Erro ao atualizar relatório:", err);
        return res.status(500).json({ erro: "Erro ao atualizar relatório." });
      }
      res.status(200).json({ mensagem: "Relatório atualizado com sucesso!" });
    }
  );
});

// 🔹 DELETE - excluir relatório
router.delete("/:id_relatorio", (req, res) => {
  const { id_relatorio } = req.params;
  const sql = "DELETE FROM relatorio WHERE id_relatorio = ?";

  connection.query(sql, [id_relatorio], (err) => {
    if (err) {
      console.error("Erro ao excluir relatório:", err);
      return res.status(500).json({ erro: "Erro ao excluir relatório." });
    }
    res.status(200).json({ mensagem: "Relatório excluído com sucesso!" });
  });
});

export default router;
