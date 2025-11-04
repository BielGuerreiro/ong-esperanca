const express = require("express");
const db = require("../database.js");
const router = express.Router();

// LISTAR TODOS OS RESIDENTES _______________________________________________________________________
router.get("/residentes", async (req, res) => {
  let conn;
  try {
    conn = await db.getConnection();
    const [rows] = await conn.query(
      "SELECT id_residente, primeiro_nome, sobrenome, data_nascimento, sexo FROM residentes"
    );
    res.json(rows);
  } catch (err) {
    console.error("Erro ao listar residentes:", err);
    res.status(500).json({ error: "Erro ao listar residentes." });
  } finally {
    if (conn) conn.release();
  }
});

// 2️ BUSCAR UM RESIDENTE COMPLETO POR ID para editar _______________________________________________________________________
router.get("/residentes/:id", async (req, res) => {
  const { id } = req.params;
  let conn;
  try {
    conn = await db.getConnection();

    const sql = `
      SELECT 
        res.id_residente, res.primeiro_nome, res.sobrenome, res.cpf, res.documento, res.sexo, 
        res.data_nascimento, res.num_sus, res.etnia, res.pcd, res.tipo_sanguinio, 
        res.data_entrada, res.data_saida, res.frequenta_escola, 
        res.doencas, res.vacinas, res.alergias, res.descricao,
        
        end_res.cep, end_res.rua, end_res.numero, end_res.complemento, 
        end_res.bairro, end_res.cidade, end_res.uf,
        
        esc.id_escola, esc.escola_nome,
        end_esc.cep AS escola_cep,
        end_esc.rua AS escola_rua,
        end_esc.numero AS escola_numero,
        end_esc.bairro AS escola_bairro,
        end_esc.cidade AS escola_cidade,
        end_esc.uf AS escola_uf,
        
        resp.primeiro_nome AS responsavel_primeiro_nome,
        resp.sobrenome AS responsavel_sobrenome,
        resp.data_nascimento AS responsavel_nascimento,
        resp.sexo AS responsavel_sexo,
        resp.cpf AS responsavel_cpf,
        resp.estado_civil AS responsavel_estado_civil,
        resp.email AS responsavel_email,
        resp.telefone AS responsavel_telefone,
        resp.parentesco AS responsavel_parentesco,
        
        end_resp.cep AS responsavel_cep,
        end_resp.rua AS responsavel_rua,
        end_resp.numero AS responsavel_numero,
        end_resp.bairro AS responsavel_bairro,
        end_resp.cidade AS responsavel_cidade,
        end_resp.uf AS responsavel_uf

      FROM residentes res
      
      LEFT JOIN abriga abr ON res.id_residente = abr.residente_id_residente
      LEFT JOIN enderecos end_res ON abr.endereco_id_endereco = end_res.id_endereco
      
      LEFT JOIN escolas esc ON res.escola_id_escola = esc.id_escola
      LEFT JOIN enderecos end_esc ON esc.endereco_id_endereco = end_esc.id_endereco
      
      LEFT JOIN tem t ON res.id_residente = t.residente_id_residente
      LEFT JOIN responsaveis resp ON t.responsavel_id_responsavel = resp.id_responsavel
      
      LEFT JOIN detem d ON resp.id_responsavel = d.responsavel_id_responsavel
      LEFT JOIN enderecos end_resp ON d.endereco_id_endereco = end_resp.id_endereco
      
      WHERE res.id_residente = ?
    `;

    const [rows] = await conn.query(sql, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Residente não encontrado" });
    }

    const data = rows[0];
    const possuiResponsavel = !!data.responsavel_primeiro_nome;
    const enderecoIgual =
      possuiResponsavel && data.cep === data.responsavel_cep;

    const formatISODate = (date) => {
      if (!date) return null;
      return new Date(date).toISOString().split("T")[0];
    };

    res.json({
      "primeiro-nome": data.primeiro_nome,
      sobrenome: data.sobrenome,
      cpf: data.cpf,
      documento: data.documento,
      sexo: data.sexo,
      nascimento: formatISODate(data.data_nascimento),
      sus: data.num_sus,
      etnia: data.etnia,
      pcd: data.pcd,
      sangue: data.tipo_sanguinio,
      entrada: formatISODate(data.data_entrada),
      saida: formatISODate(data.data_saida),

      cep: data.cep,
      rua: data.rua,
      numero: data.numero,
      complemento: data.complemento,
      bairro: data.bairro,
      cidade: data.cidade,
      uf: data.uf,

      "frequenta-escola": data.frequenta_escola,
      "escola-nome": data.escola_nome,
      "escola-cep": data.escola_cep,
      "escola-rua": data.escola_rua,
      "escola-numero": data.escola_numero,
      "escola-bairro": data.escola_bairro,
      "escola-cidade": data.escola_cidade,
      "escola-uf": data.escola_uf,

      "possui-responsavel": possuiResponsavel ? "sim" : "nao",
      "responsavel-primeiro-nome": data.responsavel_primeiro_nome,
      "responsavel-sobrenome": data.responsavel_sobrenome,
      "responsavel-nascimento": formatISODate(data.responsavel_nascimento),
      "responsavel-sexo": data.responsavel_sexo,
      "responsavel-cpf": data.responsavel_cpf,
      "responsavel-estado-civil": data.responsavel_estado_civil,
      "responsavel-email": data.responsavel_email,
      "responsavel-telefone": data.responsavel_telefone,
      "responsavel-parentesco": data.responsavel_parentesco,

      "endereco-responsavel-igual": enderecoIgual ? "sim" : "nao",
      "responsavel-cep": data.responsavel_cep,
      "responsavel-rua": data.responsavel_rua,
      "responsavel-numero": data.responsavel_numero,
      "responsavel-bairro": data.responsavel_bairro,
      "responsavel-cidade": data.responsavel_cidade,
      "responsavel-uf": data.responsavel_uf,

      doencas: data.doencas,
      vacinas: data.vacinas,
      alergias: data.alergias,
      descricao: data.descricao,
    });
  } catch (err) {
    console.error("Erro ao buscar residente:", err);
    res.status(500).json({ error: "Erro ao buscar residente." });
  } finally {
    if (conn) conn.release();
  }
});

