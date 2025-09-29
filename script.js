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

  const paginaInicial = document.querySelector(".pagina-conteudo.ativa");
  ajustarAlturaContainer(paginaInicial);

  // funcionario ______________________________________________________________________________________________
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
        <td class="acoes">
            <a href="/cadastro-residente/index.html?id=${residente.id}" class="btn-acao-icone btn-editar" title="Editar Ficha">
                <i class='bx bx-pencil' ></i>
            </a>
            <a href="#" class="btn-acao-icone btn-excluir" data-id="${residente.id}" title="Excluir Ficha">
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

    tabelaBody.addEventListener("click", function (event) {
      const botaoExcluir = event.target.closest(".btn-excluir");

      if (botaoExcluir) {
        event.preventDefault();

        const idParaExcluir = botaoExcluir.dataset.id;
        const nomeDoResidente = botaoExcluir
          .closest("tr")
          .querySelector("td").textContent;

        const residentesAtuais = JSON.parse(
          sessionStorage.getItem("listaResidentes") || "[]"
        );

        if (
          confirm(
            `Tem certeza que deseja excluir o residente "${nomeDoResidente}"? Esta ação não pode ser desfeita.`
          )
        ) {
          const novaLista = residentesAtuais.filter(
            (residente) => residente.id != idParaExcluir
          );
          sessionStorage.setItem("listaResidentes", JSON.stringify(novaLista));
        }
      }
    });
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

    // Lógica para definir o horário a partir do turno salvo no cadastro
    function definirHorario(turno) {
      switch (turno) {
        case "manha":
          return "06:00 - 14:00";
        case "tarde":
          return "14:00 - 22:00";
        case "noite":
          return "22:00 - 06:00";
        default:
          return "N/A";
      }
    }
    const horario = definirHorario(funcionario.turno);

    const status = funcionario.status || "Pendente";
    const classeStatus = `status-${status.toLowerCase()}`;

    tr.innerHTML = `
            <td>${horario}</td>
            <td>${nomeCompleto}</td>
            <td>${funcionario.id.toString().slice(-4)}</td>
            <td><span class="status ${classeStatus}">${status}</span></td>
            <td class="acoes">
                <a href="/cadastro-funcionario/index.html?id=${
                  funcionario.id
                }" class="btn-acao-icone btn-editar" title="Editar Ficha">
                    <i class='bx bx-pencil' ></i>
                </a>
                <a href="#" class="btn-acao-icone btn-excluir" data-id="${
                  funcionario.id
                }" title="Excluir Ficha">
                   <i class="bx bx-trash-alt"></i>
                </a>
            </td>
        `;
    tabelaBody.appendChild(tr);
  }

  if (tabelaBody) {
    tabelaBody.innerHTML = "";

    if (listaFuncionarios.length > 0) {
      listaFuncionarios.forEach((f) => adicionarFuncionarioNaTabela(f));
    } else {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td colspan="5" style="text-align: center;">Nenhum funcionário cadastrado.</td>`;
      tabelaBody.appendChild(tr);
    }

    tabelaBody.addEventListener("click", function (event) {
      const botaoExcluir = event.target.closest(".btn-excluir");

      if (botaoExcluir) {
        event.preventDefault();

        const idParaExcluir = botaoExcluir.dataset.id;
        const linhaParaRemover = botaoExcluir.closest("tr");
        const nomeDoFuncionario =
          linhaParaRemover.querySelectorAll("td")[1].textContent;

        if (
          confirm(
            `Tem certeza que deseja excluir o funcionário "${nomeDoFuncionario}"?`
          )
        ) {
          // 1. Remove dos dados salvos
          let funcionariosAtuais = JSON.parse(
            sessionStorage.getItem("listaFuncionarios") || "[]"
          );
          const novaLista = funcionariosAtuais.filter(
            (func) => func.id != idParaExcluir
          );
          sessionStorage.setItem(
            "listaFuncionarios",
            JSON.stringify(novaLista)
          );

          // 2. Remove a linha da tabela na tela (ATUALIZAÇÃO INSTANTÂNEA)
          linhaParaRemover.remove();

          // 3. Verifica se a tabela ficou vazia e adiciona a mensagem
          if (tabelaBody.children.length === 0) {
            const tr = document.createElement("tr");
            tr.innerHTML = `<td colspan="5" style="text-align: center;">Nenhum funcionário cadastrado.</td>`;
            tabelaBody.appendChild(tr);
          }
        }
      }
    });
  }
}
