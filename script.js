document.addEventListener("DOMContentLoaded", function () {
  // Carrega a lista de residentes salvos na sessão
  const listaResidentes = JSON.parse(
    sessionStorage.getItem("listaResidentes") || "[]"
  );
  const tabelaBody = document.getElementById("lista-residentes-body");

  function calcularIdade(dataNascimento) {
    if (!dataNascimento) return "?";
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const m = hoje.getMonth() - nascimento.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return idade;
  }

  function definirCategoria(idade) {
    if (idade <= 12) return "Criança";
    if (idade <= 17) return "Adolescente";
    if (idade <= 59) return "Adulto";
    return "Idoso";
  }

  // Função que cria e adiciona uma nova linha na tabela
  function adicionarResidenteNaTabela(residente) {
    const tr = document.createElement("tr");
    const idade = calcularIdade(residente.nascimento);
    const categoria = definirCategoria(idade);
    const nomeCompleto = `${residente["primeiro-nome"]} ${residente.sobrenome}`;

    tr.innerHTML = `
            <td>${nomeCompleto}</td>
            <td>${idade}</td>
            <td>${categoria}</td>
            <td><a href="/cadastro-residente/index.html?id=${residente.id}" class="acao-ver-ficha">Ver ficha</a></td>
        `;
    tabelaBody.appendChild(tr);
  }

  // Adiciona cada residente salvo na tabela
  if (listaResidentes.length > 0) {
    listaResidentes.forEach((residente) => {
      adicionarResidenteNaTabela(residente);
    });
  }
});
