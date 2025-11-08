const express = require("express");
const router = express.Router();
const db = require("../database.js");
const bcrypt = require("bcryptjs");

// ROTA 1: GET /api/funcionarios (Listar TODOS) ______________________________________________________________________________
router.get("/funcionarios", async (req, res) => {
  let conn;
  try {
    conn = await db.getConnection();
    const [funcionarios] = await conn.query(
      "SELECT id_funcionario, numero_registro, primeiro_nome, sobrenome, turno, status FROM funcionarios"
    );
    res.json(funcionarios);
  } catch (error) {
    console.error("Erro ao buscar funcionários:", error);
    res.status(500).json({ error: "Erro interno ao buscar funcionários." });
  } finally {
    if (conn) conn.release();
  }
});

// ROTA 2: POST /api/funcionarios (CADASTRAR) - CORRIGIDA ______________________________________________________________________________
router.post("/funcionarios", async (req, res) => {
  let conn;
  try {
    // 1. Pega TODOS os dados do formulário
    const {
      // Etapa 1
      "primeiro-nome": primeiro_nome,
      sobrenome,
      cpf,
      nascimento,
      sexo,
      telefone,
      email,
      // Etapa 2
      cep,
      rua,
      numero,
      bairro,
      cidade,
      uf,
      // Etapa 3
      numero_registro,
      cargo,
      admissao,
      senha,
      "nivel-acesso": nivel_acesso,
      turno,
      descricao,
      status,
      residentes_vinculados_ids,
    } = req.body;

    // 2. Validação simples
    if (
      !numero_registro ||
      !primeiro_nome ||
      !cpf ||
      !email ||
      !senha ||
      !cep
    ) {
      return res.status(400).json({ error: "Campos obrigatórios faltando." });
    }

    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    // 3. Inicia a Transação
    conn = await db.getConnection();
    await conn.beginTransaction();

    // 4. Salva o Endereço
    const sqlEndereco = `
      INSERT INTO enderecos (cep, rua, numero, bairro, cidade, uf)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [resultEnd] = await conn.query(sqlEndereco, [
      cep,
      rua,
      numero,
      bairro,
      cidade,
      uf,
    ]);
    const id_endereco = resultEnd.insertId;

    // 5. Salva o Funcionário
    const sqlFunc = `
      INSERT INTO funcionarios 
      (numero_registro, primeiro_nome, sobrenome, cpf, data_nascimento, sexo, telefone, email, cargo, data_admissao, senha, nivel_acesso, turno, descricao, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [resultFunc] = await conn.query(sqlFunc, [
      numero_registro,
      primeiro_nome,
      sobrenome,
      cpf,
      nascimento,
      sexo,
      telefone,
      email,
      cargo,
      admissao,
      senhaHash,
      nivel_acesso,
      turno,
      descricao,
      status,
    ]);
    const id_funcionario = resultFunc.insertId;

    // 6. Liga o funcionário ao endereço na tabela 'contem'
    const sqlContem = `
      INSERT INTO contem (funcionario_id_funcionario, endereco_id_endereco)
      VALUES (?, ?)
    `;
    await conn.query(sqlContem, [id_funcionario, id_endereco]);

    // --- 7. (CORRIGIDO) LIGA O FUNCIONÁRIO AOS RESIDENTES NA TABELA 'coordena' ---

    const residentes_atribuidos = residentes_vinculados_ids
      ? residentes_vinculados_ids.split(",").filter(Boolean)
      : [];

    if (residentes_atribuidos && residentes_atribuidos.length > 0) {
      let sqlCoordena =
        "INSERT INTO coordena (funcionario_id_funcionario, residente_id_residente) VALUES ";
      const valoresCoordena = [];

      residentes_atribuidos.forEach((id_residente) => {
        sqlCoordena += "(?, ?),";
        valoresCoordena.push(id_funcionario, id_residente);
      });

      sqlCoordena = sqlCoordena.slice(0, -1);

      await conn.query(sqlCoordena, valoresCoordena);
    }

    await conn.commit();

    res.status(201).json({
      id: id_funcionario,
      message: "Funcionário cadastrado e atribuído com sucesso!",
    });
  } catch (error) {
    if (conn) await conn.rollback();

    console.error("Erro ao cadastrar funcionário:", error);
    if (error.code === "ER_DUP_ENTRY") {
      if (error.sqlMessage.includes("cpf")) {
        return res.status(400).json({ error: "Este CPF já está cadastrado." });
      }
      if (error.sqlMessage.includes("email")) {
        return res
          .status(400)
          .json({ error: "Este Email já está cadastrado." });
      }
      if (error.sqlMessage.includes("numero_registro")) {
        return res
          .status(400)
          .json({ error: "Este Número de Registro já está cadastrado." });
      }
    }
    res.status(500).json({
      error: "Erro interno ao cadastrar funcionário.",
      sqlMessage: error.sqlMessage,
    });
  } finally {
    if (conn) conn.release();
  }
});

// ROTA 3: GET /api/funcionarios/:id (Buscar UM para EDITAR) - CORRIGIDA ______________________________________________________________________________
router.get("/funcionarios/:id_funcionario", async (req, res) => {
  let conn;
  try {
    const { id_funcionario } = req.params;
    conn = await db.getConnection();

    const sql = `
      SELECT 
        f.id_funcionario, f.numero_registro, f.primeiro_nome, f.sobrenome, f.cpf, 
        f.data_nascimento, f.sexo, f.telefone, f.email, f.cargo, f.data_admissao, 
        f.nivel_acesso, f.turno, f.descricao, f.status,
        e.cep, e.rua, e.numero, e.bairro, e.cidade, e.uf,
        
        -- Esta subquery busca todos os IDs de residentes da tabela 'coordena'
        -- e os agrupa em uma única string separada por vírgula (ex: "1,2,5")
        (SELECT GROUP_CONCAT(co.residente_id_residente) 
         FROM coordena co 
         WHERE co.funcionario_id_funcionario = f.id_funcionario) AS residentes_vinculados_ids
         
      FROM funcionarios f
      LEFT JOIN contem c ON f.id_funcionario = c.funcionario_id_funcionario
      LEFT JOIN enderecos e ON c.endereco_id_endereco = e.id_endereco
      WHERE f.id_funcionario = ?
    `;

    const [rows] = await conn.query(sql, [id_funcionario]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Funcionário não encontrado." });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Erro ao buscar funcionário:", error);
    res.status(500).json({ error: "Erro interno ao buscar funcionário." });
  } finally {
    if (conn) conn.release();
  }
});

// ROTA 4: PUT /api/funcionarios/:id (ATUALIZAR) - CORRIGIDA ______________________________________________________________________________
router.put("/funcionarios/:id_funcionario", async (req, res) => {
  let conn;
  try {
    const { id_funcionario } = req.params;

    // 1. Pega TODOS os dados
    const {
      // Etapa 1
      "primeiro-nome": primeiro_nome,
      sobrenome,
      cpf,
      nascimento,
      sexo,
      telefone,
      email,
      // Etapa 2
      cep,
      rua,
      numero,
      bairro,
      cidade,
      uf,
      // Etapa 3
      numero_registro,
      cargo,
      admissao,
      "nivel-acesso": nivel_acesso,
      turno,
      descricao,
      status,
      residentes_vinculados_ids,
    } = req.body;

    // 2. Inicia a Transação
    conn = await db.getConnection();
    await conn.beginTransaction();

    // 3. Atualiza o Funcionário (Campos que NÃO PODEM mudar não são atualizados)
    // ATENÇÃO: Seu código original permitia mudar CPF, admissao, etc.
    // O ideal é não permitir, mas mantive sua lógica original.
    const sqlFunc = `
      UPDATE funcionarios SET 
        numero_registro = ?, primeiro_nome = ?, sobrenome = ?, cpf = ?, data_nascimento = ?, 
        sexo = ?, telefone = ?, email = ?, cargo = ?, data_admissao = ?, 
        nivel_acesso = ?, turno = ?, descricao = ?, status = ?
      WHERE id_funcionario = ?
    `;
    await conn.query(sqlFunc, [
      numero_registro,
      primeiro_nome,
      sobrenome,
      cpf,
      nascimento,
      sexo,
      telefone,
      email,
      cargo,
      admissao,
      nivel_acesso,
      turno,
      descricao,
      status,
      id_funcionario,
    ]);

    const sqlEnd = `
      UPDATE enderecos e
      JOIN contem c ON e.id_endereco = c.endereco_id_endereco
      SET 
        e.cep = ?, e.rua = ?, e.numero = ?, 
        e.bairro = ?, e.cidade = ?, e.uf = ?
      WHERE c.funcionario_id_funcionario = ?
    `;
    await conn.query(sqlEnd, [
      cep,
      rua,
      numero,
      bairro,
      cidade,
      uf,
      id_funcionario,
    ]);

    // --- 5. (CORRIGIDO) ATUALIZA AS LIGAÇÕES DE RESIDENTES ---

    const sqlDeleteCoordena =
      "DELETE FROM coordena WHERE funcionario_id_funcionario = ?";
    await conn.query(sqlDeleteCoordena, [id_funcionario]);

    const residentes_atribuidos = residentes_vinculados_ids
      ? residentes_vinculados_ids.split(",").filter(Boolean)
      : [];

    if (residentes_atribuidos.length > 0) {
      let sqlCoordena =
        "INSERT INTO coordena (funcionario_id_funcionario, residente_id_residente) VALUES ";
      const valoresCoordena = [];

      residentes_atribuidos.forEach((id_residente) => {
        sqlCoordena += "(?, ?),";
        valoresCoordena.push(id_funcionario, id_residente);
      });

      sqlCoordena = sqlCoordena.slice(0, -1);
      await conn.query(sqlCoordena, valoresCoordena);
    }

    await conn.commit();

    res.json({ message: "Funcionário atualizado com sucesso." });
  } catch (error) {
    if (conn) await conn.rollback();
    console.error("Erro ao atualizar funcionário:", error);
    res.status(500).json({ error: "Erro interno ao atualizar funcionário." });
  } finally {
    if (conn) conn.release();
  }
});

// ROTA 5: DELETE /api/funcionarios/:id (DELETAR) ______________________________________________________________________________
// (Seu código original desta rota está CORRETO e não precisa de ajustes)
// A tabela 'coordena' usou ON DELETE CASCADE, então as ligações
// serão excluídas automaticamente quando o funcionário for deletado.
router.delete("/funcionarios/:id_funcionario", async (req, res) => {
  let conn;
  try {
    const { id_funcionario } = req.params;
    conn = await db.getConnection();
    await conn.beginTransaction();

    const [rows] = await conn.query(
      "SELECT endereco_id_endereco FROM contem WHERE funcionario_id_funcionario = ?",
      [id_funcionario]
    );
    const id_endereco = rows.length > 0 ? rows[0].endereco_id_endereco : null;

    const [resultado] = await conn.query(
      "DELETE FROM funcionarios WHERE id_funcionario = ?",
      [id_funcionario]
    );

    if (resultado.affectedRows === 0) {
      await conn.rollback();
      return res.status(404).json({ error: "Funcionário não encontrado." });
    }

    if (id_endereco) {
      await conn.query("DELETE FROM enderecos WHERE id_endereco = ?", [
        id_endereco,
      ]);
    }

    await conn.commit();

    res
      .status(200)
      .json({ message: "Funcionário e endereço excluídos com sucesso." });
  } catch (error) {
    if (conn) await conn.rollback();
    console.error("Erro ao excluir funcionário:", error);
    res.status(500).json({ error: "Erro interno ao excluir funcionário." });
  } finally {
    if (conn) conn.release();
  }
});

module.exports = router;
