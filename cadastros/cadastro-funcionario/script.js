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

  const urlParams = new URLSearchParams(window.location.search);
  const funcionarioId = urlParams.get("id");
  if (funcionarioId) {
    const listaFuncionarios = carregarFuncionarios();
    const funcionario = listaFuncionarios.find((f) => f.id == funcionarioId);
    if (funcionario) {
      Object.keys(funcionario).forEach((key) => {
        const campo = document.getElementById(key);
        if (campo) {
          campo.value = funcionario[key];
          campo.disabled = true;
        }
      });
      if (botaoSubmit) botaoSubmit.style.display = "none";
    }
  }

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
      const option = document.createElement("option");
      option.value = residente.id;
      option.textContent = `${residente["primeiro-nome"]} ${residente.sobrenome}`;
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

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!form.checkValidity()) return;

    const listaFuncionarios = carregarFuncionarios();
    const formData = new FormData(form);
    const novoFuncionario = Object.fromEntries(formData.entries());
    novoFuncionario.id = Date.now();

    listaFuncionarios.push(novoFuncionario);
    salvarFuncionarios(listaFuncionarios);

    const urlParams = new URLSearchParams(window.location.search);
    const origem = urlParams.get("origem");
    let redirectUrl = "../../index.html";
    if (origem) {
      redirectUrl += `?pagina=${origem}`;
    }

    alert("Funcionário cadastrado com sucesso!");
    window.location.href = redirectUrl;
  });

  mostrarEtapa(etapaAtual);
});
