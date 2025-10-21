import express from "express";
import connection from "../config/database.js";

const router = express.Router();

/* 
  🔹 Tabela esperada no MySQL:
  CREATE TABLE atividades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome_atividade VARCHAR(100) NOT NULL,
    categoria ENUM('educacional', 'terapêutica', 'recreativa', 'esportiva', 'cultural') NOT NULL,
    local VARCHAR(100) NOT NULL,
    data DATE NOT NULL,
    horario TIME NOT NULL,
    duracao VARCHAR(50),
    participantes_ids TEXT, -- Armazena IDs separados por vírgula
    status VARCHAR(30) DEFAULT 'Agendada'
  );
*/

function buscarResidentesPorIds(ids) {
  if (!ids || ids.trim() === "") return Promise.resolve([]); // array vazio se não houver IDs
  const idsArray = ids.split(",").map(id => Number(id));
  return new Promise((resolve, reject) => {
    const sql = `SELECT * FROM crianca WHERE id IN (${idsArray.join(",")})`;
    connection.query(sql, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}

// ✅ 1. Contar total de atividades
router.get("/count", (req, res) => {
  const sql = "SELECT COUNT(*) AS total FROM atividades";
  connection.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Erro ao contar atividades");
    }
    res.json({ total: results[0].total });
  });
});

// ✅ 2. Listar todas as atividades
router.get("/", (req, res) => {
  const sql = "SELECT * FROM atividades ORDER BY data, horario";
  connection.query(sql, async (err, results) => {
    if (err) return res.status(500).send("Erro ao buscar atividades");

    try {
      const atividadesComParticipantes = await Promise.all(
        results.map(async (atividade) => {
          const participantes = await buscarResidentesPorIds(atividade.participantes_ids);
          return { ...atividade, participantes };
        })
      );
      res.json(atividadesComParticipantes);
    } catch (erro) {
      console.error(erro);
      res.status(500).send("Erro ao popular participantes");
    }
  });
});

// ✅ 3. Buscar atividade por ID
router.get("/:id", (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM atividades WHERE id = ?";
  connection.query(sql, [id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Erro ao buscar atividade");
    }
    if (results.length === 0) {
      return res.status(404).send("Atividade não encontrada");
    }
    res.json(results[0]);
  });
});

// ✅ 4. Criar nova atividade
router.post("/", (req, res) => {
  const {
    nome_atividade,
    categoria,
    local,
    data,
    horario,
    duracao,
    participantes_ids,
    status
  } = req.body;

  if (!nome_atividade || !categoria || !local || !data || !horario) {
    return res.status(400).send("Campos obrigatórios não preenchidos.");
  }

  const sql = `
    INSERT INTO atividades (
      nome_atividade, categoria, local, data, horario, duracao, participantes_ids, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    nome_atividade,
    categoria,
    local,
    data,
    horario,
    duracao || null,
    participantes_ids || null,
    status || "Agendada",
  ];

  connection.query(sql, values, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Erro ao cadastrar atividade");
    }
    res.status(201).json({
      message: "Atividade cadastrada com sucesso!",
      id: results.insertId,
    });
  });
});

// ✅ 5. Atualizar atividade
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const {
    nome_atividade,
    categoria,
    local,
    data,
    horario,
    duracao,
    participantes_ids,
    status
  } = req.body;

  const sql = `
    UPDATE atividades
    SET nome_atividade = ?, categoria = ?, local = ?, data = ?, horario = ?,
        duracao = ?, participantes_ids = ?, status = ?
    WHERE id = ?
  `;

  const values = [
    nome_atividade,
    categoria,
    local,
    data,
    horario,
    duracao || null,
    participantes_ids || null,
    status || "Agendada",
    id,
  ];

  connection.query(sql, values, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Erro ao atualizar atividade");
    }
    if (results.affectedRows === 0) {
      return res.status(404).send("Atividade não encontrada");
    }
    res.json({ message: "Atividade atualizada com sucesso!" });
  });
});

// ✅ 6. Excluir atividade
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM atividades WHERE id = ?";
  connection.query(sql, [id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Erro ao excluir atividade");
    }
    if (results.affectedRows === 0) {
      return res.status(404).send("Atividade não encontrada");
    }
    res.json({ message: "Atividade excluída com sucesso!" });
  });
});

export default router;
