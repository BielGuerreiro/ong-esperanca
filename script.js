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

// NOVA FUNÇÃO PARA SAUDAÇÃO DINÂMICA
function atualizarSaudacao() {
  const elementoSaudacao = document.getElementById("mensagem-saudacao");
  if (!elementoSaudacao) return; // Se não encontrar o elemento, não faz nada

  const horaAtual = new Date().getHours();
  let saudacao = "";

  if (horaAtual >= 5 && horaAtual < 12) {
    saudacao = "Bom dia";
  } else if (horaAtual >= 12 && horaAtual < 18) {
    saudacao = "Boa tarde";
  } else {
    saudacao = "Boa noite";
  }

  // Futuramente, você pode pegar o nome do usuário logado da memória
  // Ex: const nomeUsuario = sessionStorage.getItem("usuarioLogado") || "Usuário";
  const nomeUsuario = "Usuário"; // Por enquanto, usamos um nome padrão

  elementoSaudacao.textContent = `Olá, ${saudacao}, ${nomeUsuario}!`;
}


// Funções Globais_______________________________________________________________________________
/*
  ... (suas funções calcularIdade e definirCategoria ficam aqui) ...
*/



// tabela dashboard ______________________________________________________________________________________________________________
/*
  Esta função inicializa a página de Dashboard. Ela é responsável por calcular e exibir 
  os números nos cards de resumo (total de residentes, medicamentos pendentes e atividades 
  de hoje). Além disso, ela cria a lista de residentes à esquerda e prepara a área 
  dos gráficos, definindo que, ao clicar em um residente, os gráficos de atividades 
  e medicamentos sejam gerados e exibidos na tela.
*/
let graficoAtividades = null;
let graficoMedicamentos = null;