//  CADASTRAR NOVO RESIDENTE _______________________________________________________________________
router.post("/residentes", async (req, res) => {
  let conn;
  try {
    const data = req.body;

    conn = await db.getConnection();
    await conn.beginTransaction();

    // 1. Salva o Endereço do Residente _______________________________________________________________________
    const sqlEndRes = `INSERT INTO enderecos (cep, rua, numero, complemento, bairro, cidade, uf) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const [resEndRes] = await conn.query(sqlEndRes, [
      data.cep,
      data.rua,
      data.numero,
      data.complemento,
      data.bairro,
      data.cidade,
      data.uf,
    ]);
    const id_endereco_residente = resEndRes.insertId;

    // 2. Salva a Escola (se houver) _______________________________________________________________________
    let id_escola = null;
    if (data["frequenta-escola"] === "sim" && data["escola-nome"]) {
      const sqlEndEsc = `INSERT INTO enderecos (cep, rua, numero, bairro, cidade, uf) VALUES (?, ?, ?, ?, ?, ?)`;
      const [resEndEsc] = await conn.query(sqlEndEsc, [
        data["escola-cep"],
        data["escola-rua"],
        data["escola-numero"],
        data["escola-bairro"],
        data["escola-cidade"],
        data["escola-uf"],
      ]);
      const id_endereco_escola = resEndEsc.insertId;

      const sqlEscola = `INSERT INTO escolas (escola_nome, endereco_id_endereco) VALUES (?, ?)`;
      const [resEscola] = await conn.query(sqlEscola, [
        data["escola-nome"],
        id_endereco_escola,
      ]);
      id_escola = resEscola.insertId;
    }

    // 3. Salva o Residente (com CPF mascarado) _______________________________________________________________________
    const sqlRes = `
      INSERT INTO residentes (primeiro_nome, sobrenome, cpf, documento, sexo, data_nascimento, num_sus, etnia, pcd, tipo_sanguinio, data_entrada, data_saida, frequenta_escola, doencas, vacinas, alergias, descricao, escola_id_escola)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [resRes] = await conn.query(sqlRes, [
      data["primeiro-nome"],
      data.sobrenome,
      data.cpf || null,
      data.documento || null,
      data.sexo,
      data.nascimento,
      data.sus || null,
      data.etnia,
      data.pcd,
      data.sangue || null,
      data.entrada,
      data.saida || null,
      data["frequenta-escola"],
      data.doencas || null,
      data.vacinas || null,
      data.alergias || null,
      data.descricao || null,
      id_escola,
    ]);
    const id_residente = resRes.insertId;

    // 4. Liga Residente ao seu Endereço _______________________________________________________________________
    await conn.query(
      "INSERT INTO abriga (endereco_id_endereco, residente_id_residente) VALUES (?, ?)",
      [id_endereco_residente, id_residente]
    );

    // 5. Salva o Responsável (se houver) _______________________________________________________________________
    if (data["possui-responsavel"] === "sim") {
      let id_endereco_responsavel;

      if (data["endereco-responsavel-igual"] === "sim") {
        id_endereco_responsavel = id_endereco_residente;
      } else {
        const sqlEndResp = `INSERT INTO enderecos (cep, rua, numero, bairro, cidade, uf) VALUES (?, ?, ?, ?, ?, ?)`;
        const [resEndResp] = await conn.query(sqlEndResp, [
          data["responsavel-cep"],
          data["responsavel-rua"],
          data["responsavel-numero"],
          data["responsavel-bairro"],
          data["responsavel-cidade"],
          data["responsavel-uf"],
        ]);
        id_endereco_responsavel = resEndResp.insertId;
      }

      const sqlResp = `
        INSERT INTO responsaveis (primeiro_nome, sobrenome, data_nascimento, sexo, cpf, estado_civil, email, telefone, parentesco)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const [resResp] = await conn.query(sqlResp, [
        data["responsavel-primeiro-nome"],
        data["responsavel-sobrenome"],
        data["responsavel-nascimento"],
        data["responsavel-sexo"],
        data["responsavel-cpf"],
        data["responsavel-estado-civil"] || null,
        data["responsavel-email"] || null,
        data["responsavel-telefone"],
        data["responsavel-parentesco"],
      ]);
      const id_responsavel = resResp.insertId;

      await conn.query(
        "INSERT INTO tem (residente_id_residente, responsavel_id_responsavel) VALUES (?, ?)",
        [id_residente, id_responsavel]
      );

      await conn.query(
        "INSERT INTO detem (endereco_id_endereco, responsavel_id_responsavel) VALUES (?, ?)",
        [id_endereco_responsavel, id_responsavel]
      );
    }

    await conn.commit();
    res.status(201).json({ message: "Residente cadastrado com sucesso!" });
  } catch (err) {
    if (conn) await conn.rollback();
    console.error("Erro ao cadastrar residente:", err);
    res.status(500).json({
      error: "Erro ao cadastrar residente.",
      sqlMessage: err.sqlMessage,
    });
  } finally {
    if (conn) conn.release();
  }
});

// ATUALIZAR UM RESIDENTE _______________________________________________________________________
router.put("/residentes/:id", async (req, res) => {
  const { id } = req.params;
  let conn;
  try {
    const data = req.body;

    conn = await db.getConnection();
    await conn.beginTransaction();

    // 1. Atualiza o Residente _______________________________________________________________________
    const sqlRes = `
      UPDATE residentes SET 
        primeiro_nome = ?, sobrenome = ?, cpf = ?, documento = ?, sexo = ?, 
        data_nascimento = ?, num_sus = ?, etnia = ?, pcd = ?, tipo_sanguinio = ?, 
        data_entrada = ?, data_saida = ?, frequenta_escola = ?, 
        doencas = ?, vacinas = ?, alergias = ?, descricao = ?
      WHERE id_residente = ?
    `;
    await conn.query(sqlRes, [
      data["primeiro-nome"],
      data.sobrenome,
      data.cpf || null,
      data.documento || null,
      data.sexo,
      data.nascimento,
      data.sus || null,
      data.etnia,
      data.pcd,
      data.sangue || null,
      data.entrada,
      data.saida || null,
      data["frequenta-escola"],
      data.doencas || null,
      data.vacinas || null,
      data.alergias || null,
      data.descricao || null,
      id,
    ]);

    // 2. Atualiza Endereço do Residente _______________________________________________________________________
    const sqlEndRes = `
      UPDATE enderecos e 
      JOIN abriga a ON e.id_endereco = a.endereco_id_endereco
      SET e.cep = ?, e.rua = ?, e.numero = ?, e.complemento = ?, e.bairro = ?, e.cidade = ?, e.uf = ?
      WHERE a.residente_id_residente = ?
    `;
    await conn.query(sqlEndRes, [
      data.cep,
      data.rua,
      data.numero,
      data.complemento,
      data.bairro,
      data.cidade,
      data.uf,
      id,
    ]);

    // 3. Atualiza Escola e Endereço da Escola _______________________________________________________________________
    if (data["frequenta-escola"] === "sim" && data["escola-nome"]) {
      const [escolaRow] = await conn.query(
        "SELECT escola_id_escola FROM residentes WHERE id_residente = ?",
        [id]
      );
      const id_escola = escolaRow[0].escola_id_escola;

      if (id_escola) {
        const sqlEsc = `
              UPDATE escolas e
              LEFT JOIN enderecos end_esc ON e.endereco_id_endereco = end_esc.id_endereco
              SET 
                e.escola_nome = ?,
                end_esc.cep = ?, 
                end_esc.rua = ?, 
                end_esc.numero = ?, 
                end_esc.bairro = ?,
                end_esc.cidade = ?,
                end_esc.uf = ?
              WHERE e.id_escola = ?
            `;
        await conn.query(sqlEsc, [
          data["escola-nome"],
          data["escola-cep"],
          data["escola-rua"],
          data["escola-numero"],
          data["escola-bairro"],
          data["escola-cidade"],
          data["escola-uf"],
          id_escola,
        ]);
      } else {
        const sqlEndEsc = `INSERT INTO enderecos (cep, rua, numero, bairro, cidade, uf) VALUES (?, ?, ?, ?, ?, ?)`;
        const [resEndEsc] = await conn.query(sqlEndEsc, [
          data["escola-cep"],
          data["escola-rua"],
          data["escola-numero"],
          data["escola-bairro"],
          data["escola-cidade"],
          data["escola-uf"],
        ]);
        const id_endereco_escola = resEndEsc.insertId;

        const sqlEscola = `INSERT INTO escolas (escola_nome, endereco_id_endereco) VALUES (?, ?)`;
        const [resEscola] = await conn.query(sqlEscola, [
          data["escola-nome"],
          id_endereco_escola,
        ]);
        const id_escola_novo = resEscola.insertId;

        await conn.query(
          "UPDATE residentes SET escola_id_escola = ? WHERE id_residente = ?",
          [id_escola_novo, id]
        );
      }
    }

    await conn.commit();
    res.json({ message: "Residente atualizado com sucesso!" });
  } catch (err) {
    if (conn) await conn.rollback();
    console.error("Erro ao atualizar residente:", err);
    res.status(500).json({
      error: "Erro ao atualizar residente.",
      sqlMessage: err.sqlMessage,
    });
  } finally {
    if (conn) conn.release();
  }
});

// parte de excluir _______________________________________________________________________
router.delete("/residentes/:id", async (req, res) => {
  const { id } = req.params;
  let conn;

  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    // 1. Encontrar e deletar o endereço do residente _______________________________________________________________________
    const [endResRows] = await conn.query(
      "SELECT endereco_id_endereco FROM abriga WHERE residente_id_residente = ?",
      [id]
    );
    if (endResRows.length > 0) {
      const id_endereco_residente = endResRows[0].endereco_id_endereco;
      await conn.query("DELETE FROM abriga WHERE residente_id_residente = ?", [
        id,
      ]);
      await conn.query("DELETE FROM enderecos WHERE id_endereco = ?", [
        id_endereco_residente,
      ]);
    }

    // 2. Encontrar e deletar o responsável e seu endereço _______________________________________________________________________
    const [respRows] = await conn.query(
      "SELECT responsavel_id_responsavel FROM tem WHERE residente_id_residente = ?",
      [id]
    );
    if (respRows.length > 0) {
      const id_responsavel = respRows[0].responsavel_id_responsavel;

      const [endRespRows] = await conn.query(
        "SELECT endereco_id_endereco FROM detem WHERE responsavel_id_responsavel = ?",
        [id_responsavel]
      );
      if (endRespRows.length > 0) {
        const id_endereco_responsavel = endRespRows[0].endereco_id_responsavel;
        await conn.query(
          "DELETE FROM detem WHERE responsavel_id_responsavel = ?",
          [id_responsavel]
        );
        await conn.query("DELETE FROM enderecos WHERE id_endereco = ?", [
          id_endereco_responsavel,
        ]);
      }

      await conn.query("DELETE FROM tem WHERE residente_id_residente = ?", [
        id,
      ]);
      await conn.query("DELETE FROM responsaveis WHERE id_responsavel = ?", [
        id_responsavel,
      ]);
    }

    // 3. Deletar Escola e Endereço da Escola _______________________________________________________________________
    const [escolaRow] = await conn.query(
      "SELECT escola_id_escola FROM residentes WHERE id_residente = ?",
      [id]
    );
    if (escolaRow.length > 0 && escolaRow[0].escola_id_escola) {
      const id_escola = escolaRow[0].escola_id_escola;
      const [endEscRows] = await conn.query(
        "SELECT endereco_id_endereco FROM escolas WHERE id_escola = ?",
        [id_escola]
      );

      await conn.query(
        "UPDATE residentes SET escola_id_escola = NULL WHERE id_residente = ?",
        [id]
      );

      if (endEscRows.length > 0 && endEscRows[0].endereco_id_endereco) {
        const id_endereco_escola = endEscRows[0].endereco_id_endereco;
        await conn.query("DELETE FROM escolas WHERE id_escola = ?", [
          id_escola,
        ]);
        await conn.query("DELETE FROM enderecos WHERE id_endereco = ?", [
          id_endereco_escola,
        ]);
      } else {
        await conn.query("DELETE FROM escolas WHERE id_escola = ?", [
          id_escola,
        ]);
      }
    }

    // 4. Deletar Residente _______________________________________________________________________
    const [result] = await conn.query(
      "DELETE FROM residentes WHERE id_residente = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      throw new Error("Residente não encontrado.");
    }

    await conn.commit();
    res.json({ message: "Residente e todos os dados associados excluídos." });
  } catch (err) {
    if (conn) await conn.rollback();
    console.error("Erro ao excluir residente:", err);
    res.status(500).json({ error: "Erro ao excluir residente." });
  } finally {
    if (conn) conn.release();
  }
});

module.exports = router;
