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

// tabela residentes ______________________________________________________________________________________________________________

function iniciarPaginaResidentes() {
  const listaResidentes = JSON.parse(
    sessionStorage.getItem("listaResidentes") || "[]"
  );
  const tabelaBody = document.getElementById("lista-residentes-body");
  const contadorResidentesEl = document.getElementById("contador-residentes");

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
            <a href="cadastro/cadastro-residente/index.html?id=${residente.id}&origem=pagina-residentes" class="btn-acao-icone btn-editar" title="Editar Ficha"><i class="bx bx-edit"></i></a>
            <a href="#" class="btn-acao-icone btn-excluir" data-id="${residente.id}" title="Excluir Ficha"><i class="bx bx-trash-alt"></i></a>
        </td>
    `;
    tabelaBody.appendChild(tr);
  }

  if (tabelaBody) {
    tabelaBody.innerHTML = "";
    if (listaResidentes.length > 0) {
      listaResidentes.forEach((residente) =>
        adicionarResidenteNaTabela(residente)
      );
    } else {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td colspan="4" style="text-align: center;">Nenhum residente cadastrado.</td>`;
      tabelaBody.appendChild(tr);
    }
    if (contadorResidentesEl) {
      contadorResidentesEl.textContent = listaResidentes.length;
    }
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
            `Tem certeza que deseja excluir o residente "${nomeDoResidente}"?`
          )
        ) {
          const novaLista = residentesAtuais.filter(
            (residente) => residente.id != idParaExcluir
          );
          sessionStorage.setItem("listaResidentes", JSON.stringify(novaLista));
          alert("Residente excluído com sucesso!");
          window.location.reload();
        }
      }
    });
  }
}

// tabela funcionario ______________________________________________________________________________________________________________
function iniciarPaginaFuncionarios() {
  const listaFuncionarios = JSON.parse(
    sessionStorage.getItem("listaFuncionarios") || "[]"
  );
  const tabelaBody = document.getElementById("lista-funcionarios-body");

  function adicionarFuncionarioNaTabela(funcionario) {
    const tr = document.createElement("tr");
    const nomeCompleto = `${funcionario["primeiro-nome"]} ${funcionario.sobrenome}`;
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
            <a href="cadastro/cadastro-funcionario/index.html?id=${
              funcionario.id
            }&origem=pagina-funcionarios" class="btn-acao-icone btn-editar" title="Editar Ficha"><i class='bx bxs-edit-alt'></i></a>
            <a href="#" class="btn-acao-icone btn-excluir" data-id="${
              funcionario.id
            }" title="Excluir Ficha"><i class='bx bxs-trash'></i></a>
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
        const nomeDoFuncionario = botaoExcluir
          .closest("tr")
          .querySelectorAll("td")[1].textContent;
        if (
          confirm(
            `Tem certeza que deseja excluir o funcionário "${nomeDoFuncionario}"?`
          )
        ) {
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
          alert("Funcionário excluído com sucesso!");
          window.location.reload();
        }
      }
    });
  }
}

// tabela responsavel  ______________________________________________________________________________________________________________

