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

// tabela dashboard ______________________________________________________________________________________________________________
let graficoAtividades = null;
let graficoMedicamentos = null;

function iniciarPaginaDashboard() {
  const listaResidentes = JSON.parse(
    sessionStorage.getItem("listaResidentes") || "[]"
  );
  const listaTratamentos = JSON.parse(
    sessionStorage.getItem("listaTratamentos") || "[]"
  );
  const listaAtividades = JSON.parse(
    sessionStorage.getItem("listaAgendamentosAtividade") || "[]"
  );

  const contadorResidentesEl = document.getElementById("contador-residentes");
  const contadorMedicamentosEl = document.getElementById(
    "contador-medicamentos-pendentes"
  );
  const contadorAtividadesEl = document.getElementById(
    "contador-atividades-hoje"
  );
  const listaResidentesDashboard = document.getElementById(
    "residentes-chart-list"
  );
  const graficoContainer = document.querySelector(".grafico-dashboard");

  if (contadorResidentesEl) {
    contadorResidentesEl.textContent = listaResidentes.length;
  }
  if (contadorMedicamentosEl) {
    const pendentes = listaTratamentos.filter(
      (t) => t.status === "Pendente"
    ).length;
    contadorMedicamentosEl.textContent = pendentes;
  }
  if (contadorAtividadesEl) {
    const hoje = new Date().toISOString().split("T")[0];
    const deHoje = listaAtividades.filter(
      (a) => a.data === hoje && a.status === "Agendada"
    ).length;
    contadorAtividadesEl.textContent = deHoje;
  }

  if (listaResidentesDashboard) {
    listaResidentesDashboard.innerHTML = "";
    listaResidentes.forEach((residente) => {
      const li = document.createElement("li");
      li.textContent = `${residente["primeiro-nome"]} ${residente.sobrenome}`;
      li.dataset.id = residente.id;
      listaResidentesDashboard.appendChild(li);
    });
  }

  if (listaResidentesDashboard && graficoContainer) {
    listaResidentesDashboard.addEventListener("click", function (event) {
      if (event.target && event.target.nodeName === "LI") {
        const liClicado = event.target;
        const residenteId = liClicado.dataset.id;

        listaResidentesDashboard
          .querySelectorAll("li")
          .forEach((item) => item.classList.remove("ativo"));
        liClicado.classList.add("ativo");

        if (graficoAtividades) {
          graficoAtividades.destroy();
        }
        if (graficoMedicamentos) {
          graficoMedicamentos.destroy();
        }

        graficoContainer.innerHTML = `
          <div class="chart-wrapper">
            <h2>Frequência em Atividades (últimos 6 meses)</h2>
            <canvas id="grafico-atividades-residente"></canvas>
          </div>
          <div class="chart-wrapper">
            <h2>Status dos Medicamentos de Hoje</h2>
            <canvas id="grafico-medicamentos-residente"></canvas>
          </div>
        `;

        const ctxAtividades = document
          .getElementById("grafico-atividades-residente")
          .getContext("2d");
        const dadosFicticios = Array.from({ length: 6 }, () =>
          Math.floor(Math.random() * 15)
        );

        graficoAtividades = new Chart(ctxAtividades, {
          type: "bar",
          data: {
            labels: ["Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro"],
            datasets: [
              {
                label: "Nº de Atividades",
                data: dadosFicticios,
                backgroundColor: "rgba(111, 169, 228, 0.6)",
                borderColor: "rgba(111, 169, 228, 1)",
                borderWidth: 1,
              },
            ],
          },
          options: { responsive: true, maintainAspectRatio: false },
        });

        const ctxMedicamentos = document
          .getElementById("grafico-medicamentos-residente")
          .getContext("2d");
        const tratamentosDoResidente = listaTratamentos.filter(
          (t) => t.residenteId == residenteId
        );
        const administrados = tratamentosDoResidente.filter(
          (t) => t.status !== "Pendente"
        ).length;
        const pendentes = tratamentosDoResidente.length - administrados;

        graficoMedicamentos = new Chart(ctxMedicamentos, {
          type: "doughnut",
          data: {
            labels: ["Administrados", "Pendentes"],
            datasets: [
              {
                label: "Status de Medicamentos",
                data: [administrados, pendentes],
                backgroundColor: [
                  "rgba(40, 167, 69, 0.7)",
                  "rgba(255, 193, 7, 0.7)",
                ],
                borderColor: ["rgba(40, 167, 69, 1)", "rgba(255, 193, 7, 1)"],
                borderWidth: 1,
              },
            ],
          },
          options: { responsive: true, maintainAspectRatio: false },
        });
      }
    });
  }
}

