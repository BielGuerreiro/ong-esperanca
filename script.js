function calcularIdade(dataNascimento) {
  if (!dataNascimento) return "?";
  const hoje = new Date();
  const nascimento = new Date(dataNascimento);
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const m = hoje.getMonth() - nascimento.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
    idade--;
  }
  3;
  return idade;
}

function definirCategoria(idade) {
  if (idade <= 12) return "Criança";
  if (idade <= 17) return "Adolescente";
  if (idade <= 59) return "Adulto";
  return "Idoso";
}

function atualizarSaudacao() {
  const elementoSaudacao = document.getElementById("mensagem-saudacao");
  if (!elementoSaudacao) return;

  const horaAtual = new Date().getHours();
  let saudacao = "";

  if (horaAtual >= 5 && horaAtual < 12) {
    saudacao = "Bom dia";
  } else if (horaAtual >= 12 && horaAtual < 18) {
    saudacao = "Boa tarde";
  } else {
    saudacao = "Boa noite";
  }

  let nomeUsuario = "Visitante";
  const usuarioJSON = localStorage.getItem("usuarioLogado");

  if (usuarioJSON) {
    try {
      const usuario = JSON.parse(usuarioJSON);
      if (usuario && usuario.nome) {
        nomeUsuario = usuario.nome;
      }
    } catch (e) {
      console.error("Erro ao ler dados do usuário para saudação:", e);
    }
  }

  elementoSaudacao.textContent = `Olá, ${saudacao}, ${nomeUsuario}!`;
}

function aplicarControleDeAcesso() {
  const usuarioJSON = localStorage.getItem("usuarioLogado");
  if (!usuarioJSON) return;

  try {
    const usuario = JSON.parse(usuarioJSON);

    if (usuario && usuario.nivel_acesso === "gerente") {
      console.log("Nível de Acesso: Gerente. Aplicando permissões totais.");
      document.body.classList.add("role-gerente");
    } else {
      console.log("Nível de Acesso: Funcionário. Aplicando limitações.");
    }
  } catch (e) {
    console.error("Erro ao ler dados de acesso do usuário:", e);
  }
}

function configurarBusca(
  inputId,
  listaContainerId,
  itemSelector,
  displayStyle = ""
) {
  const inputBusca = document.getElementById(inputId);
  const listaContainer = document.getElementById(listaContainerId);

  if (!inputBusca || !listaContainer) {
    return;
  }

  inputBusca.addEventListener("input", function () {
    const termoBusca = this.value.toLowerCase();
    const todosOsItens = listaContainer.querySelectorAll(itemSelector);

    todosOsItens.forEach((item) => {
      const textoDoItem = item.textContent.toLowerCase();

      if (textoDoItem.includes(termoBusca)) {
        item.style.display = displayStyle;
      } else {
        item.style.display = "none";
      }
    });
  });
}

let graficoAtividades = null;

function processarDadosGrafico(relatoriosDoResidente) {
  const dadosPorMes = Array.from({ length: 12 }, () => ({
    Regrediu: 0,
    Estagnado: 0,
    Progresso: 0,
    Superou: 0,
  }));

  const topicosEvolucao = [
    "evolucao_social",
    "evolucao_pedagogica",
    "evolucao_psicologica",
    "evolucao_saude",
    "evolucao_fisica",
    "evolucao_comunicacao",
  ];

  for (const relatorio of relatoriosDoResidente) {
    if (!relatorio.data_relatorio) continue;

    const mes = new Date(relatorio.data_relatorio).getUTCMonth();

    for (const topico of topicosEvolucao) {
      const evolucao = relatorio[topico];

      switch (evolucao) {
        case "Regrediu":
          dadosPorMes[mes].Regrediu++;
          break;
        case "Estagnado":
          dadosPorMes[mes].Estagnado++;
          break;
        case "Progresso Esperado":
          dadosPorMes[mes].Progresso++;
          break;
        case "Superou Expectativas":
          dadosPorMes[mes].Superou++;
          break;
      }
    }
  }

  return {
    dadosRegrediu: dadosPorMes.map((m) => m.Regrediu),
    dadosEstagnado: dadosPorMes.map((m) => m.Estagnado),
    dadosProgresso: dadosPorMes.map((m) => m.Progresso),
    dadosSuperou: dadosPorMes.map((m) => m.Superou),
  };
}

