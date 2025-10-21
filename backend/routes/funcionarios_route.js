import express from 'express'
import connection from '../config/database.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const router = express.Router()

// ==========================================================
// 🔑 CONFIGURAÇÃO DO JWT
// ==========================================================
const SECRET_KEY = process.env.JWT_SECRET || 'anakin_skywalker_secret'

// ==========================================================
// 🧩 LISTAR TODOS OS FUNCIONÁRIOS
// ==========================================================
router.get('/', (req, res) => {
  const sql = `
  SELECT 
    id, 
    primeiro_nome, 
    sobrenome, 
    turno, 
    status, 
    nivel_acesso, 
    cargo, 
    DATE_FORMAT(data_admissao, '%d/%m/%Y') AS data_admissao
  FROM funcionarios
  ORDER BY primeiro_nome ASC
`;


  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Erro ao buscar funcionários:', err)
      return res.status(500).json({ error: 'Erro ao buscar funcionários.' })
    }
    res.json(results)
  })
})

// ==========================================================
// 🔍 BUSCAR FUNCIONÁRIO POR ID
// ==========================================================
router.get('/:id', (req, res) => {
  const { id } = req.params
  const sql = 'SELECT * FROM funcionarios WHERE id = ?'

  connection.query(sql, [id], (err, results) => {
    if (err) {
      console.error('Erro ao buscar funcionário:', err)
      return res.status(500).json({ error: 'Erro ao buscar funcionário.' })
    }
    if (results.length === 0)
      return res.status(404).json({ message: 'Funcionário não encontrado.' })

    res.json(results[0])
  })
})

// ==========================================================
// 🧾 CADASTRAR NOVO FUNCIONÁRIO
// ==========================================================
router.post('/', async (req, res) => {
  const dados = req.body

  try {
    // Criptografar a senha antes de salvar
    const senhaCriptografada = await bcrypt.hash(dados.senha, 10)

    const sql = `
      INSERT INTO funcionarios (
        primeiro_nome, sobrenome, cpf, data_nascimento, sexo, telefone, email,
        cep, rua, numero, bairro, cidade, uf,
        cargo, data_admissao, senha, nivel_acesso, turno,
        status, residentes_sob_cuidados, descricao
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `

    const valores = [
      dados.primeiro_nome,
      dados.sobrenome,
      dados.cpf,
      dados.data_nascimento,
      dados.sexo,
      dados.telefone,
      dados.email,
      dados.cep,
      dados.rua,
      dados.numero,
      dados.bairro,
      dados.cidade,
      dados.uf,
      dados.cargo,
      dados.data_admissao,
      senhaCriptografada,
      dados.nivel_acesso,
      dados.turno,
      dados.status,
      dados.residentes_sob_cuidados || '',
      dados.descricao || ''
    ]

    connection.query(sql, valores, (err) => {
      if (err) {
        console.error('Erro ao cadastrar funcionário:', err)
        return res.status(500).json({ error: 'Erro ao cadastrar funcionário.' })
      }

      res.status(201).json({ message: 'Funcionário cadastrado com sucesso!' })
    })
  } catch (error) {
    console.error('Erro ao processar cadastro:', error)
    res.status(500).json({ error: 'Erro interno no servidor.' })
  }
})

// ==========================================================
// ✏️ ATUALIZAR FUNCIONÁRIO EXISTENTE
// ==========================================================
router.put('/:id', async (req, res) => {
  const { id } = req.params
  const dados = req.body

  try {
    let senhaAtualizada = null
    if (dados.senha) {
      senhaAtualizada = await bcrypt.hash(dados.senha, 10)
    }

    const sql = `
      UPDATE funcionarios SET
        primeiro_nome = ?, sobrenome = ?, cpf = ?, data_nascimento = ?, sexo = ?,
        telefone = ?, email = ?, cep = ?, rua = ?, numero = ?, bairro = ?, cidade = ?, uf = ?,
        cargo = ?, data_admissao = ?, 
        senha = COALESCE(?, senha), nivel_acesso = ?, turno = ?, status = ?, 
        residentes_sob_cuidados = ?, descricao = ?
      WHERE id = ?
    `

    const valores = [
      dados.primeiro_nome,
      dados.sobrenome,
      dados.cpf,
      dados.data_nascimento,
      dados.sexo,
      dados.telefone,
      dados.email,
      dados.cep,
      dados.rua,
      dados.numero,
      dados.bairro,
      dados.cidade,
      dados.uf,
      dados.cargo,
      dados.data_admissao,
      senhaAtualizada,
      dados.nivel_acesso,
      dados.turno,
      dados.status,
      dados.residentes_sob_cuidados,
      dados.descricao,
      id
    ]

    connection.query(sql, valores, (err, results) => {
      if (err) {
        console.error('Erro ao atualizar funcionário:', err)
        return res.status(500).json({ error: 'Erro ao atualizar funcionário.' })
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ message: 'Funcionário não encontrado.' })
      }

      res.json({ message: 'Funcionário atualizado com sucesso!' })
    })
  } catch (error) {
    console.error('Erro ao atualizar funcionário:', error)
    res.status(500).json({ error: 'Erro interno no servidor.' })
  }
})

// ==========================================================
// ❌ EXCLUIR FUNCIONÁRIO
// ==========================================================
router.delete('/:id', (req, res) => {
  const { id } = req.params

  const sql = 'DELETE FROM funcionarios WHERE id = ?'

  connection.query(sql, [id], (err, results) => {
    if (err) {
      console.error('Erro ao excluir funcionário:', err)
      return res.status(500).json({ error: 'Erro ao excluir funcionário.' })
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Funcionário não encontrado.' })
    }

    res.json({ message: 'Funcionário excluído com sucesso!' })
  })
})

// ==========================================================
// 🔐 LOGIN DE FUNCIONÁRIO (GERA TOKEN JWT)
// ==========================================================
router.post('/login', (req, res) => {
  const { email, senha } = req.body

  const sql = 'SELECT * FROM funcionarios WHERE email = ?'

  connection.query(sql, [email], async (err, results) => {
    if (err) {
      console.error('Erro ao buscar funcionário:', err)
      return res.status(500).json({ error: 'Erro ao buscar funcionário.' })
    }

    if (results.length === 0) {
      return res.status(401).json({ error: 'E-mail ou senha inválidos.' })
    }

    const funcionario = results[0]
    const senhaValida = await bcrypt.compare(senha, funcionario.senha)

    if (!senhaValida) {
      return res.status(401).json({ error: 'E-mail ou senha inválidos.' })
    }

    const token = jwt.sign(
      { id: funcionario.id, nivel_acesso: funcionario.nivel_acesso },
      SECRET_KEY,
      { expiresIn: '8h' }
    )

    res.json({
      message: 'Login realizado com sucesso!',
      token,
      funcionario: {
        id: funcionario.id,
        nome: funcionario.primeiro_nome,
        nivel_acesso: funcionario.nivel_acesso
      }
    })
  })
})

export default router
