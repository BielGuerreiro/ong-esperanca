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

    // icones editar e lixeira _______________________________________________________________________
    tr.innerHTML = `
        <td>${nomeCompleto}</td>
        <td>${idade}</td>
        <td>${categoria}</td>
        <td class="acoes">
            <a href="/cadastro-residente/index.html?id=${residente.id}" class="btn-acao-icone btn-editar" title="Editar Ficha">
                <i class="bx bxs-pencil"></i>
            </a>
            <a href="#" class="btn-acao-icone btn-excluir" title="Excluir Ficha">
                <i class="bx bx-trash-alt"></i>
            </a>
        </td>
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

// sessao de funcionario __________________________________________________________________________________________________
document.addEventListener("DOMContentLoaded", function () {
  iniciarPaginaFuncionarios();
});

function iniciarPaginaFuncionarios() {
  // Carrega a lista de funcionários salvos na sessão
  const listaFuncionarios = JSON.parse(
    sessionStorage.getItem("listaFuncionarios") || "[]"
  );
  const tabelaBody = document.getElementById("lista-funcionarios-body");

  function adicionarFuncionarioNaTabela(funcionario) {
    const tr = document.createElement("tr");
    const nomeCompleto = `${funcionario["primeiro-nome"]} ${funcionario.sobrenome}`;

    // Lógica para o Status (no futuro será automático)
    // Por enquanto, podemos definir um status padrão ou ler um campo 'status' se existir.
    const status = funcionario.status || "Pendente";
    const classeStatus = `status-${status.toLowerCase()}`;

    tr.innerHTML = `
            <td>${
              funcionario.horario || "08:00 - 17:00"
            }</td> <td>${nomeCompleto}</td>
            <td>${funcionario.id
              .toString()
              .slice(
                -4
              )}</td> <td><span class="status ${classeStatus}">${status}</span></td>
            <td class="acoes">
                <a href="/cadastro-funcionario/index.html?id=${
                  funcionario.id
                }" class="btn-acao-icone btn-editar" title="Editar Ficha"><i class='bx bxs-edit-alt'></i></a>
                <a href="#" class="btn-acao-icone btn-excluir" title="Excluir Ficha"><i class='bx bxs-trash'></i></a>
            </td>
        `;
    tabelaBody.appendChild(tr);
  }

  // Lógica principal para popular a tabela
  if (tabelaBody) {
    tabelaBody.innerHTML = ""; // Garante que a tabela esteja limpa

    if (listaFuncionarios.length > 0) {
      // Se houver funcionários, adiciona cada um na tabela
      listaFuncionarios.forEach((f) => adicionarFuncionarioNaTabela(f));
    } else {
      // Se NÃO houver, mostra uma mensagem amigável
      const tr = document.createElement("tr");
      tr.innerHTML = `<td colspan="5" style="text-align: center;">Nenhum funcionário cadastrado.</td>`;
      tabelaBody.appendChild(tr);
    }
  }
}