async function iniciarPaginaDashboard() {
  atualizarSaudacao();

  let listaResidentes = [];
try {
  const resposta = await fetch("http://localhost:3000/criancas");
  if (resposta.ok) {
    listaResidentes = await resposta.json();
  } else {
    console.error("Erro ao buscar residentes:", resposta.status);
  }
} catch (erro) {
    console.error("Erro de conexão com o servidor:", erro);
}

  const listaTratamentos = JSON.parse(
    sessionStorage.getItem("listaTratamentos") || "[]"
  );


  let listaAtividades = [];
try {
  const respostaAtividades = await fetch("http://localhost:3000/atividades");
  if (respostaAtividades.ok) {
    listaAtividades = await respostaAtividades.json();
  } else {
    console.error("Erro ao buscar atividades:", respostaAtividades.status);
  }
} catch (erro) {
  console.error("Erro de conexão com o servidor de atividades:", erro);
}


  const contadorResidentesEl = document.getElementById("total-residentes");
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
  try {
    const respostaMedicamentos = await fetch("http://localhost:3000/medicamentos/count");
    if (respostaMedicamentos.ok) {
      const dados = await respostaMedicamentos.json();
      contadorMedicamentosEl.textContent = dados.total ?? dados.count ?? 0;
    } else {
      console.error("Erro ao buscar contagem de medicamentos:", respostaMedicamentos.status);
      contadorMedicamentosEl.textContent = "0";
    }
  } catch (erro) {
    console.error("Erro de conexão com o servidor de medicamentos:", erro);
    contadorMedicamentosEl.textContent = "0";
  }
}

  if (contadorAtividadesEl) {
  try {
    const respostaCount = await fetch("http://localhost:3000/atividades/count");
    if (respostaCount.ok) {
      const dados = await respostaCount.json();
      contadorAtividadesEl.textContent = dados.total; // ← mostra o número total de atividades
    } else {
      console.error("Erro ao buscar contagem de atividades:", respostaCount.status);
    }
  } catch (erro) {
    console.error("Erro de conexão com o servidor de atividades:", erro);
  }
}

  if (listaResidentesDashboard) {
    listaResidentesDashboard.innerHTML = "";
    listaResidentes.forEach((residente) => {
      const li = document.createElement("li");
      li.textContent = `${residente["primeiro_nome"]} ${residente.sobrenome}`;
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
/*
  Esta função inicializa a página de Residentes. Ela busca a lista de residentes salvos 
  na memória, e então cria dinamicamente a tabela que é exibida na tela, adicionando 
  uma linha para cada residente com suas informações (nome, idade, etc.) e os botões 
  de ação (editar e excluir). Ela também ativa a funcionalidade do botão de excluir.
*/
// Substitua TODA a sua função 'iniciarPaginaResidentes' por esta:

async function iniciarPaginaResidentes() {
  try {
    // 🔹 1. Busca a lista direto do banco de dados via backend
    const resposta = await fetch("http://localhost:3000/criancas"); // <-- rota do backend
    const listaResidentes = await resposta.json();

    // Pega os containers dos DOIS layouts
    const tabelaBodyDesktop = document.getElementById("lista-residentes-body");
    const listaBodyMobile = document.getElementById("lista-residentes-nova-body");

    if (!tabelaBodyDesktop || !listaBodyMobile) return;

    // Limpa ambos os containers
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
          <a href="cadastros/cadastro-residente/index.html?id=${residente.id}&origem=pagina-residentes" 
             class="btn-acao-icone btn-editar" title="Editar Ficha">
             <i class='bx bxs-pencil'></i>
          </a>
          <a href="#" class="btn-acao-icone btn-excluir" 
             data-id="${residente.id}" title="Excluir Ficha">
             <i class='bx bx-trash-alt'></i>
          </a>
        `;

        // Linha para o layout Desktop
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${nomeCompleto}</td>
          <td>${idade}</td>
          <td>${sexoFormatado}</td>
          <td>${categoria}</td>
          <td class="acoes">${acoesHTML}</td>
        `;
        tabelaBodyDesktop.appendChild(tr);

        // Item para o layout Mobile
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

    // 🔹 Listener de exclusão (funciona em desktop e mobile)
    const paginaResidentes = document.getElementById("pagina-residentes");

    paginaResidentes.addEventListener("click", async function (event) {
      const botaoExcluir = event.target.closest(".btn-excluir");
      if (!botaoExcluir) return; // Se não clicou no botão de excluir, ignora

      event.preventDefault();
      const idParaExcluir = botaoExcluir.dataset.id;

      // Encontra o nome do residente
      const itemPai = botaoExcluir.closest("tr") || botaoExcluir.closest("li");
      const nomeDoResidente = itemPai.querySelector("td:first-child, .residente-nome").textContent;

      if (confirm(`Tem certeza que deseja excluir o residente "${nomeDoResidente}"?`)) {
        try {
          const response = await fetch(`http://localhost:3000/criancas/${idParaExcluir}`, {
            method: "DELETE",
          });

          if (!response.ok) {
            throw new Error("Erro ao excluir residente no servidor");
          }

          const result = await response.json();
          alert(result.message || "Residente excluído com sucesso!");

          // Recarrega a lista atualizada
          await iniciarPaginaResidentes();
        } catch (error) {
          console.error("Erro ao excluir residente:", error);
          alert("Falha ao excluir residente!");
        }
      }
    });
  } catch (error) {
    console.error("Erro ao carregar residentes:", error);
  }
}



// tabela funcionario ______________________________________________________________________________________________________________
/*
  Esta função inicializa a página de Funcionários. Assim como a de residentes, ela 
  lê a lista de funcionários salvos e constrói a tabela na tela, mostrando 
  informações como nome, turno, e status de cada um. Ela também cria os links 
  corretos para a edição de cada ficha e ativa a funcionalidade do botão de excluir.
*/
async function iniciarPaginaFuncionarios() {
  const tabelaBodyDesktop = document.getElementById("lista-funcionarios-body");
  const listaBodyMobile = document.getElementById("lista-funcionarios-nova-body");

  if (!tabelaBodyDesktop || !listaBodyMobile) return;

  tabelaBodyDesktop.innerHTML = "";
  listaBodyMobile.innerHTML = "";

  try {
    const response = await fetch("http://localhost:3000/funcionarios");
    if (!response.ok) throw new Error("Erro ao carregar funcionários");
    const listaFuncionarios = await response.json();

    if (listaFuncionarios.length === 0) {
      tabelaBodyDesktop.innerHTML = `<tr><td colspan="5" style="text-align: center;">Nenhum funcionário cadastrado.</td></tr>`;
      listaBodyMobile.innerHTML = `<li style="display: block; text-align: center;">Nenhum funcionário cadastrado.</li>`;
      return;
    }

    // Função para converter turno em horário
function definirHorario(turno) {
  if (!turno) return "N/A";

  // Se já vier algo como "Manhã (06:00 - 14:00)", extrai o range
  const textoOriginal = String(turno);
  const jaTemHorario = textoOriginal.match(/\b\d{2}:\d{2}\s*-\s*\d{2}:\d{2}\b/);
  if (jaTemHorario) return jaTemHorario[0];

  // Normaliza para comparar sem acentos
  const t = textoOriginal
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();

  if (t.includes("Manhã (06:00 - 14:00)")) return "06:00 - 14:00";
  if (t.includes("Tarde (14:00 - 22:00)")) return "14:00 - 22:00";
  if (t.includes("Noite (22:00 - 06:00)")) return "22:00 - 06:00";

  return "N/A";
}


    listaFuncionarios.forEach((funcionario) => {
      const nomeCompleto = `${funcionario.primeiro_nome || ""} ${funcionario.sobrenome || ""}`.trim();
      const horario = definirHorario(funcionario.turno);
      const status = funcionario.status ? funcionario.status.toLowerCase() : "pendente";
      let classeStatus = "";

      switch (status) {
        case "trabalhando":
        case "ativo":
          classeStatus = "status-trabalhando"; // Verde
          break;
        case "folga":
          classeStatus = "status-folga"; // Cinza
          break;
        case "falta":
        case "inativo":
          classeStatus = "status-falta"; // Vermelho
          break;
        default:
          classeStatus = "status-pendente"; // Amarelo
          break;
      }


      const statusHTML = `<span class="status ${classeStatus}">${funcionario.status || "Pendente"}</span>`;

    const acoesHTML = `
      <a href="cadastros/cadastro-funcionario/index.html?id=${funcionario.id}&origem=pagina-funcionarios" 
        class="btn-acao-icone btn-editar" title="Editar Ficha">
        <i class='bx bxs-pencil'></i>
      </a>
      <a href="#" class="btn-acao-icone btn-excluir" data-id="${funcionario.id}" title="Excluir Ficha">
        <i class='bx bx-trash-alt'></i>
      </a>
    `;


      // Linha da tabela desktop
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${horario}</td>
        <td>${nomeCompleto}</td>
        <td>${String(funcionario.id).slice(-4)}</td>
        <td>${statusHTML}</td>
        <td class="acoes">${acoesHTML}</td>
      `;
      tabelaBodyDesktop.appendChild(tr);

      // Item da lista mobile
      const li = document.createElement("li");
      li.innerHTML = `
        <span class="funcionario-nome">${nomeCompleto}</span>
        <div class="funcionario-status">${statusHTML}</div>
        <div class="funcionario-acoes">${acoesHTML}</div>
      `;
      listaBodyMobile.appendChild(li);
    });

    // Excluir funcionário
    const paginaFuncionarios = document.getElementById("pagina-funcionarios");
    paginaFuncionarios.addEventListener("click", async function (event) {
      const botaoExcluir = event.target.closest(".btn-excluir");
      if (!botaoExcluir) return;

      event.preventDefault();
      const idParaExcluir = botaoExcluir.dataset.id;
      const nomeDoFuncionario = botaoExcluir
        .closest("tr, li")
        .querySelector("td:nth-child(2), .funcionario-nome").textContent;

      if (confirm(`Tem certeza que deseja excluir o funcionário "${nomeDoFuncionario}"?`)) {
        const resp = await fetch(`http://localhost:3000/funcionarios/${idParaExcluir}`, { method: "DELETE" });
        if (resp.ok) {
          alert("Funcionário excluído com sucesso!");
          iniciarPaginaFuncionarios();
        } else {
          alert("Erro ao excluir funcionário.");
        }
      }
    });
  } catch (error) {
    console.error("Erro ao carregar funcionários:", error);
  }
}



// tabela responsavel  ______________________________________________________________________________________________________________
/*
  Esta função inicializa a página de Responsáveis. Ela lê a lista de responsáveis e 
  de residentes para poder exibir a tabela completa, mostrando qual residente está 
  vinculado a qual responsável. Assim como as outras, ela também cria os botões 
  de ação (editar/excluir) e ativa a funcionalidade de exclusão.
*/
async function iniciarPaginaResponsaveis() {
  const tabelaBodyDesktop = document.getElementById("lista-responsaveis-body");
  const listaBodyMobile = document.getElementById("lista-responsaveis-nova-body");

  if (!tabelaBodyDesktop || !listaBodyMobile) return;

  tabelaBodyDesktop.innerHTML = "";
  listaBodyMobile.innerHTML = "";

  try {
    // Busca responsáveis e residentes direto do backend
    const respostaResponsaveis = await fetch("http://localhost:3000/responsaveis");
    const respostaResidentes = await fetch("http://localhost:3000/criancas");

    if (!respostaResponsaveis.ok || !respostaResidentes.ok)
      throw new Error("Erro ao buscar dados do servidor.");

    const listaResponsaveis = await respostaResponsaveis.json();
    const listaResidentes = await respostaResidentes.json();

    if (listaResponsaveis.length > 0) {
      listaResponsaveis.forEach((responsavel) => {
        const idade = calcularIdade(responsavel.data_nascimento);
        const categoria = definirCategoria(idade);
        const nomeCompleto = `${responsavel.nome || responsavel.primeiro_nome || ""} ${responsavel.sobrenome || ""}`.trim();
        const parentesco = responsavel.parentesco || "—";

        // Vincula o residente
        const residenteVinculado = listaResidentes.find(
          (r) => r.id == responsavel.id_crianca
        );
        const nomeResidente = residenteVinculado
          ? `${residenteVinculado.primeiro_nome} ${residenteVinculado.sobrenome}`
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
  } catch (erro) {
    console.error("Erro ao carregar responsáveis:", erro);
    tabelaBodyDesktop.innerHTML = `<td colspan="6" style="text-align:center; color:red;">Erro ao carregar responsáveis.</td>`;
  }

  // --- Ações de excluir ---
  const paginaResponsaveis = document.getElementById("pagina-responsavel");

  paginaResponsaveis.addEventListener("click", async function (event) {
    const botaoExcluir = event.target.closest(".btn-excluir");
    if (!botaoExcluir) return;

    event.preventDefault();
    const idParaExcluir = botaoExcluir.dataset.id;

    const itemPai = botaoExcluir.closest("tr") || botaoExcluir.closest("li");
    const nomeDoResponsavel = itemPai.querySelector(
      "td:first-child, .responsavel-nome"
    ).textContent;

    if (confirm(`Tem certeza que deseja excluir o responsável "${nomeDoResponsavel}"?`)) {
      try {
        const resposta = await fetch(`http://localhost:3000/responsaveis/${idParaExcluir}`, {
          method: "DELETE",
        });
        if (resposta.ok) {
          alert("Responsável excluído com sucesso!");
          iniciarPaginaResponsaveis();
        } else {
          alert("Erro ao excluir o responsável.");
        }
      } catch (erro) {
        console.error("Erro ao excluir:", erro);
        alert("Falha ao excluir o responsável.");
      }
    }
  });
}


// sessao medicamento -_____________________________________________________________________________________________________
/*
  Esta função inicializa a página de Medicamentos. Ela busca a lista de tratamentos e 
  de residentes para montar a tabela de agendamentos de medicação. Para cada item, 
  ela exibe o horário, o residente, o medicamento e o status (Pendente ou Administrado),
  junto com os botões de editar e excluir, e ativa a função de exclusão.
*/
async function iniciarPaginaMedicamentos() {
  try {
    const resposta = await fetch("http://localhost:3000/medicamentos");
    const listaMedicamentos = await resposta.json();

    const tabelaBodyDesktop = document.getElementById("lista-medicamentos-body");
    if (!tabelaBodyDesktop) return;
    tabelaBodyDesktop.innerHTML = "";

    if (listaMedicamentos.length === 0) {
      tabelaBodyDesktop.innerHTML = `<tr><td colspan="8" style="text-align:center;">Nenhum medicamento cadastrado.</td></tr>`;
      return;
    }

    listaMedicamentos.forEach((med) => {
      const nomeResidente = `${med.primeiro_nome || ""} ${med.sobrenome || ""}`.trim();
      const validadeFormatada = med.validade
        ? new Date(med.validade).toLocaleDateString("pt-BR")
        : "N/A";

      const status = med.status || "Pendente";
      const classeStatus = `status-${status.toLowerCase()}`;
      const statusHTML = `<span class="status ${classeStatus}">${status}</span>`;

      const acoesHTML = `
        <a href="cadastros/cadastro-medicamento/index.html?id=${med.id}&origem=pagina-medicamentos" 
           class="btn-acao-icone btn-editar" title="Editar Medicamento">
           <i class='bx bxs-pencil'></i>
        </a>
        <a href="#" class="btn-acao-icone btn-excluir" data-id="${med.id}" title="Excluir Medicamento">
           <i class='bx bx-trash-alt'></i>
        </a>
      `;

      // 🧠 Ordem corrigida das colunas
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${med.horario || "N/A"}</td>
        <td>${nomeResidente || "N/A"}</td>
        <td>${med.medicamento || "N/A"}</td>
        <td>${med.dosagem || "N/A"}</td>
        <td>${med.tipo || "N/A"}</td>
        <td>${med.frequencia || "N/A"}</td>
        <td>${statusHTML}</td>
        <td class="acoes">${acoesHTML}</td>
      `;
      tabelaBodyDesktop.appendChild(tr);
    });
  } catch (error) {
    console.error("Erro ao carregar medicamentos:", error);
  }
}




// sessao atividades  -_____________________________________________________________________________________________________
/*
  Esta função inicializa a página de Atividades. Ela contém uma sub-função 'renderizarTabela' 
  que é responsável por ler os agendamentos de atividades e construir a tabela na tela, 
  mostrando data, horário, nome da atividade, status, etc. A função também ativa a 
  funcionalidade do botão de excluir, que ao ser clicado, remove o item e redesenha a 
  tabela para refletir a mudança instantaneamente.
*/
async function iniciarPaginaAtividades() {
  try {
    // 🔹 1. Busca a lista direto do backend
    const resposta = await fetch("http://localhost:3000/atividades");
    const listaAgendamentos = await resposta.json();

    const tabelaBodyDesktop = document.getElementById("lista-atividades-body");
    const listaBodyMobile = document.getElementById("lista-atividades-nova-body");
    if (!tabelaBodyDesktop || !listaBodyMobile) return;

    // Limpa os containers
    tabelaBodyDesktop.innerHTML = "";
    listaBodyMobile.innerHTML = "";

    if (listaAgendamentos.length === 0) {
      tabelaBodyDesktop.innerHTML = `<tr><td colspan="6" style="text-align:center;">Nenhuma atividade agendada.</td></tr>`;
      listaBodyMobile.innerHTML = `<li style="display:block; text-align:center; color: var(--secondary-color);">Nenhuma atividade agendada.</li>`;
      return;
    }

    listaAgendamentos.forEach((agendamento) => {
      const status = agendamento.status || "Agendada";
      const classeStatus = `status-${status.toLowerCase()}`;
      const statusHTML = `<span class="status ${classeStatus}">${status}</span>`;

      const dataFormatada = agendamento.data ? new Date(agendamento.data).toLocaleDateString("pt-BR") : "N/A";
      const horarioFormatado = agendamento.horario || "N/A";
      const nomeAtividade = agendamento.nome_atividade || "N/A";
      const duracao = agendamento.duracao || "N/A";

      const acoesHTML = `
        <a href="cadastros/cadastro-atividade/index.html?id=${agendamento.id}&origem=pagina-atividades" 
           class="btn-acao-icone btn-editar" title="Editar Atividade">
           <i class='bx bxs-pencil'></i>
        </a>
        <a href="#" class="btn-acao-icone btn-excluir" data-id="${agendamento.id}" title="Excluir Atividade">
           <i class='bx bx-trash-alt'></i>
        </a>
      `;

      // Linha Desktop
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${dataFormatada}</td>
        <td>${horarioFormatado}</td>
        <td>${nomeAtividade}</td>
        <td>${duracao}</td>
        <td>${statusHTML}</td>
        <td class="acoes">${acoesHTML}</td>
      `;
      tabelaBodyDesktop.appendChild(tr);

      // Item Mobile
      const li = document.createElement("li");
      li.innerHTML = `
        <div class="atividade-data-hora">
          <span class="data">${dataFormatada}</span>
          <span class="hora">${horarioFormatado}</span>
        </div>
        <span class="atividade-nome">${nomeAtividade}</span>
        <div class="atividade-acoes">${acoesHTML}</div>
      `;
      listaBodyMobile.appendChild(li);
    });

    // 🔹 Listener de exclusão (desktop e mobile)
    const paginaAtividades = document.getElementById("pagina-atividades");
    paginaAtividades.addEventListener("click", async function (event) {
      const botaoExcluir = event.target.closest(".btn-excluir");
      if (!botaoExcluir) return;

      event.preventDefault();
      const idParaExcluir = botaoExcluir.dataset.id;

      const itemPai = botaoExcluir.closest("tr") || botaoExcluir.closest("li");
      const nomeAtividade = itemPai.querySelector("td:nth-child(3), .atividade-nome")?.textContent || "N/A";

      if (confirm(`Tem certeza que deseja excluir a atividade "${nomeAtividade}"?`)) {
        try {
          const response = await fetch(`http://localhost:3000/atividades/${idParaExcluir}`, {
            method: "DELETE",
          });

          if (!response.ok) throw new Error("Erro ao excluir atividade no servidor");

          const result = await response.json();
          alert(result.message || "Atividade excluída com sucesso!");

          // Recarrega a lista atualizada
          await iniciarPaginaAtividades();
        } catch (error) {
          console.error("Erro ao excluir atividade:", error);
          alert("Falha ao excluir atividade!");
        }
      }
    });
  } catch (error) {
    console.error("Erro ao carregar atividades:", error);
  }
}


// sessao relatorio   -_____________________________________________________________________________________________________
/*
  Esta função inicializa a página de Relatórios. Ela lê a lista de relatórios diários 
  e de residentes para poder construir a tabela de registros salvos, mostrando a data, 
  o residente, o responsável pelo registro, o medicamento e seu status. Assim como as 
  outras, ela também cria os botões de ação e ativa a funcionalidade de exclusão.
*/
async function iniciarPaginaRelatorios() {
  try {
    // 🔹 Busca os relatórios e residentes do backend
    const [listaRelatorios, listaResidentes] = await Promise.all([
      fetch("http://localhost:3000/relatorio").then((res) => res.json()),
      fetch("http://localhost:3000/criancas").then((res) => res.json()),
    ]);

    const tabelaBodyDesktop = document.getElementById("lista-relatorios-body");
    const listaBodyMobile = document.getElementById("lista-relatorios-nova-body");
    if (!tabelaBodyDesktop || !listaBodyMobile) return;

    tabelaBodyDesktop.innerHTML = "";
    listaBodyMobile.innerHTML = "";

    const relatoriosOrdenados = listaRelatorios.slice().reverse();

    if (relatoriosOrdenados.length > 0) {
      relatoriosOrdenados.forEach((relatorio) => {
        const residente = listaResidentes.find((r) => r.id == relatorio.id_residente);
        const nomeResidente = residente
          ? `${residente["primeiro_nome"]} ${residente.sobrenome}`
          : "Não encontrado";

        const dataFormatada =relatorio.data && relatorio.data !== "0000-00-00"
          ? new Date(relatorio.data.replace(/-/g, "/")).toLocaleDateString("pt-BR")
          : "Sem data";



        // 🔹 Corrigido o link de edição (id certo e query correta)
        const acoesHTML = `
          <a href="cadastros/cadastro-relatorio/index.html?id_relatorio=${relatorio.id_relatorio}&origem=pagina-relatorios" 
             class="btn-acao-icone btn-editar" 
             title="Editar Relatório">
             <i class='bx bxs-pencil'></i>
          </a>
          <a href="#" class="btn-acao-icone btn-excluir" data-id="${relatorio.id_relatorio}" title="Excluir Relatório">
            <i class='bx bx-trash-alt'></i>
          </a>
        `;

        // 🔹 Converte o valor booleano para texto e classe
        let statusTexto = "N/A";
        let classeStatus = "";

        if (relatorio.medicacao_confirmada === 1 || relatorio.medicacao_confirmada === "1") {
          statusTexto = "Medicado";
          classeStatus = "status-administrado";
        } else if (relatorio.medicacao_confirmada === 0 || relatorio.medicacao_confirmada === "0") {
          statusTexto = "Não Medicado";
          classeStatus = "status-nao-tomado";
        }

        const statusHtml = `<span class="status ${classeStatus}">${statusTexto}</span>`;

        // 🔹 Linha da tabela (desktop)
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${dataFormatada}</td>
          <td>${nomeResidente}</td>
          <td>${relatorio.medicamento || "Nenhum"}</td>
          <td>${relatorio.responsavel || "Sem responsável"}</td>
          <td>${statusHtml}</td>
          <td class="acoes">${acoesHTML}</td>
        `;
        tabelaBodyDesktop.appendChild(tr);

        // 🔹 Item da lista (mobile)
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

    // ========================== EXCLUSÃO VIA BACKEND ==========================
    const paginaRelatorios = document.getElementById("pagina-relatorios");
    paginaRelatorios.addEventListener("click", async function (event) {
      const botaoExcluir = event.target.closest(".btn-excluir");
      if (!botaoExcluir) return;

      event.preventDefault();
      const idParaExcluir = botaoExcluir.dataset.id;

      if (confirm("Tem certeza que deseja excluir este relatório?")) {
        try {
          const response = await fetch(`http://localhost:3000/relatorio/${idParaExcluir}`, {
            method: "DELETE",
          });
          if (!response.ok) throw new Error("Erro ao excluir relatório");
          alert("Relatório excluído com sucesso!");
          iniciarPaginaRelatorios(); // Recarrega a lista
        } catch (error) {
          console.error("Erro ao excluir relatório:", error);
          alert("Não foi possível excluir o relatório.");
        }
      }
    });
  } catch (error) {
    console.error("Erro ao carregar página de relatórios:", error);
    alert("Erro ao carregar a lista de relatórios.");
  }
}



// sessao adm  -_____________________________________________________________________________________________________
/*
  Esta função inicializa a página de Administração. No momento, sua única 
  funcionalidade é ativar o botão "Sair da conta". Ao ser clicado, ele pede 
  confirmação, limpa toda a memória da sessão (desconectando o usuário) e 
  o redireciona para a página de login.
*/
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

      document.body.className = "";
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

    // Adiciona os eventos
    btnMenuFlyout.addEventListener("click", abrirFlyout);
    flyoutBackdrop.addEventListener("click", fecharFlyout);
    flyoutClose.addEventListener("click", fecharFlyout);

    popularMenuFlyout();
  }

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

  // texto de boas vinda no responsivo _______________________________________________________________________________________________
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
});