function iniciarPaginaResponsaveis() {
  const listaResponsaveis = JSON.parse(
    sessionStorage.getItem("listaResponsaveis") || "[]"
  );
  const listaResidentes = JSON.parse(
    sessionStorage.getItem("listaResidentes") || "[]"
  );
  const tabelaBody = document.getElementById("lista-responsaveis-body");

  function adicionarResponsavelNaTabela(responsavel) {
    const tr = document.createElement("tr");

    const residenteVinculado = listaResidentes.find(
      (r) => r.id == responsavel.residenteId
    );
    const nomeResidente = residenteVinculado
      ? `${residenteVinculado["primeiro-nome"]} ${residenteVinculado.sobrenome}`
      : "Não encontrado";

    const idade = calcularIdade(responsavel.nascimento);
    const categoria = definirCategoria(idade);
    const nomeCompleto = `${responsavel["primeiro-nome"]} ${responsavel.sobrenome}`;

    tr.innerHTML = `
        <td>${nomeCompleto}</td>
        <td>${idade}</td>
        <td>${categoria}</td>
        <td>${responsavel.parentesco}</td>
        <td>${nomeResidente}</td>
        <td class="acoes">
            <a href="cadastro/cadastro-responsavel/index.html?id=${responsavel.id}&origem=pagina-responsavel" class="btn-acao-icone btn-editar" title="Editar Ficha"><i class='bx bx-edit'></i></a>
            <a href="#" class="btn-acao-icone btn-excluir" data-id="${responsavel.id}" title="Excluir Ficha"><i class='bx bx-trash-alt'></i></a>
        </td>
    `;
    tabelaBody.appendChild(tr);
  }

  if (tabelaBody) {
    tabelaBody.innerHTML = "";
    if (listaResponsaveis.length > 0) {
      listaResponsaveis.forEach((r) => adicionarResponsavelNaTabela(r));
    } else {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td colspan="6" style="text-align:center;">Nenhum responsável cadastrado.</td></tr>`;
      tabelaBody.appendChild(tr);
    }

    // Lógica de exclusão
    tabelaBody.addEventListener("click", function (event) {
      const botaoExcluir = event.target.closest(".btn-excluir");
      if (botaoExcluir) {
        event.preventDefault();
        const idParaExcluir = botaoExcluir.dataset.id;
        const nomeDoResponsavel = botaoExcluir
          .closest("tr")
          .querySelectorAll("td")[0].textContent;

        if (
          confirm(
            `Tem certeza que deseja excluir o responsável "${nomeDoResponsavel}"?`
          )
        ) {
          const responsaveisAtuais = JSON.parse(
            sessionStorage.getItem("listaResponsaveis") || "[]"
          );
          const novaLista = responsaveisAtuais.filter(
            (resp) => resp.id != idParaExcluir
          );
          sessionStorage.setItem(
            "listaResponsaveis",
            JSON.stringify(novaLista)
          );
          alert("Responsável excluído com sucesso!");
          window.location.reload();
        }
      }
    });
  }
}

// sessao medicamento -_____________________________________________________________________________________________________
function iniciarPaginaMedicamentos() {
  const listaResidentes = JSON.parse(
    sessionStorage.getItem("listaResidentes") || "[]"
  );
  const listaTratamentos = JSON.parse(
    sessionStorage.getItem("listaTratamentos") || "[]"
  );
  const tabelaBody = document.getElementById("lista-medicamentos-body");

  function adicionarTratamentoNaTabela(tratamento) {
    const tr = document.createElement("tr");
    const residente = listaResidentes.find(
      (r) => r.id == tratamento.residenteId
    );
    const nomeResidente = residente
      ? `${residente["primeiro-nome"]} ${residente.sobrenome}`
      : "Não encontrado";
    const classeStatus = `status-${tratamento.status.toLowerCase()}`;

    let acoesHtml = "";
    if (tratamento.status === "Pendente") {
      acoesHtml = `<button class="btn-acao btn-confirmar" data-id="${tratamento.id}">Registrar Dose</button>`;
    } else {
      acoesHtml = `<button class="btn-acao" disabled>${tratamento.status}</button>`;
    }

    // --- CÓDIGO ATUALIZADO ---
    tr.innerHTML = `
            <td>${tratamento.horario}</td>
        <td>${nomeResidente}</td>
        <td>${tratamento.medicamento}</td>
        <td>${tratamento.dosagem}</td>
        <td>${tratamento.tipo || "N/A"}</td>
        <td><span class="status ${classeStatus}">${
      tratamento.status
    }</span></td>
        <td class="acoes">
            <div>
                ${acoesHtml}
                <div class="grupo-icones">
                    <a href="cadastros/cadastro-medicamento/index.html?id=${
                      tratamento.id
                    }&origem=pagina-medicamentos" class="btn-acao-icone btn-editar" title="Editar Agendamento"><i class='bx bx-edit'></i></a>
                    <a href="#" class="btn-acao-icone btn-excluir" data-id="${
                      tratamento.id
                    }" title="Excluir Agendamento"><i class='bx bx-trash-alt'></i></a>
                </div>
            </div>
        </td>
        `;
    tabelaBody.appendChild(tr);
  }
  3;
  if (tabelaBody) {
    tabelaBody.innerHTML = "";
    if (listaTratamentos.length > 0) {
      listaTratamentos.forEach((t) => adicionarTratamentoNaTabela(t));
    } else {
      tabelaBody.innerHTML = `<tr><td colspan="7" style="text-align:center;">Nenhum tratamento agendado.</td></tr>`; // Colspan atualizado para 7
    }

    tabelaBody.addEventListener("click", function (event) {
      const botaoExcluir = event.target.closest(".btn-excluir");
      if (botaoExcluir) {
        event.preventDefault();
        const idParaExcluir = botaoExcluir.dataset.id;
        const nomeDoResponsavel = botaoExcluir
          .closest("tr")
          .querySelectorAll("td")[0].textContent;

        if (
          confirm(
            `Tem certeza que deseja excluir o responsável "${nomeDoResponsavel}"?`
          )
        ) {
          const responsaveisAtuais = JSON.parse(
            sessionStorage.getItem("listaResponsaveis") || "[]"
          );
          const novaLista = responsaveisAtuais.filter(
            (resp) => resp.id != idParaExcluir
          );
          sessionStorage.setItem(
            "listaResponsaveis",
            JSON.stringify(novaLista)
          );
          alert("Responsável excluído com sucesso!");
          window.location.reload();
        }
      }
    });
  }
}

// sessao atividades  -_____________________________________________________________________________________________________
function iniciarPaginaAtividades() {
  const tabelaBody = document.getElementById("lista-atividades-body");

  // A função principal que desenha a tabela inteira na tela
  function renderizarTabela() {
    // Carrega os dados mais recentes do sessionStorage
    let listaAgendamentos = JSON.parse(
      sessionStorage.getItem("listaAgendamentosAtividade") || "[]"
    );

    if (!tabelaBody) return;

    tabelaBody.innerHTML = ""; // Limpa a tabela antes de redesenhar

    if (listaAgendamentos.length > 0) {
      listaAgendamentos.forEach((agendamento) => {
        const tr = document.createElement("tr");
        const status = agendamento.status || "Agendada";
        const classeStatus = `status-${status.toLowerCase()}`;

        let acaoPrincipalHtml = "";
        if (status === "Agendada") {
          acaoPrincipalHtml = `<button class="btn-acao btn-confirmar btn-registrar-presenca" data-id="${agendamento.id}">Registrar Presença</button>`;
        } else {
          acaoPrincipalHtml = `<button class="btn-acao" disabled>${status}</button>`;
        }

        tr.innerHTML = `
                    <td>${agendamento.horario}</td>
                    <td>${agendamento["nome-atividade"]}</td>
                    <td>${agendamento["categoria-atividade"]}</td>
                    <td>${agendamento.local || "N/A"}</td>
                    <td>${agendamento.duracao || "N/A"}</td>
                    <td><span class="status ${classeStatus}">${status}</span></td>
                    <td class="acoes">
                        <div> 
                            ${acaoPrincipalHtml}
                            <div class="grupo-icones">
                                <a href="cadastros/cadastro-atividade/index.html?id=${
                                  agendamento.id
                                }&origem=pagina-atividades" class="btn-acao-icone btn-editar" title="Editar Atividade"><i class='bx bx-edit'></i></a>
                                <a href="#" class="btn-acao-icone btn-excluir" data-id="${
                                  agendamento.id
                                }" title="Excluir Atividade"><i class='bx bx-trash-alt'></i></a>
                            </div>
                        </div>
                    </td>
                `;
        tabelaBody.appendChild(tr);
      });
    } else {
      tabelaBody.innerHTML = `<tr><td colspan="7" style="text-align:center;">Nenhuma atividade agendada.</td></tr>`;
    }
  }

  if (tabelaBody) {
    renderizarTabela(); // Desenha a tabela assim que a página carrega

    // Adiciona a lógica de clique para os botões de ação
    tabelaBody.addEventListener("click", function (event) {
      const botaoRegistrar = event.target.closest(".btn-registrar-presenca");
      const botaoExcluir = event.target.closest(".btn-excluir");

      // --- Lógica para registrar presença ---
      if (botaoRegistrar) {
        const idParaAtualizar = botaoRegistrar.dataset.id;
        let listaAgendamentos = JSON.parse(
          sessionStorage.getItem("listaAgendamentosAtividade") || "[]"
        );
        const agendamento = listaAgendamentos.find(
          (ag) => ag.id == idParaAtualizar
        );

        if (
          agendamento &&
          confirm(
            `Confirmar a realização da atividade "${agendamento["nome-atividade"]}"?`
          )
        ) {
          agendamento.status = "Realizada";
          sessionStorage.setItem(
            "listaAgendamentosAtividade",
            JSON.stringify(listaAgendamentos)
          );
          renderizarTabela(); // Redesenha a tabela para mostrar a mudança instantaneamente
        }
      }

      // --- Lógica completa para excluir ---
      if (botaoExcluir) {
        event.preventDefault();
        const idParaExcluir = botaoExcluir.dataset.id;
        let listaAgendamentos = JSON.parse(
          sessionStorage.getItem("listaAgendamentosAtividade") || "[]"
        );
        const agendamento = listaAgendamentos.find(
          (ag) => ag.id == idParaExcluir
        );

        if (
          agendamento &&
          confirm(
            `Tem certeza que deseja excluir a atividade "${agendamento["nome-atividade"]}"?`
          )
        ) {
          const novaLista = listaAgendamentos.filter(
            (ag) => ag.id != idParaExcluir
          );
          sessionStorage.setItem(
            "listaAgendamentosAtividade",
            JSON.stringify(novaLista)
          );
          renderizarTabela(); // Redesenha a tabela para mostrar a mudança instantaneamente
        }
      }
    });
  }
}

// sessao relatorio   -_____________________________________________________________________________________________________
// ===================================================================
// LÓGICA ESPECÍFICA DA PÁGINA DE RELATÓRIOS (CORRIGIDA)
// ===================================================================
function iniciarPaginaRelatorios() {
  const tabelaBody = document.getElementById("lista-relatorios-body");
  if (!tabelaBody) return;

  const listaRelatorios = JSON.parse(
    sessionStorage.getItem("listaRelatoriosDiarios") || "[]"
  );
  const listaResidentes = JSON.parse(
    sessionStorage.getItem("listaResidentes") || "[]"
  );
  const listaFuncionarios = JSON.parse(
    sessionStorage.getItem("listaFuncionarios") || "[]"
  );

  tabelaBody.innerHTML = "";

  if (listaRelatorios.length === 0) {
    // Colspan atualizado para 5 colunas
    tabelaBody.innerHTML =
      '<tr><td colspan="5" style="text-align:center;">Nenhum relatório diário salvo.</td></tr>';
    return;
  }

  // A função para adicionar cada linha na tabela
  function adicionarRelatorioNaTabela(relatorio) {
    const tr = document.createElement("tr");

    const residente = listaResidentes.find(
      (r) => r.id == relatorio.residenteId
    );
    const funcionario = listaFuncionarios.find(
      (f) => f.id == relatorio.responsavelId
    );
    const nomeResidente = residente
      ? `${residente["primeiro-nome"]} ${residente.sobrenome}`
      : "N/A";
    // No cadastro de relatório, o nome do responsável é um campo de texto
    const nomeResponsavel =
      relatorio.responsavelNome ||
      (funcionario
        ? `${funcionario["primeiro-nome"]} ${funcionario.sobrenome}`
        : "N/A");

    // Pega o status da medicação salvo no relatório
    const statusMedicacao = relatorio.statusMedicacao || "N/A";

    tr.innerHTML = `
            <td>${new Date(
              relatorio.data + "T00:00:00"
            ).toLocaleDateString()}</td>
            <td>${nomeResidente}</td>
            <td>${nomeResponsavel}</td>
            <td>${statusMedicacao}</td>
            <td class="acoes">
                <div>
                    <a href="#" class="btn-acao-icone btn-editar" title="Ver/Editar Relatório"><i class="bx bx-edit"></i></a>
                    <a href="#" class="btn-acao-icone btn-excluir" data-id="${
                      relatorio.id
                    }" title="Excluir Relatório"><i class="bx bx-trash-alt"></i></a>
                </div>
            </td>
        `;
    tabelaBody.appendChild(tr);
  }

  // Mostra os mais novos primeiro
  listaRelatorios.reverse().forEach((relatorio) => {
    adicionarRelatorioNaTabela(relatorio);
  });
}

// ===================================================================
// PONTO DE ENTRADA PRINCIPAL (O ÚNICO DOMContentLoaded)
// ===================================================================
document.addEventListener("DOMContentLoaded", function () {
  const containerGeral = document.querySelector(".container-geral");
  const menuItens = document.querySelectorAll(".menu-header li");
  let isAnimating = false;

  // --- LÓGICA DE NAVEGAÇÃO (A PARTE QUE VOCÊ MANDOU) ---
  function ajustarAlturaContainer(paginaAtiva) {
    if (paginaAtiva && containerGeral) {
      containerGeral.style.height = `${paginaAtiva.scrollHeight + 60}px`;
    }
  }
  menuItens.forEach((item) => {
    item.addEventListener("click", function () {
      if (isAnimating) return;
      const paginaAlvoId = this.dataset.pagina;
      if (!paginaAlvoId) return;
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

  // iniciacao __________________________________________________________________________________________________
  iniciarPaginaResidentes();
  iniciarPaginaFuncionarios();
  iniciarPaginaResponsaveis();
  iniciarPaginaMedicamentos();
  iniciarPaginaAtividades();
  iniciarPaginaRelatorios();

  const urlParams = new URLSearchParams(window.location.search);
  const paginaDestino = urlParams.get("pagina");

  let itemInicial = null;

  if (paginaDestino) {
    itemInicial = document.querySelector(
      `.menu-header li[data-pagina="${paginaDestino}"]`
    );
  }

  if (!itemInicial) {
    itemInicial = menuItens[0];
  }

  if (itemInicial) {
    itemInicial.click();
  } else {
    ajustarAlturaContainer(document.querySelector(".pagina-conteudo.ativa"));
  }

  const paginaInicial = document.querySelector(".pagina-conteudo.ativa");
  ajustarAlturaContainer(paginaInicial);
});
