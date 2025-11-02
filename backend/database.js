const mysql = require("mysql2/promise");

let db;

console.log("Tentando configurar a conexão com o banco de dados...");

console.log(`Variável DATABASE_URL encontrada: ${!!process.env.DATABASE_URL}`);

if (process.env.DATABASE_URL) {
  console.log("Conectando ao banco de dados de produção (Railway)...");
  db = mysql.createPool(process.env.DATABASE_URL);
} else {
  console.log("Conectando ao banco de dados local...");
  db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "2526",
    database: "ong_esperanca",
    port: 3306,
  });
}

db.getConnection()
  .then((connection) => {
    console.log("✅ Conexão com o banco de dados estabelecida com sucesso!");
    connection.release();
  })
  .catch((err) => {
    console.error("❌ Erro ao conectar com o banco de dados:", err.message);
  });

module.exports = db;
