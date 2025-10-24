import mysql from 'mysql2'
import dotenv from 'dotenv'

dotenv.config()

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
})

connection.connect((err) => {
  if (err) {
    console.error('❌ Erro ao conectar ao MySQL:', err)
  } else {
    console.log('✅ Conectado ao MySQL com sucesso!')
  }
})

export default connection