// LÓGICA PARA O MODO ESCURO ________________________________________________________________________________________

// Este código deve rodar depois que a página carregou
document.addEventListener("DOMContentLoaded", () => {
  const darkModeToggle = document.getElementById("dark-mode-toggle");
  const body = document.body;

  // Função para aplicar o tema
  const aplicarTema = (tema) => {
    const textoDoSwitch = document.getElementById("dark-mode-text");
    const iconeDoSwitch = document.querySelector(".opcao-dark-mode .bx");

    if (tema === "dark") {
      body.classList.add("dark-mode");
      darkModeToggle.checked = true;
      textoDoSwitch.textContent = "Modo Claro"; // Muda o texto
      iconeDoSwitch.classList.replace("bx-moon", "bx-sun"); // Troca ícone para sol
    } else {
      body.classList.remove("dark-mode");
      darkModeToggle.checked = false;
      textoDoSwitch.textContent = "Modo Escuro"; // Volta o texto
      iconeDoSwitch.classList.replace("bx-sun", "bx-moon"); // Troca ícone para lua
    }
  };

  // 1. Verifica se já existe um tema salvo no navegador
  const temaSalvo = localStorage.getItem("theme");

  // Se existir, aplica o tema salvo. Senão, usa o tema padrão (claro).
  if (temaSalvo) {
    aplicarTema(temaSalvo);
  } else {
    aplicarTema("light");
  }

  // 2. Adiciona o "ouvinte" para o clique no interruptor
  darkModeToggle.addEventListener("change", () => {
    let novoTema;
    if (darkModeToggle.checked) {
      novoTema = "dark";
    } else {
      novoTema = "light";
    }

    // Aplica o novo tema e salva a escolha no navegador
    aplicarTema(novoTema);
    localStorage.setItem("theme", novoTema);
  });
});