async function iniciarPaginaDashboard() {
  atualizarSaudacao();

  const contadorResidentesEl = document.getElementById("contador-residentes");
  const contadorRelatoriosEl = document.getElementById(
    "contador-relatorios-hoje"
  );
  const contadorAtividadesEl = document.getElementById(
    "contador-atividades-hoje"
  );
  const listaResidentesDashboard = document.getElementById(
    "residentes-chart-list"
  );
  const graficoContainer = document.querySelector(".grafico-dashboard");

  let listaResidentes = mockResidentes;
  let listaRelatorios = mockRelatorios;
  let listaAtividades = mockAtividades;

  const dataAtual = new Date();
  const yyyy = dataAtual.getFullYear();
  const mm = String(dataAtual.getMonth() + 1).padStart(2, "0");
  const dd = String(dataAtual.getDate()).padStart(2, "0");
  const hoje = `${yyyy}-${mm}-${dd}`;

  if (contadorResidentesEl) {
    contadorResidentesEl.textContent = listaResidentes.length;
  }

  if (contadorRelatoriosEl) {
    const deHoje = listaRelatorios.filter((r) => {
      if (!r.data) return false;
      const dataRelatorio = r.data.split("T")[0];
      return dataRelatorio === hoje;
    }).length;
    contadorRelatoriosEl.textContent = deHoje;
  }

  if (contadorAtividadesEl) {
    const deHoje = listaAtividades.filter((a) => {
      if (!a.data) return false;
      const dataAtividade = a.data.split("T")[0];
      return dataAtividade === hoje && a.status === "Agendada";
    }).length;
    contadorAtividadesEl.textContent = deHoje;
  }

  if (listaResidentesDashboard) {
    listaResidentesDashboard.innerHTML = "";
    listaResidentes.forEach((residente) => {
      const li = document.createElement("li");
      li.textContent = `${residente.primeiro_nome} ${residente.sobrenome}`;
      li.dataset.id = residente.id_residente;
      listaResidentesDashboard.appendChild(li);
    });
  }

  if (listaResidentesDashboard && graficoContainer) {
    listaResidentesDashboard.addEventListener("click", async function (event) {
      if (event.target && event.target.nodeName === "LI") {
        const liClicado = event.target;
        const residenteId = liClicado.dataset.id;

        if (!residenteId) return;

        listaResidentesDashboard
          .querySelectorAll("li")
          .forEach((item) => item.classList.remove("ativo"));
        liClicado.classList.add("ativo");

        if (graficoAtividades) {
          graficoAtividades.destroy();
        }

        graficoContainer.innerHTML = `
          <div class="chart-wrapper">
            <h2>Desempenho do Residente (Janeiro a Dezembro)</h2>
            <canvas id="grafico-desempenho-residente"></canvas>
          </div>
        `;

        let dadosRegrediu = Array(12).fill(0);
        let dadosEstagnado = Array(12).fill(0);
        let dadosProgresso = Array(12).fill(0);
        let dadosSuperou = Array(12).fill(0);

        const relatoriosDoResidente = mockRelatorios.filter(
          (r) => r.residenteId == residenteId
        );
        const dadosProcessados = processarDadosGrafico(relatoriosDoResidente);
        dadosRegrediu = dadosProcessados.dadosRegrediu;
        dadosEstagnado = dadosProcessados.dadosEstagnado;
        dadosProgresso = dadosProcessados.dadosProgresso;
        dadosSuperou = dadosProcessados.dadosSuperou;

        const ctx = document
          .getElementById("grafico-desempenho-residente")
          .getContext("2d");

        const meses = [
          "Janeiro",
          "Fevereiro",
          "Março",
          "Abril",
          "Maio",
          "Junho",
          "Julho",
          "Agosto",
          "Setembro",
          "Outubro",
          "Novembro",
          "Dezembro",
        ];

        graficoAtividades = new Chart(ctx, {
          type: "bar",
          data: {
            labels: meses,
            datasets: [
              {
                label: "Regrediu",
                data: dadosRegrediu,
                backgroundColor: "rgba(220, 53, 69, 0.8)",
                borderColor: "rgba(220, 53, 69, 1)",
                borderWidth: 1,
              },
              {
                label: "Estagnado",
                data: dadosEstagnado,
                backgroundColor: "rgba(255, 193, 7, 0.8)",
                borderColor: "rgba(255, 193, 7, 1)",
                borderWidth: 1,
              },
              {
                label: "Progresso",
                data: dadosProgresso,
                backgroundColor: "rgba(0, 123, 255, 0.8)",
                borderColor: "rgba(0, 123, 255, 1)",
                borderWidth: 1,
              },
              {
                label: "Superou",
                data: dadosSuperou,
                backgroundColor: "rgba(40, 167, 69, 0.8)",
                borderColor: "rgba(40, 167, 69, 1)",
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                stacked: false,
              },
              y: {
                stacked: false,
                beginAtZero: true,
                title: {
                  display: true,
                  text: "Quantidade de Ocorrências",
                },
                ticks: {
                  stepSize: 1,
                },
              },
            },
            plugins: {
              legend: {
                position: "bottom",
              },
            },
          },
        });
      }
    });
  }
}

