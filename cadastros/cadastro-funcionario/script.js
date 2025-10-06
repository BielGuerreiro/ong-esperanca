// Funções de dados no topo do arquivo
function carregarFuncionarios() {
  return JSON.parse(sessionStorage.getItem("listaFuncionarios") || "[]");
}
function salvarFuncionarios(lista) {
  sessionStorage.setItem("listaFuncionarios", JSON.stringify(lista));
}
function carregarResidentes() {
  return JSON.parse(sessionStorage.getItem("listaResidentes") || "[]");
}

function configurarValidacaoDatas() {
  const hoje = new Date().toISOString().split("T")[0];
  const inputNascimento = document.getElementById("nascimento");
  if (inputNascimento) {
    inputNascimento.max = hoje;
    inputNascimento.min = "1900-01-01";
  }
  const inputAdmissao = document.getElementById("admissao");
  if (inputAdmissao) {
    inputAdmissao.max = "2100-12-31";
    inputAdmissao.min = "1900-01-01";
  }
}

function iniciarToggleSenha(inputId, toggleId) {
  const inputSenha = document.getElementById(inputId);
  const toggleIcon = document.getElementById(toggleId);
  if (inputSenha && toggleIcon) {
    toggleIcon.addEventListener("click", function () {
      const type =
        inputSenha.getAttribute("type") === "password" ? "text" : "password";
      inputSenha.setAttribute("type", type);
      this.classList.toggle("bx-show");
      this.classList.toggle("bx-hide");
    });
  }
}

// ===== CÓDIGO PRINCIPAL DA PÁGINA =====
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("form-funcionario");
  const etapas = document.querySelectorAll(".etapa-form");
  const botoesProximo = document.querySelectorAll(".btn-proximo");
  const botoesVoltar = document.querySelectorAll(".btn-voltar");
  const botoesCancelar = document.querySelectorAll(".btn-cancelar");
  const botaoSubmit = document.querySelector(".btn-enviar");
  let etapaAtual = 0;

  // --- Seletores para a lógica de Tags ---
  const selectResidenteMultiplo = document.getElementById("residente-select");
  const tagsContainer = document.getElementById(
    "residentes-selecionados-container"
  );
  const hiddenInputIds = document.getElementById("residentes_vinculados_ids");
  let idsSelecionados = [];
  const listaResidentes = carregarResidentes(); // Carrega a lista de residentes uma vez

  // --- LÓGICA DE EDIÇÃO (CORRIGIDA E MAIS SEGURA) ---
  const urlParams = new URLSearchParams(window.location.search);
  const funcionarioId = urlParams.get("id");
  const isEditMode = Boolean(funcionarioId);

  if (isEditMode) {
    const titulo = document.querySelector("h2");
    if (titulo) titulo.textContent = "Editar Cadastro de Funcionário";
    if (botaoSubmit) botaoSubmit.textContent = "SALVAR ALTERAÇÕES";

    const listaFuncionarios = carregarFuncionarios();
    const funcionarioParaEditar = listaFuncionarios.find(
      (f) => f.id == funcionarioId
    );

    if (funcionarioParaEditar) {
      Object.keys(funcionarioParaEditar).forEach((key) => {
        const campo = form.elements[key];
        if (campo) {
          campo.value = funcionarioParaEditar[key];
        }
      });

      // CORREÇÃO: Adicionada verificação para evitar erro se não houver residentes vinculados.
      if (
        funcionarioParaEditar.residentes_vinculados_ids &&
        typeof funcionarioParaEditar.residentes_vinculados_ids === "string"
      ) {
        idsSelecionados =
          funcionarioParaEditar.residentes_vinculados_ids.split(",");
        atualizarTags(); // Chama a função para renderizar as tags
      }
    }
  }

  // --- LÓGICA DE SALVAR (UNIFICADA) ---
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!form.checkValidity()) {
      return;
    }

    const listaFuncionarios = carregarFuncionarios();
    const formData = new FormData(form);
    const dadosFuncionario = Object.fromEntries(formData.entries());

    if (isEditMode) {
      // ATUALIZA
      const index = listaFuncionarios.findIndex((f) => f.id == funcionarioId);
      if (index !== -1) {
        listaFuncionarios[index] = {
          ...dadosFuncionario,
          id: parseInt(funcionarioId),
        };
        salvarFuncionarios(listaFuncionarios);
        alert("Cadastro de funcionário atualizado com sucesso!");
      }
    } else {
      // CRIA NOVO
      dadosFuncionario.id = Date.now();
      listaFuncionarios.push(dadosFuncionario);
      salvarFuncionarios(listaFuncionarios);
      alert("Funcionário cadastrado com sucesso!");
    }
    const origem = urlParams.get("origem") || "pagina-funcionarios";
    window.location.href = `../../index.html?pagina=${origem}`;
  });

  // --- LÓGICAS DE NAVEGAÇÃO E INTERAÇÃO ---
  function mostrarEtapa(i) {
    etapas.forEach((e, idx) => e.classList.toggle("ativo", idx === i));
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

  // --- LÓGICA DAS TAGS DE RESIDENTES ---
  if (selectResidenteMultiplo) {
    listaResidentes.forEach((r) =>
      selectResidenteMultiplo.appendChild(
        new Option(`${r["primeiro-nome"]} ${r.sobrenome}`, r.id)
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
        tag.textContent = `${residente["primeiro-nome"]} ${residente.sobrenome}`;
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

  // --- INICIALIZAÇÃO ---
  configurarValidacaoDatas();
  iniciarToggleSenha("senha", "toggle-senha-funcionario");
  mostrarEtapa(etapaAtual);
});
