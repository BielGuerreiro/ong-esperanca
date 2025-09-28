document.addEventListener("DOMContentLoaded", function () {
  const containerGeral = document.querySelector(".container-geral");
  const menuItens = document.querySelectorAll(".menu-header li");
  const paginas = document.querySelectorAll(".pagina-conteudo");

  let isAnimating = false;

  function ajustarAlturaContainer(paginaAtiva) {
    if (paginaAtiva && containerGeral) {
      containerGeral.style.height = `${paginaAtiva.scrollHeight + 60}px`;
    }
  }

  // --- LÓGICA DE NAVEGAÇÃO COM ANIMAÇÃO ---
  menuItens.forEach((item) => {
    item.addEventListener("click", function () {
      if (isAnimating) {
        return;
      }

      const paginaAlvoId = this.dataset.pagina;
      const paginaAlvo = document.getElementById(paginaAlvoId);
      const paginaAtual = document.querySelector(".pagina-conteudo.ativa");

      if (paginaAlvo === paginaAtual) return;

      isAnimating = true;

      menuItens.forEach((i) => i.classList.remove("menu-ativo"));
      this.classList.add("menu-ativo");

      if (paginaAtual) {
        paginaAtual.classList.add("pagina-saindo");
        paginaAtual.addEventListener(
          "animationend",
          () => {
            paginaAtual.classList.remove("ativa", "pagina-saindo");
          },
          { once: true }
        );
      }

      paginaAlvo.classList.add("ativa", "pagina-entrando");
      ajustarAlturaContainer(paginaAlvo);

      paginaAlvo.addEventListener(
        "animationend",
        () => {
          paginaAlvo.classList.remove("pagina-entrando");
          isAnimating = false;
        },
        { once: true }
      );
    });
  });

  // --- LÓGICA INICIAL DA PÁGINA ---
  const paginaInicial = document.querySelector(".pagina-conteudo.ativa");
  ajustarAlturaContainer(paginaInicial);

  // --- LÓGICA DA PÁGINA DE RESIDENTES ---
  const listaResidentes = JSON.parse(
    sessionStorage.getItem("listaResidentes") || "[]"
  );
  const tabelaBody = document.getElementById("lista-residentes-body");
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

  if (tabelaBody) {
    if (listaResidentes.length > 0) {
      listaResidentes.forEach((residente) =>
        adicionarResidenteNaTabela(residente)
      );
    }
    const totalResidentes = tabelaBody.getElementsByTagName("tr").length;
    if (contadorResidentesEl)
      contadorResidentesEl.textContent = totalResidentes;
  }
});
