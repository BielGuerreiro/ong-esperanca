document.addEventListener("DOMContentLoaded", function () {
  console.log("Script da página principal carregado com sucesso!");

  // Carrega a lista de residentes salvos na sessão
  const listaResidentes = JSON.parse(
    sessionStorage.getItem("listaResidentes") || "[]"
  );
  const tabelaBody = document.getElementById("lista-residentes-body");

  // NOVO: Seleciona o elemento h3 do contador pelo novo ID
  const contadorResidentesEl = document.getElementById("contador-residentes");

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

  // NOVO: Atualiza o contador com o número total de linhas na tabela
  // (Isso conta o residente de exemplo + os que foram cadastrados)
  const totalResidentes = tabelaBody.getElementsByTagName("tr").length;
  contadorResidentesEl.textContent = totalResidentes;
});
