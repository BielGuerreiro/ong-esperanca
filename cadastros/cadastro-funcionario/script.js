function carregarFuncionarios() {
  const dados = sessionStorage.getItem("listaFuncionarios");
  return JSON.parse(dados || "[]");
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

  configurarValidacaoDatas();
  iniciarToggleSenha("senha", "toggle-senha-funcionario");

  // --- LÓGICA DE EDIÇÃO (CORRIGIDA) ---
  const urlParams = new URLSearchParams(window.location.search);
  const funcionarioId = urlParams.get("id");
  const isEditMode = Boolean(funcionarioId);

  if (isEditMode) {
    // Ajusta a interface para o modo de edição
    const titulo = document.querySelector("h2");
    if (titulo) titulo.textContent = "Editar Cadastro de Funcionário";
    if (botaoSubmit) botaoSubmit.textContent = "SALVAR ALTERAÇÕES";

    const listaFuncionarios = carregarFuncionarios();
    const funcionarioParaEditar = listaFuncionarios.find(
      (f) => f.id == funcionarioId
    );

    if (funcionarioParaEditar) {
      // Preenche os campos do formulário com os dados existentes
      Object.keys(funcionarioParaEditar).forEach((key) => {
        // Usamos form.elements[key] que é mais robusto
        const campo = form.elements[key];
        if (campo) {
          campo.value = funcionarioParaEditar[key];
        }
      });
      // Preenche as tags dos residentes vinculados, se houver
      if (funcionarioParaEditar.residentes_vinculados_ids) {
        idsSelecionados =
          funcionarioParaEditar.residentes_vinculados_ids.split(",");
        atualizarTags();
      }
    }
    // As linhas que desabilitavam os campos e escondiam o botão foram REMOVIDAS.
  }

  // --- LÓGICA DE SALVAR (UNIFICADA PARA CRIAR E EDITAR) ---
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!form.checkValidity()) {
      alert("Por favor, preencha todos os campos obrigatórios (*).");
      return;
    }

    const listaFuncionarios = carregarFuncionarios();
    const formData = new FormData(form);
    const dadosFuncionario = Object.fromEntries(formData.entries());

    if (isEditMode) {
      // SE ESTIVER EDITANDO, ATUALIZA O FUNCIONÁRIO
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
      // SE FOR NOVO, CRIA UM NOVO FUNCIONÁRIO (seu código original)
      dadosFuncionario.id = Date.now();
      listaFuncionarios.push(dadosFuncionario);
      salvarFuncionarios(listaFuncionarios);
      alert("Funcionário cadastrado com sucesso!");
    }

    // Redireciona para a página de origem
    const origem = urlParams.get("origem") || "pagina-funcionarios";
    window.location.href = `../../index.html?pagina=${origem}`;
  });

  // --- RESTANTE DO SEU CÓDIGO ORIGINAL (sem alterações) ---
  function mostrarEtapa(indiceEtapa) {
    etapas.forEach((etapa, indice) =>
      etapa.classList.toggle("ativo", indice === indiceEtapa)
    );
  }
  botoesProximo.forEach((botao) => {
    botao.addEventListener("click", () => {
      if (etapaAtual < etapas.length - 1) {
        etapaAtual++;
        mostrarEtapa(etapaAtual);
      }
    });
  });
  botoesVoltar.forEach((botao) => {
    botao.addEventListener("click", () => {
      if (etapaAtual > 0) {
        etapaAtual--;
        mostrarEtapa(etapaAtual);
      }
    });
  });
  botoesCancelar.forEach((botao) => {
    botao.addEventListener("click", function () {
      if (confirm("Tem certeza que deseja cancelar?")) {
        window.location.href = "../../index.html";
      }
    });
  });

  const selectResidenteMultiplo = document.getElementById("residente-select");
  const tagsContainer = document.getElementById(
    "residentes-selecionados-container"
  );
  const hiddenInputIds = document.getElementById("residentes_vinculados_ids");
  let idsSelecionados = [];

  const listaResidentes = carregarResidentes();
  if (selectResidenteMultiplo) {
    listaResidentes.forEach((residente) => {
      const option = new Option(
        `${residente["primeiro-nome"]} ${residente.sobrenome}`,
        residente.id
      );
      selectResidenteMultiplo.appendChild(option);
    });
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
          idsSelecionados = idsSelecionados.filter(
            (selectedId) => selectedId != id
          );
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

  if (botaoSubmit) {
    botaoSubmit.addEventListener("click", function () {
      form.classList.add("form-foi-validado");
      if (!form.checkValidity()) {
        alert(
          "Por favor, preencha todos os campos obrigatórios (*) antes de prosseguir."
        );
      }
    });
  }

  mostrarEtapa(etapaAtual);
});
