import express from "express";
import connection from "../config/database.js";

const router = express.Router();

/*
  🔹 Estrutura esperada no MySQL:

  CREATE TABLE medicamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    residente_id INT NOT NULL,
    medicamento VARCHAR(100) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    horario TIME NOT NULL,
    dosagem VARCHAR(100) NOT NULL,
    frequencia VARCHAR(100),
    duracao VARCHAR(100),
    validade DATE,
    status VARCHAR(30) DEFAULT 'Pendente',
    FOREIGN KEY (residente_id) REFERENCES crianca(id)
  );
*/

router.get("/count", (req, res) => {
  const sql = "SELECT COUNT(*) AS total FROM medicamentos";
  connection.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Erro ao contar medicamentos");
    }
    res.json({ total: results[0].total });
  });
});


router.get("/residente/:idResidente", (req, res) => {
  const { idResidente } = req.params;
  const sql = `
    SELECT m.*
    FROM medicamentos m
    WHERE m.residente_id = ?
    ORDER BY m.medicamento
  `;
  connection.query(sql, [idResidente], (err, results) => {
    if (err) {
      console.error("Erro ao buscar medicamentos:", err);
      return res.status(500).json({ erro: "Erro ao buscar medicamentos." });
    }
    res.status(200).json(results);
  });
});

// ✅ 2. Listar todos os medicamentos (com nome do residente)
router.get("/", (req, res) => {
  const sql = `
    SELECT 
      m.*, 
      c.primeiro_nome, 
      c.sobrenome 
    FROM medicamentos m
    JOIN crianca c ON m.residente_id = c.id
    ORDER BY m.horario
  `;
  connection.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Erro ao buscar medicamentos");
    }
    res.json(results);
  });
});

// ✅ 3. Buscar medicamento por ID
router.get("/:id", (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT 
      m.*, 
      c.primeiro_nome, 
      c.sobrenome 
    FROM medicamentos m
    JOIN crianca c ON m.residente_id = c.id
    WHERE m.id = ?
  `;
  connection.query(sql, [id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Erro ao buscar medicamento");
    }
    if (results.length === 0) {
      return res.status(404).send("Medicamento não encontrado");
    }
    res.json(results[0]);
  });
});

// ✅ 4. Criar novo medicamento
router.post("/", (req, res) => {
  const {
    residente_id,
    medicamento,
    tipo,
    horario,
    dosagem,
    frequencia,
    duracao,
    validade,
    status,
  } = req.body;

  if (!residente_id || !medicamento || !tipo || !horario || !dosagem) {
    return res.status(400).send("Campos obrigatórios não preenchidos.");
  }

  const sql = `
    INSERT INTO medicamentos (
      residente_id, medicamento, tipo, horario, dosagem, frequencia, duracao, validade, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    residente_id,
    medicamento,
    tipo,
    horario,
    dosagem,
    frequencia || null,
    duracao || null,
    validade || null,
    status || "Pendente",
  ];

  connection.query(sql, values, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Erro ao cadastrar medicamento");
    }
    res.status(201).json({
      message: "Medicamento cadastrado com sucesso!",
      id: results.insertId,
    });
  });
});

// ✅ 5. Atualizar medicamento
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const {
    residente_id,
    medicamento,
    tipo,
    horario,
    dosagem,
    frequencia,
    duracao,
    validade,
    status,
  } = req.body;

  const sql = `
    UPDATE medicamentos
    SET residente_id = ?, medicamento = ?, tipo = ?, horario = ?, dosagem = ?, 
        frequencia = ?, duracao = ?, validade = ?, status = ?
    WHERE id = ?
  `;

  const values = [
    residente_id,
    medicamento,
    tipo,
    horario,
    dosagem,
    frequencia || null,
    duracao || null,
    validade || null,
    status || "Pendente",
    id,
  ];

  connection.query(sql, values, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Erro ao atualizar medicamento");
    }
    if (results.affectedRows === 0) {
      return res.status(404).send("Medicamento não encontrado");
    }
    res.json({ message: "Medicamento atualizado com sucesso!" });
  });
});

// ✅ 6. Excluir medicamento
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM medicamentos WHERE id = ?";
  connection.query(sql, [id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Erro ao excluir medicamento");
    }
    if (results.affectedRows === 0) {
      return res.status(404).send("Medicamento não encontrado");
    }
    res.json({ message: "Medicamento excluído com sucesso!" });
  });
});

export default router;