async function iniciarPaginaResidentes() {
  const tabelaBodyDesktop = document.getElementById("lista-residentes-body");
  const listaBodyMobile = document.getElementById("lista-residentes-nova-body");
  if (!tabelaBodyDesktop || !listaBodyMobile) return;

  let listaResidentes = mockResidentes;
  listaResidentes.reverse();

  tabelaBodyDesktop.innerHTML = "";
  listaBodyMobile.innerHTML = "";

  if (listaResidentes.length > 0) {
    listaResidentes.forEach((residente) => {
      const idade = calcularIdade(residente.data_nascimento);
      const categoria = definirCategoria(idade);
      const nomeCompleto = `${residente.primeiro_nome} ${residente.sobrenome}`;
      const sexoFormatado = residente.sexo
        ? residente.sexo.charAt(0).toUpperCase() + residente.sexo.slice(1)
        : "N/A";

      const acoesHTML = `
          <a href="#" class="btn-acao-icone btn-editar" title="Editar Ficha"><i class='bx bxs-pencil'></i></a>
          <a href="#" class="btn-acao-icone btn-excluir" data-id="${residente.id_residente}" title="Excluir Ficha"><i class='bx bx-trash-alt'></i></a>
        `;

      const tr = document.createElement("tr");
      tr.innerHTML = `
          <td>${nomeCompleto}</td>
          <td>${idade}</td>
          <td>${sexoFormatado}</td>
          <td>${categoria}</td>
          <td class="acoes">${acoesHTML}</td>
        `;
      tabelaBodyDesktop.appendChild(tr);

      const li = document.createElement("li");
      li.innerHTML = `
          <span class="residente-nome">${nomeCompleto}</span>
          <span class="residente-idade">${idade}</span>
          <div class="residente-acoes">${acoesHTML}</div>
        `;
      listaBodyMobile.appendChild(li);
    });
  } else {
    tabelaBodyDesktop.innerHTML = `<tr><td colspan="5" style="text-align: center;">Nenhum residente cadastrado.</td></tr>`;
    listaBodyMobile.innerHTML = `<li style="display: block; text-align: center; background: none; color: var(--secondary-color);">Nenhum residente cadastrado.</li>`;
  }
}

