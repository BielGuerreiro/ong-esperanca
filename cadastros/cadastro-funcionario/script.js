
// ===== FUNÇÕES GLOBAIS DE APOIO _______________________________________________________________________________

// 🔹 Buscar todos os funcionários
async function carregarFuncionarios() {
  try {
    const response = await fetch("http://localhost:3000/funcionarios");
    if (!response.ok) throw new Error("Erro ao buscar funcionários");
    return await response.json();
  } catch (error) {
    console.error("Erro ao carregar funcionários:", error);
    alert("Erro ao carregar lista de funcionários.");
    return [];
  }

}

// 🔹 Criar ou atualizar um funcionário
async function salvarFuncionario(dadosFuncionario, isEditMode = false, id = null) {
  try {
    const url = isEditMode
      ? `http://localhost:3000/funcionarios/${id}` // PUT para editar
      : "http://localhost:3000/funcionarios"; // POST para criar

    const method = isEditMode ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dadosFuncionario),
    });

    if (!response.ok) throw new Error("Erro ao salvar funcionário");

    return await response.json();
  } catch (error) {
    console.error("Erro ao salvar funcionário:", error);
    alert("Erro ao salvar os dados do funcionário.");
  }
}

// Buscar lista de residentes (GET /criancas)
async function carregarResidentes() {
  try {
    const response = await fetch("http://localhost:3000/criancas");
    if (!response.ok) {
      throw new Error("Erro ao buscar residentes");
    }
    return await response.json();
  } catch (error) {
    console.error("Erro ao carregar residentes:", error);
    alert("Erro ao carregar lista de residentes.");
    return [];
  }
}


