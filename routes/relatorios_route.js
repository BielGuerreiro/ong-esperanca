import express from 'express'
import connection from '../config/database.js'

const router = express.Router()

// Listar todos os relatórios

router.get('/', (req, res) => {
  const sql = `
    SELECT r.*, c.nome AS nome_crianca
    FROM relatorio r
    LEFT JOIN crianca c ON r.id_crianca = c.id
  `
  connection.query(sql, (err, results) => {
    if (err) return res.status(500).send('Erro ao buscar relatórios')
    res.json(results)
  })
})

// Buscar relatório por ID
router.get('/relatorio/:id', (req, res) => {
  const { id } = req.params
  const sql = 'SELECT * FROM relatorio WHERE id = ?'
  connection.query(sql, [id], (err, results) => {
    if (err) return res.status(500).send('Erro ao buscar relatório')
    if (results.length === 0) return res.status(404).send('Relatório não encontrado')
    res.json(results[0])
  })
})

// Criar relatório
router.post('/relatorio', (req, res) => {
  const { descricao, data, id_crianca } = req.body
  const sql = 'INSERT INTO relatorio (descricao, data, id_crianca) VALUES (?, ?, ?)'
  connection.query(sql, [descricao, data, id_crianca], (err) => {
    if (err) return res.status(500).send('Erro ao cadastrar relatório')
    res.status(201).send('Relatório cadastrado com sucesso!')
  })
})

//  Atualizar relatório
router.put('/relatorio/:id', (req, res) => {
  const { id } = req.params
  const { descricao, data, id_crianca } = req.body
  const sql = 'UPDATE relatorio SET descricao = ?, data = ?, id_crianca = ? WHERE id = ?'
  connection.query(sql, [descricao, data, id_crianca, id], (err) => {
    if (err) return res.status(500).send('Erro ao atualizar relatório')
    res.send('Relatório atualizado com sucesso!')
  })
})

//  Excluir relatórios
router.delete('/relatorio/:id', (req, res) => {
  const { id } = req.params
  const sql = 'DELETE FROM relatorio WHERE id = ?'
  connection.query(sql, [id], (err) => {
    if (err) return res.status(500).send('Erro ao excluir relatório')
    res.send('Relatório excluído com sucesso!')
  })
})

export default router