import express from 'express'
import connection from '../config/database.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const router = express.Router()

// CRUD USUARIOS //

const SECRET_KEY = process.env.JWT_SECRET || 'anakin_skywalker_secret'

// Rota de login  -------ainda com problemas
router.post('/login', (req, res) => {
  const { email, senha } = req.body

  if (!email || !senha) {
    return res.status(400).send('Informe o email e a senha.')
  }

  const sql = 'SELECT * FROM usuarios WHERE email = ?'

  connection.query(sql, [email], async (err, results) => {
    if (err) {
      console.error(err)
      return res.status(500).send('Erro ao buscar usuário.')
    }

    if (results.length === 0) {
      return res.status(404).send('Usuário não encontrado.')
    }

    const usuario = results[0]
    const senhaValida = await bcrypt.compare(senha, usuario.senha)

    if (!senhaValida) {
      return res.status(401).send('Senha incorreta.')
    }

    // Cria token JWT
    const token = jwt.sign(
      { id: usuario.id, nivel_acesso: usuario.nivel_acesso },
      SECRET_KEY,
      { expiresIn: '8h' }
    )

    res.json({
      mensagem: 'Login bem-sucedido',
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        nivel_acesso: usuario.nivel_acesso
      }
    })
  })
})

// Lista todos os usuários --check
router.get('/', (req, res) => {
  const sql = 'SELECT * FROM usuarios'
  connection.query(sql, (err, results) => {
    if (err) {
      console.error(err)
      return res.status(500).send('Erro ao buscar usuários')
    }
    res.json(results)
  })
})

// Busca um usuário pelo ID -- check
router.get('/:id', (req, res) => {
  const { id } = req.params
  const sql = 'SELECT * FROM usuarios WHERE id = ?'
  connection.query(sql, [id], (err, results) => {
    if (err) {
      console.error(err)
      return res.status(500).send('Erro ao buscar usuário')
    }
    if (results.length === 0) return res.status(404).send('Usuário não encontrado')
    res.json(results[0])
  })
})

// Cadastra novo usuário com senha criptografada -- check
router.post('/', async (req, res) => {
  try {
    let { nome, email, senha, cargo, nivel_acesso } = req.body

    if (!nome || !email || !senha || !cargo) {
      return res.status(400).send('Preencha todos os campos obrigatórios.')
    }

    // Se o nivel_acesso não for informado, define automaticamente
    if (!nivel_acesso) {
      // Regra de preenchimento
      let cargoLower = cargo.toLowerCase()
      if (cargoLower.includes('diretor')) {
        nivel_acesso = 'diretor'
      } else if (cargoLower.includes('coordenador')) {
        nivel_acesso = 'coordenador'
      } else {
        nivel_acesso = 'funcionario'
      }
    }

    // Gera um hash seguro da senha -- check
    const hashedSenha = await bcrypt.hash(senha, 10)

    const sql = 'INSERT INTO usuarios (nome, email, senha, cargo, nivel_acesso) VALUES (?, ?, ?, ?, ?)'
    connection.query(sql, [nome, email, hashedSenha, cargo, nivel_acesso], (err) => {
      if (err) {
        console.error(err)
        return res.status(500).send('Erro ao cadastrar usuário.')
      }
      res.status(201).send('Usuário cadastrado com sucesso!')
    })
  } catch (error) {
    console.error(error)
    res.status(500).send('Erro interno no servidor.')
  }
})

// Rota de teste para verificar criptografia -- check
router.get('/teste-criptografia/:senha', async (req, res) => {
  const { senha } = req.params

  // Gera o hash da senha enviada
  const hash = await bcrypt.hash(senha, 10)

  res.json({
    senha_original: senha,
    senha_criptografada: hash
  })
})


// Atualizar usuário existente -- check
router.put('/:id', async (req, res) => {
  const { id } = req.params
  const { nome, email, senha, cargo, nivel_acesso } = req.body

  try {
    // Se o usuário enviou uma nova senha, criptografa antes de salvar -- check
    let hashedSenha = null
    if (senha) {
      hashedSenha = await bcrypt.hash(senha, 10)
    }

    // Se a senha for enviada, atualiza com a senha criptografada
    // Caso contrário, mantém a senha antiga
    const sql = ` UPDATE usuarios  SET  nome = ?,  email = ?,  senha = COALESCE(?, senha),  cargo = ?,  nivel_acesso = ? WHERE id = ?
    `

    connection.query( sql, [nome, email, hashedSenha, cargo, nivel_acesso, id],  (err, results) => {
        if (err) {
          console.error('Erro ao atualizar usuário:', err)
          return res.status(500).send('Erro ao atualizar usuário')
        }

        if (results.affectedRows === 0) {
          return res.status(404).send('Usuário não encontrado')
        }

        res.send('Usuário atualizado com sucesso!')
      }
    )
  } catch (error) {
    console.error('Erro interno no servidor:', error)
    res.status(500).send('Erro interno no servidor')
  }
})


// Excluir usuário  -- check
router.delete('/:id', (req, res) => {
  const { id } = req.params
  const { id_logado } = req.body

  connection.query('SELECT nivel_acesso FROM usuarios WHERE id = ?', [id_logado], (err, results) => {
    if (err) return res.status(500).send('Erro ao verificar permissão')
    if (results.length === 0) return res.status(404).send('Usuário não encontrado')

    const nivel = results[0].nivel_acesso

    if (nivel !== 'diretor') {
      return res.status(403).send('Acesso negado! Somente diretores podem excluir usuários.')
    }

    connection.query('DELETE FROM usuarios WHERE id = ?', [id], (err2) => {
      if (err2) return res.status(500).send('Erro ao excluir usuário')
      res.send('Usuário excluído com sucesso!')
    })
  })
})

export default router