// 🔹 Excluir funcionário
async function excluirFuncionario(id) {
  try {
    const response = await fetch(`http://localhost:3000/funcionarios/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Erro ao excluir funcionário");
    return true;
  } catch (error) {
    console.error("Erro ao excluir funcionário:", error);
    alert("Erro ao excluir o funcionário.");
    return false;
  }
}

// 🔹 Configurar validação de datas
function configurarValidacaoDatas() {
  const inputsData = document.querySelectorAll('input[type="date"]');
  inputsData.forEach((input) => {
    input.addEventListener("change", () => {
      const dataSelecionada = new Date(input.value);
      const hoje = new Date();
      if (dataSelecionada > hoje) {
        alert("A data não pode ser no futuro!");
        input.value = "";
      }
    });
  });
}

// 🔹 Mostrar/Ocultar senha
function iniciarToggleSenha(inputId, toggleId) {
  const input = document.getElementById(inputId);
  const toggle = document.getElementById(toggleId);
  if (input && toggle) {
    toggle.addEventListener("click", () => {
      const tipo = input.type === "password" ? "text" : "password";
      input.type = tipo;
      toggle.classList.toggle("ativo");
    });
  }
}


//  CÓDIGO PRINCIPAL __________________________________________________________________________
document.addEventListener("DOMContentLoaded", async function () {
  const form = document.getElementById("form-funcionario");
  const etapas = document.querySelectorAll(".etapa-form");
  const botoesProximo = document.querySelectorAll(".btn-proximo");
  const botoesVoltar = document.querySelectorAll(".btn-voltar");
  const botoesCancelar = document.querySelectorAll(".btn-cancelar");
  const botaoSubmit = document.querySelector(".btn-enviar");
  let etapaAtual = 0;


  // --- Seletores para a lógica de Tags ---

  const selectResidenteMultiplo = document.getElementById("residente-select");
  const tagsContainer = document.getElementById("residentes-selecionados-container");
  const hiddenInputIds = document.getElementById("residentes_sob_cuidados");
  let idsSelecionados = [];

  // --- Função para formatar datas no padrão yyyy-MM-dd ---
  function formatarDataParaInput(dataISO) {
    if (!dataISO) return "";
    const d = new Date(dataISO);
    if (isNaN(d)) return "";
    return d.toISOString().split("T")[0];
  }
  // --- Cria e atualiza as tags dos residentes selecionados ---
  function atualizarTags() {
    tagsContainer.innerHTML = "";

    idsSelecionados.forEach((id) => {
      const residente = listaResidentes.find((r) => r.id == id);
      if (!residente) return;

      const tag = document.createElement("div");
      tag.className =
        "tag-residente flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium";

      tag.innerHTML = `
        <span>${residente.primeiro_nome} ${residente.sobrenome}</span>
        <button type="button" class="btn-remover" data-id="${id}">×</button>
      `;

      tagsContainer.appendChild(tag);
    });

    hiddenInputIds.value = idsSelecionados.join(",");
  }

  // --- Evento ao escolher um residente ---
  selectResidenteMultiplo.addEventListener("change", () => {
    const idSelecionado = selectResidenteMultiplo.value;
    if (idSelecionado && !idsSelecionados.includes(idSelecionado)) {
      idsSelecionados.push(idSelecionado);
      atualizarTags();
    }
    selectResidenteMultiplo.value = "";
  });

  // --- Remover tag ---
  tagsContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("btn-remover")) {
      const id = e.target.dataset.id;
      idsSelecionados = idsSelecionados.filter((item) => item != id);
      atualizarTags();
    }
  });

  // 🔹 Carrega lista de residentes do backend
  const listaResidentes = await carregarResidentes();

 // --- Lógica de Edição ---
const urlParams = new URLSearchParams(window.location.search);
const funcionarioId = urlParams.get("id");
const isEditMode = funcionarioId !== null && funcionarioId !== "";

if (isEditMode) {
  console.log("✏️ Modo edição ativo | ID:", funcionarioId);

  const titulo = document.querySelector(".titulo h2");
  if (titulo) titulo.textContent = "Editar Ficha do Funcionário";
  if (botaoSubmit) botaoSubmit.textContent = "SALVAR ALTERAÇÕES";

  try {
    // 🔹 Buscar apenas o funcionário específico
    const response = await fetch(`http://localhost:3000/funcionarios/${funcionarioId}`);
    if (!response.ok) throw new Error("Erro ao buscar funcionário para edição");
    const funcionario = await response.json();
    console.log("📋 Dados carregados para edição:", funcionario);

    // 🔹 Preencher os campos do formulário
    Object.keys(funcionario).forEach((key) => {
      const campo = form.elements[key];
      if (campo) {
        if (key.toLowerCase().includes("data")) {
          // Corrige formato de data
          campo.value = funcionario[key] ? new Date(funcionario[key]).toISOString().split("T")[0] : "";
        } else {
          campo.value = funcionario[key] || "";
        }
      }
    });

    // 🔹 Corrigir seleção do turno
    if (form.elements["turno"]) {
      form.elements["turno"].value = funcionario.turno || "";
    }

    // 🔹 Corrigir residentes sob cuidados
    if (funcionario.residentes_sob_cuidados) {
      idsSelecionados = funcionario.residentes_sob_cuidados.split(",");
      atualizarTags();
    }

  } catch (error) {
    console.error("❌ Erro ao carregar dados para edição:", error);
    alert("Erro ao carregar dados do funcionário.");
  }
}


 // --- Lógica de Salvar ---
form.addEventListener("submit", async function (event) {
  event.preventDefault();
  if (!form.checkValidity()) return;

  const formData = new FormData(form);
  const dadosFuncionario = Object.fromEntries(formData.entries());

  // 🔹 Garante que o turno será enviado corretamente
  const turnoSelect = document.getElementById("turno");
  if (turnoSelect && turnoSelect.value) {
    dadosFuncionario.turno = turnoSelect.value;
  } else {
    dadosFuncionario.turno = "";
  }

  // 🔹 Garante que os IDs de residentes também vão
  dadosFuncionario.residentes_sob_cuidados = hiddenInputIds.value || "";

  console.log("🚀 Dados enviados:", dadosFuncionario); // <-- pra conferir no console

  // 🔹 Envia pro backend
  if (isEditMode) {
    await salvarFuncionario(dadosFuncionario, true, funcionarioId);
    alert("Cadastro de funcionário atualizado com sucesso!");
  } else {
    await salvarFuncionario(dadosFuncionario);
    alert("Funcionário cadastrado com sucesso!");
  }

  const origem = urlParams.get("origem") || "pagina-funcionarios";
  window.location.href = `../../index.html?pagina=${origem}`;
});


  // --- Lógica de Navegação ---
  function mostrarEtapa(i) {
    etapas.forEach((e, idx) => e.classList.toggle("ativo", idx === i));
    etapaAtual = i;
  }

  botoesProximo.forEach((b) =>
    b.addEventListener("click", () => {
      if (etapaAtual < etapas.length - 1) {
        etapaAtual++;
        mostrarEtapa(etapaAtual);
      }
    })
  );

  botoesVoltar.forEach((b) =>
    b.addEventListener("click", () => {
      if (etapaAtual > 0) {
        etapaAtual--;
        mostrarEtapa(etapaAtual);
      }
    })
  );

  botoesCancelar.forEach((b) =>
    b.addEventListener("click", () => {
      if (confirm("Deseja cancelar?")) {
        window.location.href = "../../index.html?pagina=pagina-funcionarios";
      }
    })
  );

  // --- Lógica das Tags ---
  if (selectResidenteMultiplo) {
    listaResidentes.forEach((r) =>
      selectResidenteMultiplo.appendChild(
        new Option(`${r["primeiro_nome"]} ${r.sobrenome}`, r.id)
      )
    );
  }

  function atualizarTags() {
    if (!tagsContainer || !hiddenInputIds) return;
    tagsContainer.innerHTML = "";
    idsSelecionados.forEach((id) => {
      const residente = listaResidentes.find((r) => r.id == id);
      if (residente) {
        const tag = document.createElement("span");
        tag.className = "tag";
        tag.textContent = `${residente["primeiro_nome"]} ${residente.sobrenome}`;
        const removeIcon = document.createElement("i");
        removeIcon.className = "bx bx-x";
        removeIcon.onclick = () => {
          idsSelecionados = idsSelecionados.filter((sid) => sid != id);
          atualizarTags();
        };
        tag.appendChild(removeIcon);
        tagsContainer.appendChild(tag);
      }
    });
    hiddenInputIds.value = idsSelecionados.join(",");
  }

  if (selectResidenteMultiplo) {
    selectResidenteMultiplo.addEventListener("change", function () {
      const id = this.value;
      if (id && !idsSelecionados.includes(id)) {
        idsSelecionados.push(id);
        atualizarTags();
      }
      this.value = "";
    });
  }


  // --- Inicialização ---
  configurarValidacaoDatas();
  iniciarToggleSenha("senha", "toggle-senha-funcionario");
  mostrarEtapa(etapaAtual);
});
