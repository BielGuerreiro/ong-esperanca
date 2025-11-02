// URL base do backend
const API_URL = "http://localhost:3000/api";

// ===== FUNÇÕES AUXILIARES =====

// Carrega todos os residentes para seleção de participantes
async function carregarResidentes() {
  try {
    const res = await fetch(`${API_URL}/residentes`);
    if (!res.ok) throw new Error("Erro ao buscar residentes");
    return await res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}

// Carrega todas as atividades (para página principal)
async function carregarAtividades() {
  try {
    const res = await fetch(`${API_URL}/atividades`);
    if (!res.ok) throw new Error("Erro ao listar atividades");
    return await res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}

// Busca uma atividade específica pelo ID (edição)
async function buscarAtividadePorId(id) {
  try {
    const res = await fetch(`${API_URL}/atividades/${id}`);
    if (!res.ok) throw new Error("Atividade não encontrada");
    return await res.json();
  } catch (err) {
    console.error(err);
    return null;
  }
}

// ===== CÓDIGO PRINCIPAL =====
document.addEventListener("DOMContentLoaded", async function () {
  const form = document.getElementById("form-atividade");
  const botaoSubmit = document.querySelector(".btn-enviar");
  const botaoCancelar = document.querySelector(".btn-cancelar");
  const selectResidente = document.getElementById("residente-select");
  const tagsContainer = document.getElementById("residentes-selecionados-container");
  const hiddenInputIds = document.getElementById("participantes_ids");

  let idsSelecionados = [];

  // --- Carrega residentes ---
  const listaResidentes = await carregarResidentes();
  if (selectResidente) {
    selectResidente.innerHTML = '<option value="" disabled selected>Selecione um residente</option>';
    listaResidentes.forEach((residente) => {
      const option = new Option(
        `${residente.primeiro_nome} ${residente.sobrenome}`,
        residente.id_residente
      );
      selectResidente.appendChild(option);
    });
  }

  // --- Lógica de edição ---
  const urlParams = new URLSearchParams(window.location.search);
  const atividadeId = urlParams.get("id");
  const isEditMode = Boolean(atividadeId);

  if (isEditMode) {
    const titulo = document.querySelector(".titulo");
    if (titulo) titulo.textContent = "Editar Atividade";
    if (botaoSubmit) botaoSubmit.textContent = "SALVAR ALTERAÇÕES";

    const atividade = await buscarAtividadePorId(atividadeId);
    if (atividade) {
      // Preenche todos os campos do formulário
      form.elements["nome-atividade"].value = atividade.nome_atividade || "";
      form.elements["categoria-atividade"].value = atividade.categoria || "";
      form.elements["local"].value = atividade.local || "";
      form.elements["data"].value = atividade.data ? atividade.data.split("T")[0] : "";
      form.elements["horario"].value = atividade.horario || "";
      form.elements["duracao"].value = atividade.duracao || "";
      form.elements["responsavel-atividade"].value = atividade.responsavel || "";

      // Participantes
      if (atividade.participantes_ids) {
        idsSelecionados = atividade.participantes_ids.split(",");
        atualizarTags();
      }
    }
  }

  // --- Função de atualização das tags ---
  function atualizarTags() {
    if (!tagsContainer || !hiddenInputIds) return;
    tagsContainer.innerHTML = "";
    idsSelecionados.forEach((id) => {
      const residente = listaResidentes.find((r) => String(r.id_residente) === String(id));
      if (residente) {
        const tag = document.createElement("span");
        tag.className = "tag";
        tag.textContent = `${residente.primeiro_nome} ${residente.sobrenome}`;

        const removeIcon = document.createElement("i");
        removeIcon.className = "bx bx-x";
        removeIcon.onclick = () => {
          idsSelecionados = idsSelecionados.filter((selectedId) => selectedId != id);
          atualizarTags();
        };
        tag.appendChild(removeIcon);
        tagsContainer.appendChild(tag);
      }
    });
    hiddenInputIds.value = idsSelecionados.join(",");
  }

  // --- Seleção de residentes ---
  if (selectResidente) {
    selectResidente.addEventListener("change", function () {
      const id = this.value;
      if (id && !idsSelecionados.includes(id)) {
        idsSelecionados.push(id);
        atualizarTags();
      }
      this.value = "";
    });
  }

  // --- Botão cancelar ---
  if (botaoCancelar) {
    botaoCancelar.addEventListener("click", function () {
      if (confirm("Tem certeza que deseja cancelar?")) {
        window.location.href = "../../index.html?pagina=pagina-atividades";
      }
    });
  }

  // --- Lógica de envio ---
  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    if (!form.checkValidity()) {
      alert("Por favor, preencha todos os campos obrigatórios (*).");
      return;
    }

    const formData = new FormData(form);

    // Prepara os dados para envio ao backend
    const dadosAtividade = {
      nome: formData.get("nome-atividade"),
      categoria: formData.get("categoria-atividade"),
      local: formData.get("local"),
      data: formData.get("data"),
      horario: formData.get("horario"),
      duracao: formData.get("duracao"),
      responsavel: formData.get("responsavel-atividade"),
      participantes_ids: idsSelecionados.join(","),
    };

    try {
      let url = `${API_URL}/atividades`;
      let method = "POST";

      if (isEditMode) {
        url = `${API_URL}/atividades/${atividadeId}`;
        method = "PUT";
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosAtividade),
      });

      if (res.ok) {
        alert(isEditMode ? "Atividade atualizada com sucesso!" : "Atividade cadastrada com sucesso!");
        const origem = urlParams.get("origem") || "pagina-atividades";
        window.location.href = `../../index.html?pagina=${origem}`;
      } else {
        const erro = await res.json();
        alert("Erro ao salvar atividade: " + (erro.error || "desconhecido"));
      }
    } catch (err) {
      console.error(err);
      alert("Erro de rede ao salvar atividade.");
    }
  });
});

