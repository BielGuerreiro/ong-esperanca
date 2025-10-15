import express from 'express'
import cors from 'cors'
import connection from '../config/database.js'

const router = express.Router()

// CRUD RESPONSAVEIS -- check all //

// Lista todos os responsáveis 
router.get('/', (req, res) => {
  const sql = `
    SELECT 
      r.*, 
      CONCAT(c.primeiro_nome, ' ', c.sobrenome) AS nome_crianca
    FROM responsavel r
    LEFT JOIN crianca c ON r.id_crianca = c.id
  `
  connection.query(sql, (err, results) => {
    if (err) {
      console.error("Erro MySQL:", err)
      return res.status(500).send('Erro ao buscar responsáveis')
    }
    res.json(results)
  })
})


// Busca responsável por ID
router.get('/:id', (req, res) => {
  const { id } = req.params
  const sql = `
    SELECT r.*, CONCAT(c.primeiro_nome, ' ', c.sobrenome)  AS nome_crianca 
    FROM responsavel r
    LEFT JOIN crianca c ON r.id_crianca = c.id
    WHERE r.id = ?
  `
  connection.query(sql, [id], (err, results) => {
    if (err) return res.status(500).send('Erro ao buscar responsável')
    if (results.length === 0) return res.status(404).send('Responsável não encontrado')
    res.json(results[0])
  })
})

// Cadastra novo responsável
router.post('/', (req, res) => {
  const {
    nome,
    telefone,
    email,
    cpf_responsavel,
    data_nascimento,
    sexo,
    parentesco,
    senha,
    estado_civil,
    endereco_id_endereco,
    id_crianca
  } = req.body

  const sql = `
    INSERT INTO responsavel 
    (nome, telefone, email, cpf_responsavel, data_nascimento, sexo, parentesco, senha, estado_civil, endereco_id_endereco, id_crianca)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `
  connection.query(sql, [nome, telefone, email, cpf_responsavel, data_nascimento, sexo, parentesco, senha, estado_civil, endereco_id_endereco, id_crianca], (err, result) => {
    if (err) return res.status(500).send('Erro ao cadastrar responsável')
    res.status(201).send('Responsável cadastrado com sucesso!')
  })
})

// Atualiza responsável
router.put('/:id', (req, res) => {
  const { id } = req.params
  const {
    nome,
    telefone,
    email,
    cpf_responsavel,
    data_nascimento,
    sexo,
    parentesco,
    senha,
    estado_civil,
    endereco_id_endereco,
    id_crianca
  } = req.body

  const sql = `
    UPDATE responsavel SET 
      nome = ?, telefone = ?, email = ?, cpf_responsavel = ?, data_nascimento = ?, 
      sexo = ?, parentesco = ?, senha = ?, estado_civil = ?, endereco_id_endereco = ?, id_crianca = ?
    WHERE id = ?
  `
  connection.query(sql, [nome, telefone, email, cpf_responsavel, data_nascimento, sexo, parentesco, senha, estado_civil, endereco_id_endereco, id_crianca, id], (err, result) => {
    if (err) return res.status(500).send('Erro ao atualizar responsável')
    if (result.affectedRows === 0) return res.status(404).send('Responsável não encontrado')
    res.send('Responsável atualizado com sucesso!')
  })
})

// Deleta responsável
router
.delete('/:id', (req, res) => {
  const { id } = req.params
  const sql = 'DELETE FROM responsavel WHERE id = ?'
  connection.query(sql, [id], (err, result) => {
    if (err) return res.status(500).send('Erro ao excluir responsável')
    if (result.affectedRows === 0) return res.status(404).send('Responsável não encontrado')
    res.send('Responsável removido com sucesso!')
  })
})


export default router