async function iniciarPaginaFuncionarios() {
  const tabelaBodyDesktop = document.getElementById("lista-funcionarios-body");
  const listaBodyMobile = document.getElementById(
    "lista-funcionarios-nova-body"
  );

  if (!tabelaBodyDesktop || !listaBodyMobile) {
    console.warn("Elementos da tabela de funcionários não encontrados.");
    return;
  }

  let listaFuncionarios = mockFuncionarios;
  listaFuncionarios.reverse();

  tabelaBodyDesktop.innerHTML = "";
  listaBodyMobile.innerHTML = "";

  if (listaFuncionarios.length > 0) {
    listaFuncionarios.forEach((funcionario) => {
      const idDoFuncionario = funcionario.id_funcionario;
      const numRegistro = funcionario.numero_registro || "N/A";
      const nomeCompleto = `${funcionario.primeiro_nome} ${funcionario.sobrenome}`;

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
      const status = funcionario.status || "Ativo";
      const classeStatus = `status-${status.toLowerCase()}`;
      const statusFormatado = status.charAt(0).toUpperCase() + status.slice(1);
      const statusHTML = `<span class="status ${classeStatus}">${statusFormatado}</span>`;

      const acoesHTML = `
          <a href="#" class="btn-acao-icone btn-editar" title="Editar Ficha"><i class='bx bxs-pencil'></i></a>
          <a href="#" class="btn-acao-icone btn-excluir" data-id="${idDoFuncionario}" title="Excluir Ficha"><i class='bx bx-trash-alt'></i></a>
        `;

      const tr = document.createElement("tr");
      tr.innerHTML = `
          <td>${horario}</td>
          <td>${nomeCompleto}</td>
          <td>${numRegistro}</td> <td>${statusHTML}</td>
          <td class="acoes">${acoesHTML}</td>
        `;
      tabelaBodyDesktop.appendChild(tr);

      const li = document.createElement("li");
      li.innerHTML = `
          <span class="funcionario-nome">${nomeCompleto}</span>
          <div class="funcionario-status">${statusHTML}</div>
          <div class="funcionario-acoes">${acoesHTML}</div>
        `;
      listaBodyMobile.appendChild(li);
    });
  } else {
    tabelaBodyDesktop.innerHTML = `<tr><td colspan="5" style="text-align: center;">Nenhum funcionário cadastrado.</td></tr>`;
    listaBodyMobile.innerHTML = `<li style="display: block; text-align: center; background: none; color: var(--secondary-color);">Nenhum funcionário cadastrado.</li>`;
  }
}

function iniciarPaginaResponsaveis() {
  const listaResponsaveis = JSON.parse(
    sessionStorage.getItem("listaResponsaveis") || "[]"
  );
  const listaResidentes = JSON.parse(
    sessionStorage.getItem("listaResidentes") || "[]"
  );

  const tabelaBodyDesktop = document.getElementById("lista-responsaveis-body");
  const listaBodyMobile = document.getElementById(
    "lista-responsaveis-nova-body"
  );

  if (!tabelaBodyDesktop || !listaBodyMobile) return;

  tabelaBodyDesktop.innerHTML = "";
  listaBodyMobile.innerHTML = "";

  if (listaResponsaveis.length > 0) {
    listaResponsaveis.forEach((responsavel) => {
      const idade = calcularIdade(responsavel.nascimento);
      const categoria = definirCategoria(idade);
      const nomeCompleto = `${responsavel["primeiro-nome"]} ${responsavel.sobrenome}`;
      const parentesco = responsavel.parentesco;

      const residenteVinculado = listaResidentes.find(
        (r) => r.id == responsavel.residenteId
      );
      const nomeResidente = residenteVinculado
        ? `${residenteVinculado["primeiro-nome"]} ${residenteVinculado.sobrenome}`
        : "Não encontrado";

      const acoesHTML = `
          <a href="#" class="btn-acao-icone btn-editar" title="Editar Ficha"><i class='bx bxs-pencil'></i></a>
          <a href="#" class="btn-acao-icone btn-excluir" data-id="${responsavel.id}" title="Excluir Ficha"><i class='bx bx-trash-alt'></i></a>
        `;

      const tr = document.createElement("tr");
      tr.innerHTML = `
          <td>${nomeCompleto}</td>
          <td>${idade}</td>
          <td>${categoria}</td>
          <td>${parentesco}</td>
          <td>${nomeResidente}</td>
          <td class="acoes">${acoesHTML}</td>
        `;
      tabelaBodyDesktop.appendChild(tr);

      const li = document.createElement("li");
      li.innerHTML = `
          <span class="responsavel-nome">${nomeCompleto}</span>
          <span class="responsavel-parentesco">${parentesco}</span>
          <div class="responsavel-acoes">${acoesHTML}</div>
        `;
      listaBodyMobile.appendChild(li);
    });
  } else {
    tabelaBodyDesktop.innerHTML = `<td colspan="6" style="text-align:center;">Nenhum responsável cadastrado.</td>`;
    listaBodyMobile.innerHTML = `<li style="display: block; text-align: center; background: none; color: var(--secondary-color);">Nenhum responsável cadastrado.</li>`;
  }
}