// tabela residentes ______________________________________________________________________________________________________________
function iniciarPaginaResidentes() {
  const listaResidentes = JSON.parse(
    sessionStorage.getItem("listaResidentes") || "[]"
  );
  const tabelaBody = document.getElementById("lista-residentes-body");

  function adicionarResidenteNaTabela(residente) {
    const tr = document.createElement("tr");
    const idade = calcularIdade(residente.nascimento);
    const categoria = definirCategoria(idade);
    const nomeCompleto = `${residente["primeiro-nome"]} ${residente.sobrenome}`;
    const sexoFormatado = residente.sexo
      ? residente.sexo.charAt(0).toUpperCase() + residente.sexo.slice(1)
      : "N/A";

    tr.innerHTML = `
        <td>${nomeCompleto}</td>
        <td>${idade}</td>
        <td>${sexoFormatado}</td>
        <td>${categoria}</td>
        <td class="acoes">
            <a href="cadastros/cadastro-residente/index.html?id=${residente.id}&origem=pagina-residentes" class="btn-acao-icone btn-editar" title="Editar Ficha"><i class='bx bxs-pencil'></i></a>
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
      tr.innerHTML = `<td colspan="5" style="text-align: center;">Nenhum residente cadastrado.</td>`;
      tabelaBody.appendChild(tr);
    }

    tabelaBody.addEventListener("click", function (event) {
      const botaoExcluir = event.target.closest(".btn-excluir");
      if (botaoExcluir) {
        event.preventDefault();
        const idParaExcluir = botaoExcluir.dataset.id;
        const nomeDoResidente = botaoExcluir
          .closest("tr")
          .querySelector("td").textContent;
        if (
          confirm(
            `Tem certeza que deseja excluir o residente "${nomeDoResidente}"?`
          )
        ) {
          const novaLista = JSON.parse(
            sessionStorage.getItem("listaResidentes") || "[]"
          ).filter((residente) => residente.id != idParaExcluir);
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
            <a href="cadastros/cadastro-funcionario/index.html?id=${
              funcionario.id
            }&origem=pagina-funcionarios" class="btn-acao-icone btn-editar" title="Editar Ficha"><i class='bx bxs-pencil'></i></a>
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

    // --- CORREÇÃO APLICADA AQUI no href ---
    tr.innerHTML = `
        <td>${nomeCompleto}</td>
        <td>${idade}</td>
        <td>${categoria}</td>
        <td>${responsavel.parentesco}</td>
        <td>${nomeResidente}</td>
        <td class="acoes">
            <a href="cadastros/cadastro-responsavel/index.html?id=${responsavel.id}&origem=pagina-responsavel" class="btn-acao-icone btn-editar" title="Editar Ficha"><i class='bx bxs-pencil'></i></a>
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
    const classeStatus = `status-${tratamento.status
      .toLowerCase()
      .replace(" ", "-")}`;

    // A coluna de ações agora contém apenas os ícones de Editar e Excluir
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
            <a href="cadastros/cadastro-medicamento/index.html?id=${
              tratamento.id
            }&origem=pagina-medicamentos" class="btn-acao-icone btn-editar" title="Editar Agendamento"><i class='bx bxs-pencil'></i></a>
            <a href="#" class="btn-acao-icone btn-excluir" data-id="${
              tratamento.id
            }" title="Excluir Agendamento"><i class='bx bx-trash-alt'></i></a>
        </td>
      `;
    tabelaBody.appendChild(tr);
  }

  if (tabelaBody) {
    tabelaBody.innerHTML = "";
    if (listaTratamentos.length > 0) {
      listaTratamentos.forEach((t) => adicionarTratamentoNaTabela(t));
    } else {
      tabelaBody.innerHTML = `<tr><td colspan="7" style="text-align:center;">Nenhum tratamento agendado.</td></tr>`;
    }

    tabelaBody.addEventListener("click", function (event) {
      // A lógica de registrar dose foi removida

      const botaoExcluir = event.target.closest(".btn-excluir");
      if (botaoExcluir) {
        event.preventDefault();
        const idParaExcluir = botaoExcluir.dataset.id;
        const nomeDoMedicamento = botaoExcluir
          .closest("tr")
          .querySelectorAll("td")[2].textContent;

        if (
          confirm(
            `Tem certeza que deseja excluir o agendamento do medicamento "${nomeDoMedicamento}"?`
          )
        ) {
          const tratamentosAtuais = JSON.parse(
            sessionStorage.getItem("listaTratamentos") || "[]"
          );
          const novaLista = tratamentosAtuais.filter(
            (t) => t.id != idParaExcluir
          );
          sessionStorage.setItem("listaTratamentos", JSON.stringify(novaLista));

          alert("Agendamento excluído com sucesso!");
          window.location.reload();
        }
      }
    });
  }
}

// sessao atividades  -_____________________________________________________________________________________________________
function iniciarPaginaAtividades() {
  const tabelaBody = document.getElementById("lista-atividades-body");

  function renderizarTabela() {
    let listaAgendamentos = JSON.parse(
      sessionStorage.getItem("listaAgendamentosAtividade") || "[]"
    );

    if (!tabelaBody) return;

    tabelaBody.innerHTML = "";

    if (listaAgendamentos.length > 0) {
      listaAgendamentos.forEach((agendamento) => {
        const tr = document.createElement("tr");
        const status = agendamento.status || "Agendada";
        const classeStatus = `status-${status.toLowerCase()}`;

        const dataFormatada = new Date(
          agendamento.data + "T00:00:00"
        ).toLocaleDateString("pt-BR");

        tr.innerHTML = `
            <td>${dataFormatada}</td>
            <td>${agendamento.horario}</td>
            <td>${agendamento["nome-atividade"]}</td>
            <td>${agendamento.duracao || "N/A"}</td>
            <td><span class="status ${classeStatus}">${status}</span></td>
            <td class="acoes">
                <a href="cadastros/cadastro-atividade/index.html?id=${
                  agendamento.id
                }&origem=pagina-atividades" class="btn-acao-icone btn-editar" title="Editar Atividade"><i class='bx bxs-pencil'></i></a>
                <a href="#" class="btn-acao-icone btn-excluir" data-id="${
                  agendamento.id
                }" title="Excluir Atividade"><i class='bx bx-trash-alt'></i></a>
            </td>
        `;
        tabelaBody.appendChild(tr);
      });
    } else {
      tabelaBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">Nenhuma atividade agendada.</td></tr>`;
    }
  }

  if (tabelaBody) {
    renderizarTabela();

    tabelaBody.addEventListener("click", function (event) {
      const botaoExcluir = event.target.closest(".btn-excluir");

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
          renderizarTabela();
        }
      }
    });
  }
}