// ===== Função para inicializar a tabela/lista de atividades =====
async function iniciarPaginaAtividades() {
  const listaAgendamentos = await carregarAtividades();
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

      const dataFormatada = new Date(agendamento.data + "T00:00:00").toLocaleDateString("pt-BR");

      const acoesHTML = `
        <a href="cadastros/cadastro-atividade/index.html?id=${agendamento.id}&origem=pagina-atividades" class="btn-acao-icone btn-editar" title="Editar Atividade"><i class='bx bxs-pencil'></i></a>
        <a href="#" class="btn-acao-icone btn-excluir" data-id="${agendamento.id}" title="Excluir Atividade"><i class='bx bx-trash-alt'></i></a>
      `;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${dataFormatada}</td>
        <td>${agendamento.horario}</td>
        <td>${agendamento.nome_atividade}</td>
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
        <span class="atividade-nome">${agendamento.nome_atividade}</span>
        <div class="atividade-acoes">${acoesHTML}</div>
      `;
      listaBodyMobile.appendChild(li);
    });
  } else {
    tabelaBodyDesktop.innerHTML = `<tr><td colspan="6" style="text-align:center;">Nenhuma atividade agendada.</td></tr>`;
    listaBodyMobile.innerHTML = `<li style="display: block; text-align: center; background: none; color: var(--secondary-color);">Nenhuma atividade agendada.</li>`;
  }

  // --- Botão excluir ---
  const paginaAtividades = document.getElementById("pagina-atividades");
  if (paginaAtividades) {
    paginaAtividades.addEventListener("click", async function (event) {
      const botaoExcluir = event.target.closest(".btn-excluir");
      if (!botaoExcluir) return;

      event.preventDefault();
      const idParaExcluir = botaoExcluir.dataset.id;

      if (confirm(`Tem certeza que deseja excluir a atividade?`)) {
        try {
          const res = await fetch(`${API_URL}/atividades/${idParaExcluir}`, { method: "DELETE" });
          if (res.ok) {
            alert("Atividade excluída com sucesso!");
            iniciarPaginaAtividades();
          } else {
            const erro = await res.json();
            alert("Erro ao excluir: " + (erro.error || "desconhecido"));
          }
        } catch (err) {
          console.error(err);
          alert("Erro de rede ao excluir atividade.");
        }
      }
    });
  }
}

// Inicializa lista de atividades na página principal
if (document.getElementById("pagina-atividades")) {
  iniciarPaginaAtividades();
}
