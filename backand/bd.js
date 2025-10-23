function conectarBancoDeDados() {
  console.log("Tentando conectar ao banco de dados...");

  setTimeout(() => {
    console.log(
      "✅ Conexão com o banco de dados (simulada) estabelecida com sucesso!"
    );
  }, 1000);
}
module.exports = {
  conectarBancoDeDados,
};