async function iniciarPaginaMedicamentos() {
  const tabelaBodyDesktop = document.getElementById("lista-medicamentos-body");
  const listaBodyMobile = document.getElementById(
    "lista-medicamentos-nova-body"
  );

  if (!tabelaBodyDesktop || !listaBodyMobile) return;

  const isGerente = document.body.classList.contains("role-gerente");

  tabelaBodyDesktop.innerHTML = "";
  listaBodyMobile.innerHTML = "";

  const listaTratamentos = mockMedicamentos;
  listaTratamentos.reverse();

  if (listaTratamentos.length > 0) {
    listaTratamentos.forEach((tratamento) => {
      const nomeResidente = tratamento.residenteNome || "Não encontrado";

      let acoesHTML = "";

      if (isGerente) {
        acoesHTML = `
            <a href="#" class="btn-acao-icone btn-editar" title="Editar Agendamento"><i class='bx bxs-pencil'></i></a>
            <a href="#" class="btn-acao-icone btn-excluir" data-id="${tratamento.id}" title="Excluir Agendamento"><i class='bx bx-trash-alt'></i></a>
          `;
      } else {
        acoesHTML = `
            <a href="#" class="btn-acao-texto btn-ver-ficha" title="Ver Ficha">
              <i class='bx bx-show'></i> Ver Ficha
            </a>
          `;
      }

      const tr = document.createElement("tr");
      tr.innerHTML = `
          <td>${tratamento.horario}</td>
          <td>${nomeResidente}</td>
          <td>${tratamento.medicamento}</td>
          <td>${tratamento.dosagem}</td>
          <td>${tratamento.tipo || "N/A"}</td>
          <td class="acoes">${acoesHTML}</td>
        `;
      tabelaBodyDesktop.appendChild(tr);

      const li = document.createElement("li");
      li.innerHTML = `
          <span class="medicamento-residente">${nomeResidente}</span>
          <span class="medicamento-nome">${tratamento.medicamento}</span>
          <div class="medicamento-acoes">${acoesHTML}</div>
        `;
      listaBodyMobile.appendChild(li);
    });
  } else {
    tabelaBodyDesktop.innerHTML = `<tr><td colspan="6" style="text-align:center;">Nenhum tratamento agendado.</td></tr>`;
    listaBodyMobile.innerHTML = `<li style="display: block; text-align: center; background: none; color: var(--secondary-color);">Nenhum tratamento agendado.</li>`;
  }
}