// sessao relatorio   -_____________________________________________________________________________________________________
function iniciarPaginaRelatorios() {
  const tabelaBody = document.getElementById("lista-relatorios-body");
  if (!tabelaBody) return;

  const listaRelatorios = JSON.parse(
    sessionStorage.getItem("listaRelatoriosDiarios") || "[]"
  );
  const listaResidentes = JSON.parse(
    sessionStorage.getItem("listaResidentes") || "[]"
  );

  tabelaBody.innerHTML = "";

  if (listaRelatorios.length === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="6" style="text-align: center;">Nenhum relatório cadastrado.</td>`;
    tabelaBody.appendChild(tr);
    return;
  }

  listaRelatorios
    .slice()
    .reverse()
    .forEach((relatorio) => {
      const tr = document.createElement("tr");

      const residente = listaResidentes.find(
        (r) => r.id == relatorio.residenteId
      );
      const nomeResidente = residente
        ? `${residente["primeiro-nome"]} ${residente.sobrenome}`
        : "Residente não encontrado";

      const dataFormatada = new Date(
        relatorio.data + "T00:00:00"
      ).toLocaleDateString("pt-BR");

      const nomeMedicamento = relatorio.medicamento || "Nenhum";

      let statusHtml = relatorio.statusMedicacao || "N/A";
      let classeStatus = "";
      if (relatorio.statusMedicacao === "Medicado") {
        classeStatus = "status-administrado";
      } else if (relatorio.statusMedicacao === "Não Medicado") {
        classeStatus = "status-nao-tomado";
      }
      if (classeStatus) {
        statusHtml = `<span class="status ${classeStatus}">${relatorio.statusMedicacao}</span>`;
      }

      tr.innerHTML = `
        <td>${dataFormatada}</td>
        <td>${nomeResidente}</td>
        <td>${nomeMedicamento}</td>
        <td>${relatorio.responsavelNome}</td>
        <td>${statusHtml}</td>
        <td class="acoes">
            <a href="cadastros/cadastro-relatorio/index.html?id=${relatorio.id}&origem=pagina-relatorios" class="btn-acao-icone btn-editar" title="Editar Relatório"><i class='bx bxs-pencil'></i></a>
            <a href="#" class="btn-acao-icone btn-excluir" data-id="${relatorio.id}" title="Excluir Relatório"><i class='bx bx-trash-alt'></i></a>
        </td>
      `;

      tabelaBody.appendChild(tr);
    });

  tabelaBody.addEventListener("click", function (event) {
    const botaoExcluir = event.target.closest(".btn-excluir");
    if (botaoExcluir) {
      event.preventDefault();
      const idParaExcluir = botaoExcluir.dataset.id;

      if (
        confirm(
          "Tem certeza que deseja excluir este relatório? A ação não pode ser desfeita."
        )
      ) {
        let relatoriosAtuais = JSON.parse(
          sessionStorage.getItem("listaRelatoriosDiarios") || "[]"
        );
        const novaLista = relatoriosAtuais.filter((r) => r.id != idParaExcluir);
        sessionStorage.setItem(
          "listaRelatoriosDiarios",
          JSON.stringify(novaLista)
        );
        iniciarPaginaRelatorios();
      }
    }
  });
}

// sessao adm  -_____________________________________________________________________________________________________
function iniciarPaginaAdm() {
  const botaoLogout = document.getElementById("btn-logout");

  if (botaoLogout) {
    botaoLogout.addEventListener("click", function (event) {
      event.preventDefault(); // Impede o comportamento padrão do link

      if (confirm("Tem certeza que deseja sair da sua conta?")) {
        // Limpa todos os dados salvos na sessão
        sessionStorage.clear();

        // Redireciona para a página de login
        alert("Você foi desconectado com sucesso.");
        // ATENÇÃO: Coloque aqui o nome correto da sua página de login
        window.location.href = "login.html";
      }
    });
  }
}

// document da pagina principal ___________________________________________________________________________________
document.addEventListener("DOMContentLoaded", function () {
  const containerGeral = document.querySelector(".container-geral");
  const menuItens = document.querySelectorAll(".menu-header li");
  let isAnimating = false;

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
  iniciarPaginaDashboard();
  iniciarPaginaResidentes();
  iniciarPaginaFuncionarios();
  iniciarPaginaResponsaveis();
  iniciarPaginaMedicamentos();
  iniciarPaginaAtividades();
  iniciarPaginaRelatorios();
  iniciarPaginaAdm();

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
