// Funções de dados no topo do arquivo_______________________________________________________________________________
function carregarResponsaveis() {
  return JSON.parse(sessionStorage.getItem("listaResponsaveis") || "[]");
}
function salvarResponsaveis(lista) {
  sessionStorage.setItem("listaResponsaveis", JSON.stringify(lista));
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
}

// FUNÇÃO PARA MOSTRAR/ESCONDER SENHA
function iniciarToggleSenha(inputId, toggleId) {
  const inputSenha = document.getElementById(inputId);
  const toggleIcon = document.getElementById(toggleId);
  if (inputSenha && toggleIcon) {
    toggleIcon.addEventListener("click", function () {
      const type =
        inputSenha.getAttribute("type") === "password" ? "text" : "password";
      inputSenha.setAttribute("type", type);
      this.classList.toggle("bx-hide");
      this.classList.toggle("bx-show");
    });
  }
}

// ===== CÓDIGO PRINCIPAL DA PÁGINA _______________________________________________________________________________
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("form-responsavel");
  const etapas = document.querySelectorAll(".etapa-form");
  const botoesProximo = document.querySelectorAll(".btn-proximo");
  const botoesVoltar = document.querySelectorAll(".btn-voltar");
  const botoesCancelar = document.querySelectorAll(".btn-cancelar");
  const botaoSubmit = document.querySelector(".btn-enviar");
  const selectResidente = document.getElementById("residenteId");
  let etapaAtual = 0;

  // --- LÓGICA DE EDIÇÃO ---
  const urlParams = new URLSearchParams(window.location.search);
  const responsavelId = urlParams.get("id");
  const isEditMode = Boolean(responsavelId);

  if (isEditMode) {
    const titulo = document.querySelector(".titulo");
    if (titulo) titulo.textContent = "Editar Ficha de Responsável";
    if (botaoSubmit) botaoSubmit.textContent = "SALVAR ALTERAÇÕES";

    const listaResponsaveis = carregarResponsaveis();
    const responsavelParaEditar = listaResponsaveis.find(
      (r) => r.id == responsavelId
    );
    if (responsavelParaEditar) {
      Object.keys(responsavelParaEditar).forEach((key) => {
        const campo = form.elements[key];
        if (campo) {
          campo.value = responsavelParaEditar[key];
        }
      });
    }
  }

  // --- Popula o campo de seleção de residentes ---
  const listaResidentes = carregarResidentes();
  if (selectResidente) {
    listaResidentes.forEach((residente) => {
      const option = new Option(
        `${residente["primeiro-nome"]} ${residente.sobrenome}`,
        residente.id
      );
      selectResidente.appendChild(option);
    });
    if (isEditMode) {
      const responsavelParaEditar = carregarResponsaveis().find(
        (r) => r.id == responsavelId
      );
      if (responsavelParaEditar) {
        selectResidente.value = responsavelParaEditar.residenteId;
      }
    }
  }

  // --- LÓGICA DE SALVAR E VALIDAR ---
  form.addEventListener("submit", function (event) {
    event.preventDefault();

    let primeiroCampoInvalido = null;
    for (const campo of form.querySelectorAll("[required]")) {
      if (!campo.value.trim()) {
        primeiroCampoInvalido = campo;
        break;
      }
    }

    if (primeiroCampoInvalido) {
      form.classList.add("form-foi-validado");
      const etapaComErro = primeiroCampoInvalido.closest(".etapa-form");
      if (etapaComErro) {
        const indiceEtapaComErro = Array.from(etapas).indexOf(etapaComErro);
        if (indiceEtapaComErro !== -1) {
          mostrarEtapa(indiceEtapaComErro);
        }
      }
      primeiroCampoInvalido.focus();
      alert("Por favor, preencha todos os campos obrigatórios (*).");
      return;
    }

    const listaResponsaveis = carregarResponsaveis();
    const formData = new FormData(form);
    const dadosResponsavel = Object.fromEntries(formData.entries());

    if (isEditMode) {
      const index = listaResponsaveis.findIndex((r) => r.id == responsavelId);
      if (index !== -1) {
        listaResponsaveis[index] = {
          ...dadosResponsavel,
          id: parseInt(responsavelId),
        };
        salvarResponsaveis(listaResponsaveis);
        alert("Ficha do responsável atualizada com sucesso!");
      }
    } else {
      dadosResponsavel.id = Date.now();
      listaResponsaveis.push(dadosResponsavel);
      salvarResponsaveis(listaResponsaveis);
      alert("Responsável cadastrado com sucesso!");
    }
    const origem = urlParams.get("origem") || "pagina-responsavel";
    window.location.href = `../../index.html?pagina=${origem}`;
  });

  // --- LÓGICAS DE NAVEGAÇÃO ---
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
        window.location.href = "../../index.html?pagina=pagina-responsavel";
      }
    })
  );

  // --- INICIALIZAÇÃO ---
  configurarValidacaoDatas();
  iniciarToggleSenha("senha", "toggle-senha-responsavel");
  mostrarEtapa(etapaAtual);
});
