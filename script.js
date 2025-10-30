// Funções Globais_______________________________________________________________________________
/*
  Estas são funções de "ajuda" que podem ser usadas em várias partes do sistema.
  A função 'calcularIdade' recebe uma data de nascimento e retorna a idade atual da pessoa.
  A função 'definirCategoria' recebe uma idade e retorna uma classificação 
  (Criança, Adolescente, Adulto, Idoso).
*/
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

// FUNÇÃO PARA SAUDAÇÃO DINÂMICA _________________________________________________________________________________
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

  const nomeUsuario = "Usuário";

  elementoSaudacao.textContent = `Olá, ${saudacao}, ${nomeUsuario}!`;
}

// barra de pesquisa universal _______________________________________________________________________________________
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

// tabela dashboard ______________________________________________________________________________________________________________
/*
  Esta função inicializa a página de Dashboard. Ela é responsável por calcular e exibir 
  os números nos cards de resumo (total de residentes, medicamentos pendentes e atividades 
  de hoje). Além disso, ela cria a lista de residentes à esquerda e prepara a área 
  dos gráficos, definindo que, ao clicar em um residente, os gráficos de atividades 
  e medicamentos sejam gerados e exibidos na tela.
*/
let graficoAtividades = null;

function iniciarPaginaDashboard() {
  atualizarSaudacao();

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

  // --- Clique no residente para gerar gráfico ---
  if (listaResidentesDashboard && graficoContainer) {
    listaResidentesDashboard.addEventListener("click", function (event) {
      if (event.target && event.target.nodeName === "LI") {
        const liClicado = event.target;
        const residenteId = liClicado.dataset.id;

        // Ativa o residente selecionado
        listaResidentesDashboard
          .querySelectorAll("li")
          .forEach((item) => item.classList.remove("ativo"));
        liClicado.classList.add("ativo");

        // Destroi gráfico anterior, se houver
        if (graficoAtividades) {
          graficoAtividades.destroy();
        }

        // Substitui o container com novo gráfico
        graficoContainer.innerHTML = `
          <div class="chart-wrapper">
            <h2>Desempenho do Residente (Janeiro a Dezembro)</h2>
            <canvas id="grafico-desempenho-residente"></canvas>
          </div>
        `;

        const ctx = document
          .getElementById("grafico-desempenho-residente")
          .getContext("2d");

        // Dados fictícios para o exemplo
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

        const dadosRegrediu = Array.from({ length: 12 }, () =>
          Math.floor(Math.random() * 5)
        );
        const dadosEstagnado = Array.from({ length: 12 }, () =>
          Math.floor(Math.random() * 5)
        );
        const dadosProgresso = Array.from({ length: 12 }, () =>
          Math.floor(Math.random() * 5)
        );
        const dadosSuperou = Array.from({ length: 12 }, () =>
          Math.floor(Math.random() * 5)
        );

        graficoAtividades = new Chart(ctx, {
          type: "bar",
          data: {
            labels: meses,
            datasets: [
              {
                label: "Regrediu",
                data: dadosRegrediu,
                backgroundColor: "rgba(220, 53, 69, 0.8)", // vermelho
                borderColor: "rgba(220, 53, 69, 1)",
                borderWidth: 1,
              },
              {
                label: "Estagnado",
                data: dadosEstagnado,
                backgroundColor: "rgba(255, 193, 7, 0.8)", // amarelo
                borderColor: "rgba(255, 193, 7, 1)",
                borderWidth: 1,
              },
              {
                label: "Progresso",
                data: dadosProgresso,
                backgroundColor: "rgba(0, 123, 255, 0.8)", // azul
                borderColor: "rgba(0, 123, 255, 1)",
                borderWidth: 1,
              },
              {
                label: "Superou",
                data: dadosSuperou,
                backgroundColor: "rgba(40, 167, 69, 0.8)", // verde
                borderColor: "rgba(40, 167, 69, 1)",
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: "Quantidade de Ocorrências",
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

// tabela residentes ______________________________________________________________________________________________________________
/*
  Esta função inicializa a página de Residentes. Ela busca a lista de residentes salvos 
  na memória, e então cria dinamicamente a tabela que é exibida na tela, adicionando 
  uma linha para cada residente com suas informações (nome, idade, etc.) e os botões 
  de ação (editar e excluir). Ela também ativa a funcionalidade do botão de excluir.
*/

function iniciarPaginaResidentes() {
  const listaResidentes = JSON.parse(
    sessionStorage.getItem("listaResidentes") || "[]"
  );

  const tabelaBodyDesktop = document.getElementById("lista-residentes-body");
  const listaBodyMobile = document.getElementById("lista-residentes-nova-body");

  if (!tabelaBodyDesktop || !listaBodyMobile) return;

  tabelaBodyDesktop.innerHTML = "";
  listaBodyMobile.innerHTML = "";

  if (listaResidentes.length > 0) {
    listaResidentes.forEach((residente) => {
      const idade = calcularIdade(residente.nascimento);
      const categoria = definirCategoria(idade);
      const nomeCompleto = `${residente["primeiro-nome"]} ${residente.sobrenome}`;
      const sexoFormatado = residente.sexo
        ? residente.sexo.charAt(0).toUpperCase() + residente.sexo.slice(1)
        : "N/A";
      const acoesHTML = `
        <a href="cadastros/cadastro-residente/index.html?id=${residente.id}&origem=pagina-residentes" class="btn-acao-icone btn-editar" title="Editar Ficha"><i class='bx bxs-pencil'></i></a>
        <a href="#" class="btn-acao-icone btn-excluir" data-id="${residente.id}" title="Excluir Ficha"><i class='bx bx-trash-alt'></i></a>
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

  const paginaResidentes = document.getElementById("pagina-residentes");

  paginaResidentes.addEventListener("click", function (event) {
    const botaoExcluir = event.target.closest(".btn-excluir");
    if (!botaoExcluir) return;

    event.preventDefault();
    const idParaExcluir = botaoExcluir.dataset.id;

    const itemPai = botaoExcluir.closest("tr") || botaoExcluir.closest("li");
    const nomeDoResidente = itemPai.querySelector(
      "td:first-child, .residente-nome"
    ).textContent;

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
      iniciarPaginaResidentes();
    }
  });
}

// tabela funcionario ______________________________________________________________________________________________________________
/*
  Esta função inicializa a página de Funcionários. Assim como a de residentes, ela 
  lê a lista de funcionários salvos e constrói a tabela na tela, mostrando 
  informações como nome, turno, e status de cada um. Ela também cria os links 
  corretos para a edição de cada ficha e ativa a funcionalidade do botão de excluir.
*/
function iniciarPaginaFuncionarios() {
  const listaFuncionarios = JSON.parse(
    sessionStorage.getItem("listaFuncionarios") || "[]"
  );

  const tabelaBodyDesktop = document.getElementById("lista-funcionarios-body");
  const listaBodyMobile = document.getElementById(
    "lista-funcionarios-nova-body"
  );

  if (!tabelaBodyDesktop || !listaBodyMobile) return;

  tabelaBodyDesktop.innerHTML = "";
  listaBodyMobile.innerHTML = "";

  if (listaFuncionarios.length > 0) {
    listaFuncionarios.forEach((funcionario) => {
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
      const status = funcionario.status || "Ativo";
      const classeStatus = `status-${status.toLowerCase()}`;
      const statusHTML = `<span class="status ${classeStatus}">${status}</span>`;

      const acoesHTML = `
        <a href="cadastros/cadastro-funcionario/index.html?id=${funcionario.id}&origem=pagina-funcionarios" class="btn-acao-icone btn-editar" title="Editar Ficha"><i class='bx bxs-pencil'></i></a>
        <a href="#" class="btn-acao-icone btn-excluir" data-id="${funcionario.id}" title="Excluir Ficha"><i class='bx bx-trash-alt'></i></a>
      `;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${horario}</td>
        <td>${nomeCompleto}</td>
        <td>${funcionario.id.toString().slice(-4)}</td>
        <td>${statusHTML}</td>
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

  const paginaFuncionarios = document.getElementById("pagina-funcionarios");

  paginaFuncionarios.addEventListener("click", function (event) {
    const botaoExcluir = event.target.closest(".btn-excluir");
    if (!botaoExcluir) return;

    event.preventDefault();
    const idParaExcluir = botaoExcluir.dataset.id;

    const itemPai = botaoExcluir.closest("tr") || botaoExcluir.closest("li");
    const nomeDoFuncionario = itemPai.querySelector(
      "td:nth-child(2), .funcionario-nome"
    ).textContent;

    if (
      confirm(
        `Tem certeza que deseja excluir o funcionário "${nomeDoFuncionario}"?`
      )
    ) {
      const novaLista = JSON.parse(
        sessionStorage.getItem("listaFuncionarios") || "[]"
      ).filter((func) => func.id != idParaExcluir);

      sessionStorage.setItem("listaFuncionarios", JSON.stringify(novaLista));
      alert("Funcionário excluído com sucesso!");

      iniciarPaginaFuncionarios();
    }
  });
}

// tabela responsavel  ______________________________________________________________________________________________________________
/*
  Esta função inicializa a página de Responsáveis. Ela lê a lista de responsáveis e 
  de residentes para poder exibir a tabela completa, mostrando qual residente está 
  vinculado a qual responsável. Assim como as outras, ela também cria os botões 
  de ação (editar/excluir) e ativa a funcionalidade de exclusão.
*/

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
        <a href="cadastros/cadastro-responsavel/index.html?id=${responsavel.id}&origem=pagina-responsavel" class="btn-acao-icone btn-editar" title="Editar Ficha"><i class='bx bxs-pencil'></i></a>
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

  const paginaResponsaveis = document.getElementById("pagina-responsavel");

  paginaResponsaveis.addEventListener("click", function (event) {
    const botaoExcluir = event.target.closest(".btn-excluir");
    if (!botaoExcluir) return;

    event.preventDefault();
    const idParaExcluir = botaoExcluir.dataset.id;

    const itemPai = botaoExcluir.closest("tr") || botaoExcluir.closest("li");
    const nomeDoResponsavel = itemPai.querySelector(
      "td:first-child, .responsavel-nome"
    ).textContent;

    if (
      confirm(
        `Tem certeza que deseja excluir o responsável "${nomeDoResponsavel}"?`
      )
    ) {
      const novaLista = JSON.parse(
        sessionStorage.getItem("listaResponsaveis") || "[]"
      ).filter((resp) => resp.id != idParaExcluir);

      sessionStorage.setItem("listaResponsaveis", JSON.stringify(novaLista));
      alert("Responsável excluído com sucesso!");

      iniciarPaginaResponsaveis();
    }
  });
}

// sessao medicamento -_____________________________________________________________________________________________________
/*
  Esta função inicializa a página de Medicamentos. Ela busca a lista de tratamentos e 
  de residentes para montar a tabela de agendamentos de medicação. Para cada item, 
  ela exibe o horário, o residente, o medicamento e o status ( ou Administrado),
  junto com os botões de editar e excluir, e ativa a função de exclusão.
*/

function iniciarPaginaMedicamentos() {
  const listaResidentes = JSON.parse(
    sessionStorage.getItem("listaResidentes") || "[]"
  );
  const listaTratamentos = JSON.parse(
    sessionStorage.getItem("listaTratamentos") || "[]"
  );

  const tabelaBodyDesktop = document.getElementById("lista-medicamentos-body");
  const listaBodyMobile = document.getElementById(
    "lista-medicamentos-nova-body"
  );

  if (!tabelaBodyDesktop || !listaBodyMobile) return;

  tabelaBodyDesktop.innerHTML = "";
  listaBodyMobile.innerHTML = "";

  if (listaTratamentos.length > 0) {
    listaTratamentos.forEach((tratamento) => {
      const residente = listaResidentes.find(
        (r) => r.id == tratamento.residenteId
      );
      const nomeResidente = residente
        ? `${residente["primeiro-nome"]} ${residente.sobrenome}`
        : "Não encontrado";

      const acoesHTML = `
        <a href="cadastros/cadastro-medicamento/index.html?id=${tratamento.id}&origem=pagina-medicamentos" class="btn-acao-icone btn-editar" title="Editar Agendamento"><i class='bx bxs-pencil'></i></a>
        <a href="#" class="btn-acao-icone btn-excluir" data-id="${tratamento.id}" title="Excluir Agendamento"><i class='bx bx-trash-alt'></i></a>
      `;

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

  const paginaMedicamentos = document.getElementById("pagina-medicamentos");
  paginaMedicamentos.addEventListener("click", function (event) {
    const botaoExcluir = event.target.closest(".btn-excluir");
    if (!botaoExcluir) return;

    event.preventDefault();
    const idParaExcluir = botaoExcluir.dataset.id;
    const nomeDoMedicamento =
      JSON.parse(sessionStorage.getItem("listaTratamentos")).find(
        (t) => t.id == idParaExcluir
      )?.medicamento || "este agendamento";

    if (
      confirm(
        `Tem certeza que deseja excluir o agendamento do medicamento "${nomeDoMedicamento}"?`
      )
    ) {
      const novaLista = JSON.parse(
        sessionStorage.getItem("listaTratamentos") || "[]"
      ).filter((t) => t.id != idParaExcluir);
      sessionStorage.setItem("listaTratamentos", JSON.stringify(novaLista));
      alert("Agendamento excluído com sucesso!");
      iniciarPaginaMedicamentos();
    }
  });
}

// sessao atividades  -_____________________________________________________________________________________________________

/*
  Esta função inicializa a página de Atividades. Ela contém uma sub-função 'renderizarTabela' 
  que é responsável por ler os agendamentos de atividades e construir a tabela na tela, 
  mostrando data, horário, nome da atividade, status, etc. A função também ativa a 
  funcionalidade do botão de excluir, que ao ser clicado, remove o item e redesenha a 
  tabela para refletir a mudança instantaneamente.
*/

function iniciarPaginaAtividades() {
  const listaAgendamentos = JSON.parse(
    sessionStorage.getItem("listaAgendamentosAtividade") || "[]"
  );

  const tabelaBodyDesktop = document.getElementById("lista-atividades-body");
  const listaBodyMobile = document.getElementById("lista-atividades-nova-body");

  if (!tabelaBodyDesktop || !listaBodyMobile) return;

  tabelaBodyDesktop.innerHTML = "";
  listaBodyMobile.innerHTML = "";

  if (listaAgendamentos.length > 0) {
    listaAgendamentos.forEach((agendamento) => {
      const status = agendamento.status || "Agendada";
      const classeStatus = `status-${status.toLowerCase()}`;
      const statusHTML = `<span class="status ${classeStatus}">${status}</span>`;

      const dataFormatada = new Date(
        agendamento.data + "T00:00:00"
      ).toLocaleDateString("pt-BR");

      const acoesHTML = `
        <a href="cadastros/cadastro-atividade/index.html?id=${agendamento.id}&origem=pagina-atividades" class="btn-acao-icone btn-editar" title="Editar Atividade"><i class='bx bxs-pencil'></i></a>
        <a href="#" class="btn-acao-icone btn-excluir" data-id="${agendamento.id}" title="Excluir Atividade"><i class='bx bx-trash-alt'></i></a>
      `;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${dataFormatada}</td>
        <td>${agendamento.horario}</td>
        <td>${agendamento["nome-atividade"]}</td>
        <td>${agendamento.duracao || "N/A"}</td>
        <td>${statusHTML}</td>
        <td class="acoes">${acoesHTML}</td>
      `;
      tabelaBodyDesktop.appendChild(tr);

      const li = document.createElement("li");
      li.innerHTML = `
        <div class="atividade-data-hora">
            <span class="data">${dataFormatada}</span>
            <span class="hora">${agendamento.horario}</span>
        </div>
        <span class="atividade-nome">${agendamento["nome-atividade"]}</span>
        <div class="atividade-acoes">${acoesHTML}</div>
      `;
      listaBodyMobile.appendChild(li);
    });
  } else {
    tabelaBodyDesktop.innerHTML = `<tr><td colspan="6" style="text-align:center;">Nenhuma atividade agendada.</td></tr>`;
    listaBodyMobile.innerHTML = `<li style="display: block; text-align: center; background: none; color: var(--secondary-color);">Nenhuma atividade agendada.</li>`;
  }

  const paginaAtividades = document.getElementById("pagina-atividades");

  paginaAtividades.addEventListener("click", function (event) {
    const botaoExcluir = event.target.closest(".btn-excluir");
    if (!botaoExcluir) return;

    event.preventDefault();
    const idParaExcluir = botaoExcluir.dataset.id;
    const agendamento = JSON.parse(
      sessionStorage.getItem("listaAgendamentosAtividade")
    ).find((ag) => ag.id == idParaExcluir);

    if (
      agendamento &&
      confirm(
        `Tem certeza que deseja excluir a atividade "${agendamento["nome-atividade"]}"?`
      )
    ) {
      const novaLista = JSON.parse(
        sessionStorage.getItem("listaAgendamentosAtividade") || "[]"
      ).filter((ag) => ag.id != idParaExcluir);

      sessionStorage.setItem(
        "listaAgendamentosAtividade",
        JSON.stringify(novaLista)
      );

      alert("Atividade excluída com sucesso!");
      iniciarPaginaAtividades();
    }
  });
}

// sessao relatorio   -_____________________________________________________________________________________________________

/*
  Esta função inicializa a página de Relatórios. Ela lê a lista de relatórios diários 
  e de residentes para poder construir a tabela de registros salvos, mostrando a data, 
  o residente, o responsável pelo registro, o medicamento e seu status. Assim como as 
  outras, ela também cria os botões de ação e ativa a funcionalidade de exclusão.
  */

function iniciarPaginaRelatorios() {
  const listaRelatorios = JSON.parse(
    sessionStorage.getItem("listaRelatoriosDiarios") || "[]"
  );
  const listaResidentes = JSON.parse(
    sessionStorage.getItem("listaResidentes") || "[]"
  );

  const tabelaBodyDesktop = document.getElementById("lista-relatorios-body");
  const listaBodyMobile = document.getElementById("lista-relatorios-nova-body");

  if (!tabelaBodyDesktop || !listaBodyMobile) return;

  tabelaBodyDesktop.innerHTML = "";
  listaBodyMobile.innerHTML = "";

  const relatoriosOrdenados = listaRelatorios.slice().reverse();

  if (relatoriosOrdenados.length > 0) {
    relatoriosOrdenados.forEach((relatorio) => {
      const residente = listaResidentes.find(
        (r) => r.id == relatorio.residenteId
      );
      const nomeResidente = residente
        ? `${residente["primeiro-nome"]} ${residente.sobrenome}`
        : "Não encontrado";
      const dataFormatada = new Date(
        relatorio.data + "T00:00:00"
      ).toLocaleDateString("pt-BR");
      const acoesHTML = `
        <a href="cadastros/cadastro-relatorio/index.html?id=${relatorio.id}&origem=pagina-relatorios" class="btn-acao-icone btn-editar" title="Editar Relatório"><i class='bx bxs-pencil'></i></a>
        <a href="#" class="btn-acao-icone btn-excluir" data-id="${relatorio.id}" title="Excluir Relatório"><i class='bx bx-trash-alt'></i></a>
      `;

      let statusHtml = relatorio.statusMedicacao || "N/A";
      let classeStatus = "";
      if (relatorio.statusMedicacao === "Medicado") {
        classeStatus = "status-administrado";
      } else if (relatorio.statusMedicacao === "Não Tomado") {
        // <<< CORRIGIDO
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

  const paginaRelatorios = document.getElementById("pagina-relatorios");

  paginaRelatorios.addEventListener("click", function (event) {
    const botaoExcluir = event.target.closest(".btn-excluir");
    if (!botaoExcluir) return;

    event.preventDefault();
    const idParaExcluir = botaoExcluir.dataset.id;

    if (confirm("Tem certeza que deseja excluir este relatório?")) {
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
  });
}

// sessao adm  -_____________________________________________________________________________________________________
/*
  Esta função inicializa a página de Administração. No momento, sua única 
  funcionalidade é ativar o botão "Sair da conta". Ao ser clicado, ele pede 
  confirmação, limpa toda a memória da sessão (desconectando o usuário) e 
  o redireciona para a página de login.
*/
function iniciarPaginaAdm() {
  const botaoLoginLogout = document.getElementById("btn-logout");
  if (!botaoLoginLogout) return;

  function configurarBotao() {
    botaoLoginLogout.classList.add("opcao-logout");
    botaoLoginLogout.href = "#";
    botaoLoginLogout.removeEventListener("click", handleLogout);
    botaoLoginLogout.addEventListener("click", handleLogout);
  }

  const handleLogout = function (event) {
    event.preventDefault();
    if (confirm("Tem certeza que deseja sair da sua conta?")) {
      sessionStorage.clear();

      window.location.href = "login/index.html";
    }
  };

  configurarBotao();
}

// document da pagina principal ___________________________________________________________________________________
/*
  Este é o bloco de código mais importante para a navegação do site. Ele é executado 
  quando a página principal carrega. Sua principal responsabilidade é gerenciar a 
  troca entre as diferentes "páginas" (Dashboard, Residentes, etc.) do sistema, 
  criando o efeito de transição e ajustando a altura do container. Ele também 
  chama todas as funções 'iniciarPagina...' para garantir que cada seção seja 
  carregada com seus dados corretos.
*/
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

  //CÓDIGO PARA O MENU FLYOUT ____________________________________________________________________________________________
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
      todosOsLinksDoMenu.forEach((item) => {
        if (
          item.classList.contains("item-menu-desktop") &&
          !item.classList.contains("item-menu-mobile")
        ) {
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
      });
    };

    btnMenuFlyout.addEventListener("click", abrirFlyout);
    flyoutBackdrop.addEventListener("click", fecharFlyout);
    flyoutClose.addEventListener("click", fecharFlyout);

    popularMenuFlyout();
  }

  // --- TEXTO DE BOAS-VINDAS NO RESPONSIVO _________________________________________________________________________
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

  // iniciacao __________________________________________________________________________________________________
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

  // --- Buscas para a página de FUNCIONÁRIOS ---
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

  // --- Buscas para a página de RELATÓRIOS ---
  configurarBusca("busca-relatorios-desktop", "lista-relatorios-body", "tr");
  configurarBusca(
    "busca-relatorios-mobile",
    "lista-relatorios-nova-body",
    "li",
    "grid"
  );

  // --- Buscas para a página de ATIVIDADES ---
  configurarBusca("busca-atividades-desktop", "lista-atividades-body", "tr");
  configurarBusca(
    "busca-atividades-mobile",
    "lista-atividades-nova-body",
    "li",
    "grid"
  );

  // --- Buscas para a página de MEDICAMENTOS ---
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
