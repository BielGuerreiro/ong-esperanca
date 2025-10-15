import express from 'express'
import cors from 'cors'
import connection from './config/database.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

import criancasRoutes from './routes/criancas_route.js'
import responsaveisRoutes from './routes/responsaveis_route.js'
import relatoriosRoutes from './routes/relatorios_route.js'
import usuariosRoutes from './routes/usuarios_route.js'

const app = express()

// Middlewares
app.use(cors())
app.use(express.json())

// Rota principal
app.get('/', (req, res) => {
  res.json({ 
    message: ' API do Sistema de Gestão - Funcionando!',
    version: '1.0.0',
    endpoints: {
      responsaveis: '/responsaveis',
      criancas: '/criancas',
      relatorios: '/relatorio',
      usuarios: '/usuarios'
    }
  })
})

// Registrar todas as rotas
app.use('/criancas', criancasRoutes)
app.use('/responsaveis', responsaveisRoutes)
app.use('/relatorio', relatoriosRoutes)
app.use('/usuarios', usuariosRoutes)

// Tratamento de rota não encontrada
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Rota não encontrada',
    path: req.path 
  })
})

// Iniciar servidor
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`)
  console.log(`📊 Acesse: http://localhost:${PORT}`)
  console.log(`📚 Documentação: http://localhost:${PORT}/`)
})