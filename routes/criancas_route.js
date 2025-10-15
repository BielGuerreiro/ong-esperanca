import express from 'express'
import connection from '../config/database.js'

//  CRUD CRIANÇAS -- check all //

const router = express.Router()

// Conta o total de crianças
router.get('/count', (req, res) => {
  const sql = 'SELECT COUNT(*) AS total FROM crianca';
  connection.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Erro ao contar residentes');
    }
    res.json({ total: results[0].total });
  });
});


// Lista todas as crianças
router.get('/', (req, res) => {
  const sql = 'SELECT * FROM crianca ORDER BY primeiro_nome, sobrenome'
  
  connection.query(sql, (err, results) => {
    if (err) {
      console.error(err)
      return res.status(500).send('Erro ao buscar dados')
    }
    res.json(results)
  })
})

// Busca criança por ID
router.get('/:id', (req, res) => {
  const { id } = req.params
  const sql = 'SELECT * FROM crianca WHERE id = ?'
  
  connection.query(sql, [id], (err, results) => {
    if (err) {
      console.error(err)
      return res.status(500).send('Erro ao buscar criança')
    }
    if (results.length === 0) {
      return res.status(404).send('Criança não encontrada')
    }
    res.json(results[0])
  })
})

//Busca crianças por nome
router.get('/nome/:nome', (req, res) => {
  const { nome } = req.params
  const sql = `SELECT * FROM crianca 
               WHERE primeiro_nome LIKE ? 
               OR sobrenome LIKE ? 
               ORDER BY primeiro_nome`
  const searchTerm = `%${nome}%`
  
  connection.query(sql, [searchTerm, searchTerm], (err, results) => {
    if (err) {
      console.error(err)
      return res.status(500).send('Erro ao buscar crianças')
    }
    res.json(results)
  })
})



// Cria nova criança


router.post('/', (req, res) => {
  const {
    primeiro_nome, sobrenome, CPF, documento, descricao, sexo,
    data_nascimento, etnia, alergias, numero_SUS, PCD,
    data_entrada, data_saida, tipo_sanguineo, cep, rua,numero, bairro, cidade, uf, complemento, frequenta_escola, doencas, vacinas
  } = req.body

  if (!primeiro_nome || !sobrenome) {
    return res.status(400).send('Campos obrigatórios não preenchidos.')
  }

  const sql = `INSERT INTO crianca (
    primeiro_nome, sobrenome, CPF, documento, descricao, sexo,
    data_nascimento, etnia, alergias, numero_SUS, PCD,
    data_entrada, data_saida, tipo_sanguineo, cep, rua, numero, bairro, cidade, uf, complemento, frequenta_escola, doencas, vacinas
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

  const values = [
    primeiro_nome, sobrenome, CPF, documento, descricao, sexo,
    data_nascimento, etnia, alergias, numero_SUS, PCD,
    data_entrada, data_saida, tipo_sanguineo, cep, rua, numero, bairro, cidade, uf, complemento, frequenta_escola, doencas, vacinas
  ]

  connection.query(sql, values, (err, results) => {
    if (err) {
      console.error(err)
      return res.status(500).send('Erro ao cadastrar criança')
    }
    res.status(201).json({
      message: 'Criança cadastrada com sucesso!',
      id: results.insertId
    })
  })
})

//Atualiza criança
router.put('/:id', (req, res) => {
  const { id } = req.params
  const {
    primeiro_nome, sobrenome, CPF, documento, descricao, sexo,
    data_nascimento, etnia, alergias, numero_SUS, PCD,
    data_entrada, data_saida, tipo_sanguineo, cep, rua, numero, bairro, cidade, uf, complemento, frequenta_escola, doencas, vacinas
  } = req.body

  const sql = `UPDATE crianca SET 
    primeiro_nome = ?, sobrenome = ?, CPF = ?, documento = ?,
    descricao = ?, sexo = ?, data_nascimento = ?, etnia = ?,
    alergias = ?, numero_SUS = ?, PCD = ?, data_entrada = ?,
    data_saida = ?, tipo_sanguineo = ?, cep = ?, rua = ?, numero = ?, bairro = ?, cidade = ?, uf = ?, complemento = ?, frequenta_escola = ?, doencas = ?, vacinas = ?
    WHERE id = ?`

  const values = [
    primeiro_nome, sobrenome, CPF, documento, descricao, sexo,
    data_nascimento, etnia, alergias, numero_SUS, PCD,
    data_entrada, data_saida, tipo_sanguineo, cep, rua, numero, bairro, cidade, uf, complemento, frequenta_escola, doencas, vacinas, id
  ]

  connection.query(sql, values, (err, results) => {
    if (err) {
      console.error(err)
      return res.status(500).send('Erro ao atualizar criança')
    }
    if (results.affectedRows === 0) {
      return res.status(404).send('Criança não encontrada')
    }
    res.json({ message: 'Criança atualizada com sucesso!' })
  })
})

//Excluir criança
router.delete('/:id', (req, res) => {
  const { id } = req.params
  const sql = 'DELETE FROM crianca WHERE id = ?'
  
  connection.query(sql, [id], (err, results) => {
    if (err) {
      console.error(err)
      return res.status(500).send('Erro ao excluir criança')
    }
    if (results.affectedRows === 0) {
      return res.status(404).send('Criança não encontrada')
    }
    res.json({ message: 'Criança excluída com sucesso!' })
  })
})

export default router