async function iniciarPaginaAtividades() {
  let listaAgendamentos = mockAtividades;
  listaAgendamentos.reverse();

  const tabelaBodyDesktop = document.getElementById("lista-atividades-body");
  const listaBodyMobile = document.getElementById("lista-atividades-nova-body");
  if (!tabelaBodyDesktop || !listaBodyMobile) return;

  tabelaBodyDesktop.innerHTML = "";
  listaBodyMobile.innerHTML = "";

  if (listaAgendamentos.length > 0) {
    listaAgendamentos.forEach((agendamento) => {
      const statusOriginal = agendamento.status || "Agendada";
      const statusNormalizado = statusOriginal
        .toString()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toLowerCase();
      const classeStatus = `status-${statusNormalizado}`;
      const statusFormatado =
        statusOriginal.charAt(0).toUpperCase() +
        statusOriginal.slice(1).toLowerCase();

      const statusHTML = `
        <span class="status ${classeStatus}">${statusFormatado}</span>
      `;

      const dataRaw = agendamento.data || agendamento.data_atividade;
      let dataFormatada = "N/A";
      if (dataRaw) {
        const dataObj = new Date(dataRaw);
        if (!isNaN(dataObj)) {
          dataFormatada = dataObj.toLocaleDateString("pt-BR", {
            timeZone: "UTC",
          });
        }
      }

      let horarioExibicao = "N/A";
      if (agendamento.horario) {
        horarioExibicao = agendamento.horario.substring(0, 5);
      }

      const dataHoraHTML = `
        <div><span class="col-horario">${horarioExibicao}</span></div>
        <div><span class="col-data">${dataFormatada}</span></div>
      `;

      const duracaoExibicao = agendamento.duracao || "N/A";

      const acoesHTML = `
        <a href="#" class="btn-acao-icone btn-editar" title="Editar Atividade">
          <i class='bx bxs-pencil'></i></a>
        <a href="#" class="btn-acao-icone btn-excluir" data-id="${agendamento.id}" title="Excluir Atividade">
          <i class='bx bx-trash-alt'></i></a>
      `;

      let participantesHTML = "Nenhum";
      if (agendamento.participantes_nomes) {
        const nomes = agendamento.participantes_nomes.split(", ");
        const total = nomes.length;
        const nomesExibidos = nomes.slice(0, 5);

        participantesHTML = `<ul class="participantes-lista">`;
        nomesExibidos.forEach((nome) => {
          participantesHTML += `<li>${nome}</li>`;
        });

        if (total > 5) {
          participantesHTML += `<li class="mais-participantes">+${
            total - 5
          }</li>`;
        }
        participantesHTML += `</ul>`;
      }

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${dataHoraHTML}</td>
        <td>${participantesHTML}</td>
        <td>${agendamento.nome_atividade || agendamento.nome || "N/A"}</td>
        <td>${duracaoExibicao}</td>
        <td>${statusHTML}</td>
        <td class="acoes">${acoesHTML}</td>
      `;
      tabelaBodyDesktop.appendChild(tr);

      const li = document.createElement("li");
      li.innerHTML = `
        <div class="atividade-data-hora">
          <span class="data">${dataFormatada}</span>
          <span class="hora">${horarioExibicao}</span>
        </div>
        <span class="atividade-nome">${
          agendamento.nome_atividade || agendamento.nome || "N/A"
        }</span>
        <div class="atividade-acoes">${acoesHTML}</div>
      `;
      listaBodyMobile.appendChild(li);
    });
  } else {
    tabelaBodyDesktop.innerHTML = `<tr><td colspan="6" style="text-align:center;">Nenhuma atividade agendada.</td></tr>`;
    listaBodyMobile.innerHTML = `<li style="display: block; text-align: center; background: none; color: var(--secondary-color);">Nenhuma atividade agendada.</li>`;
  }
}

async function iniciarPaginaRelatorios() {
  const tabelaBodyDesktop = document.getElementById("lista-relatorios-body");
  const listaBodyMobile = document.getElementById("lista-relatorios-nova-body");
  if (!tabelaBodyDesktop || !listaBodyMobile) return;

  const relatoriosOrdenados = mockRelatorios;

  tabelaBodyDesktop.innerHTML = "";
  listaBodyMobile.innerHTML = "";

  if (relatoriosOrdenados.length > 0) {
    relatoriosOrdenados.forEach((relatorio) => {
      const nomeResidente = relatorio.residenteNome || "Não encontrado";

      let dataFormatada = "N/A";
      if (relatorio.data) {
        const dataObj = new Date(relatorio.data + "T00:00:00");
        if (!isNaN(dataObj.getTime())) {
          dataFormatada = dataObj.toLocaleDateString("pt-BR");
        }
      }

      const acoesHTML = `
          <a href="#" class="btn-acao-icone btn-editar" title="Editar Relatório"><i class='bx bxs-pencil'></i></a>
          <a href="#" class="btn-acao-icone btn-excluir" data-id="${relatorio.id}" title="Excluir Relatório"><i class='bx bx-trash-alt'></i></a>
        `;

      let statusHtml = relatorio.statusMedicacao || "N/A";
      let classeStatus = "";
      if (relatorio.statusMedicacao === "Medicado") {
        classeStatus = "status-administrado";
      } else if (relatorio.statusMedicacao === "Não Tomado") {
        classeStatus = "status-nao-tomado";
      }
      if (classeStatus) {
        statusHtml = `<span class="status ${classeStatus}">${relatorio.statusMedicacao}</span>`;
      }

      const tr = document.createElement("tr");
      tr.innerHTML = `
          <td>${dataFormatada}</td>
          <td>${nomeResidente}</td>
          <td>${relatorio.medicamento || "Nenhum"}</td>
          <td>${relatorio.responsavelNome}</td>
          <td>${statusHtml}</td>
          <td class="acoes">${acoesHTML}</td>
        `;
      tabelaBodyDesktop.appendChild(tr);

      const li = document.createElement("li");
      li.innerHTML = `
          <span class="relatorio-data">${dataFormatada}</span>
          <span class="relatorio-residente">${nomeResidente}</span>
          <div class="relatorio-acoes">${acoesHTML}</div>
        `;
      listaBodyMobile.appendChild(li);
    });
  } else {
    tabelaBodyDesktop.innerHTML = `<tr><td colspan="6" style="text-align: center;">Nenhum relatório cadastrado.</td></tr>`;
    listaBodyMobile.innerHTML = `<li style="display: block; text-align: center; background: none; color: var(--secondary-color);">Nenhum relatório cadastrado.</li>`;
  }
}

function iniciarPaginaAdm() {
  const botaoLoginLogout = document.getElementById("btn-logout");
  if (!botaoLoginLogout) return;

  const handleLogout = async function (event) {
    event.preventDefault();
    if (confirm("Tem certeza que deseja sair da sua conta?")) {
      localStorage.clear();
      window.location.href = "login/index.html";
    }
  };

  botaoLoginLogout.classList.add("opcao-logout");
  botaoLoginLogout.href = "#";
  botaoLoginLogout.removeEventListener("click", handleLogout);
  botaoLoginLogout.addEventListener("click", handleLogout);
}

function getAvatarColor(nome, sexo) {
  const coresMasculinas = [
    "#2196F3",
    "#D32F2F",
    "#00796B",
    "#5D4037",
    "#0288D1",
    "#F57C00",
  ];

  const coresFemininas = [
    "#E91E63",
    "#9C27B0",
    "#673AB7",
    "#EC407A",
    "#AB47BC",
  ];

  let paleta = coresMasculinas;
  if (sexo === "feminino") {
    paleta = coresFemininas;
  }

  let hash = 0;
  for (let i = 0; i < nome.length; i++) {
    hash = nome.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % paleta.length;

  return paleta[index];
}

function carregarInfoPerfilUsuario() {
  const spanInicial = document.getElementById("perfil-inicial");
  const pNomeCompleto = document.getElementById("perfil-nome-completo");
  const avatarCircle = document.querySelector(".perfil-avatar");

  if (!spanInicial || !pNomeCompleto || !avatarCircle) return;
  const usuarioJSON = localStorage.getItem("usuarioLogado");

  if (usuarioJSON) {
    const usuario = JSON.parse(usuarioJSON);
    let inicial = "?";
    let nomeCompleto = "Usuário";
    let nomeParaHash = "Usuário";
    let sexoUsuario = "masculino";

    if (usuario.nome && usuario.nome.length > 0) {
      inicial = usuario.nome.charAt(0).toUpperCase();
      nomeCompleto = usuario.nome;
      nomeParaHash = usuario.nome;
    }

    if (usuario.sobrenome) {
      nomeCompleto += " " + usuario.sobrenome;
    }

    if (usuario.sexo) {
      sexoUsuario = usuario.sexo;
    }

    spanInicial.textContent = inicial;
    pNomeCompleto.textContent = nomeCompleto;
    const corAvatar = getAvatarColor(nomeParaHash, sexoUsuario);
    avatarCircle.style.backgroundColor = corAvatar;
  } else {
    spanInicial.textContent = "!";
    pNomeCompleto.textContent = "Visitante";
    console.error("Usuário não encontrado na sessão.");
  }
}

document.addEventListener("DOMContentLoaded", function () {
  aplicarControleDeAcesso();
  const containerGeral = document.querySelector(".container-geral");
  const menuItens = document.querySelectorAll(".menu-header li");
  let isAnimating = false;

  menuItens.forEach((item) => {
    item.addEventListener("click", function () {
      if (isAnimating) return;
      const paginaAlvoId = this.dataset.pagina;
      if (!paginaAlvoId) return;

      for (let cls of document.body.classList) {
        if (cls.endsWith("-ativa")) {
          document.body.classList.remove(cls);
        }
      }
      document.body.classList.add(paginaAlvoId + "-ativa");

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

  const btnMenuFlyout = document.getElementById("btn-menu-flyout");
  const flyoutContainer = document.querySelector(".flyout-container");

  if (flyoutContainer) {
    const flyoutBackdrop = document.querySelector(".flyout-backdrop");
    const flyoutClose = document.querySelector(".flyout-close");
    const flyoutLinksContainer = document.getElementById(
      "flyout-links-container"
    );
    const todosOsLinksDoMenu = document.querySelectorAll(
      ".header2 .menu-header > ul > li"
    );

    const fecharFlyout = () => {
      flyoutContainer.classList.remove("ativo");
    };

    const abrirFlyout = () => {
      flyoutContainer.classList.add("ativo");
    };

    const popularMenuFlyout = () => {
      flyoutLinksContainer.innerHTML = "";

      const userIsGerente = document.body.classList.contains("role-gerente");

      todosOsLinksDoMenu.forEach((item) => {
        const isDesktopOnly =
          item.classList.contains("item-menu-desktop") &&
          !item.classList.contains("item-menu-mobile");

        if (isDesktopOnly) {
          const isRestricted = item.classList.contains("acesso-gerente");

          if (!isRestricted || userIsGerente) {
            const pagina = item.dataset.pagina;
            const iconeHTML = item.querySelector("i").outerHTML;
            const texto = item.querySelector(".texto-lado").textContent;

            const novoLink = document.createElement("a");
            novoLink.href = "#";
            novoLink.dataset.pagina = pagina;
            novoLink.innerHTML = `${iconeHTML} <span>${texto}</span>`;

            novoLink.addEventListener("click", (e) => {
              e.preventDefault();
              const itemOriginalDoMenu = document.querySelector(
                `.menu-header li[data-pagina="${pagina}"]`
              );
              if (itemOriginalDoMenu) {
                itemOriginalDoMenu.click();
              }
              fecharFlyout();
            });

            flyoutLinksContainer.appendChild(novoLink);
          }
        }
      });
    };

    btnMenuFlyout.addEventListener("click", abrirFlyout);
    flyoutBackdrop.addEventListener("click", fecharFlyout);
    flyoutClose.addEventListener("click", fecharFlyout);

    popularMenuFlyout();
  }

  const bemVindoEl = document.querySelector("#pagina-dashboard .bem-vindo");
  const containerOriginal = document.querySelector("#pagina-dashboard");
  const bodyEl = document.body;
  const mobileMediaQuery = window.matchMedia("(max-width: 850px)");

  function handleLayoutChange(e) {
    if (!bemVindoEl || !containerOriginal) return;

    if (e.matches) {
      bodyEl.appendChild(bemVindoEl);
      bemVindoEl.classList.add("movido-para-topo");
    } else {
      containerOriginal.prepend(bemVindoEl);
      bemVindoEl.classList.remove("movido-para-topo");
    }
  }

  handleLayoutChange(mobileMediaQuery);
  mobileMediaQuery.addEventListener("change", handleLayoutChange);

  carregarInfoPerfilUsuario();
  iniciarPaginaDashboard();
  iniciarPaginaResidentes();
  iniciarPaginaFuncionarios();
  iniciarPaginaResponsaveis();
  iniciarPaginaMedicamentos();
  iniciarPaginaAtividades();
  iniciarPaginaRelatorios();
  iniciarPaginaAdm();

  configurarBusca("busca-residentes-desktop", "lista-residentes-body", "tr");
  configurarBusca(
    "busca-residentes-mobile",
    "lista-residentes-nova-body",
    "li",
    "grid"
  );

  configurarBusca(
    "busca-funcionarios-desktop",
    "lista-funcionarios-body",
    "tr"
  );
  configurarBusca(
    "busca-funcionarios-mobile",
    "lista-funcionarios-nova-body",
    "li",
    "grid"
  );

  configurarBusca("busca-relatorios-desktop", "lista-relatorios-body", "tr");
  configurarBusca(
    "busca-relatorios-mobile",
    "lista-relatorios-nova-body",
    "li",
    "grid"
  );

  configurarBusca("busca-atividades-desktop", "lista-atividades-body", "tr");
  configurarBusca(
    "busca-atividades-mobile",
    "lista-atividades-nova-body",
    "li",
    "grid"
  );

  configurarBusca(
    "busca-medicamentos-desktop",
    "lista-medicamentos-body",
    "tr"
  );
  configurarBusca(
    "busca-medicamentos-mobile",
    "lista-medicamentos-nova-body",
    "li",
    "grid"
  );

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
  }
});
