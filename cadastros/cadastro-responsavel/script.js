/*
    VERSÃO COMPLETA E FUNCIONAL DO SCRIPT DE CADASTRO DE RESPONSÁVEL
*/

// ===== CAMADA DE DADOS =====
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

// Esta função será usada nos scripts dos formulários
function iniciarToggleSenha(inputId, toggleId) {
  const inputSenha = document.getElementById(inputId);
  const toggleIcon = document.getElementById(toggleId);

  if (inputSenha && toggleIcon) {
    toggleIcon.addEventListener("click", function () {
      // Verifica o tipo atual do input
      const type =
        inputSenha.getAttribute("type") === "password" ? "text" : "password";
      inputSenha.setAttribute("type", type);

      // Troca o ícone
      this.classList.toggle("bx-show");
      this.classList.toggle("bx-hide");
    });
  }
}

// ===== CÓDIGO PRINCIPAL DA PÁGINA =====
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("form-responsavel");
  const etapas = document.querySelectorAll(".etapa-form");
  const botoesProximo = document.querySelectorAll(".btn-proximo");
  const botoesVoltar = document.querySelectorAll(".btn-voltar");
  const botoesCancelar = document.querySelectorAll(".btn-cancelar");
  const botaoSubmit = document.querySelector(".btn-enviar");
  const selectResidente = document.getElementById("residenteId");
  let etapaAtual = 0;

  configurarValidacaoDatas();
  iniciarToggleSenha("senha", "toggle-senha-responsavel");

  // Popula o campo de seleção com os residentes existentes
  const listaResidentes = carregarResidentes();
  if (selectResidente) {
    listaResidentes.forEach((residente) => {
      const option = document.createElement("option");
      option.value = residente.id;
      option.textContent = `${residente["primeiro-nome"]} ${residente.sobrenome}`;
      selectResidente.appendChild(option);
    });
  }

  // Lógica do modo "Ver Ficha" (para o futuro)
  const urlParams = new URLSearchParams(window.location.search);
  const responsavelId = urlParams.get("id");
  if (responsavelId) {
    const listaResponsaveis = carregarResponsaveis();
    const responsavel = listaResponsaveis.find((r) => r.id == responsavelId);
    if (responsavel) {
      Object.keys(responsavel).forEach((key) => {
        const campo = document.getElementById(key);
        if (campo) {
          campo.value = responsavel[key];
          campo.disabled = true;
        }
      });
      if (botaoSubmit) botaoSubmit.style.display = "none";
    }
  }

  // Lógica de Navegação entre Etapas
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
        window.location.href = "/index.html";
      }
    });
  });

  // Lógica de Validação e Envio do Formulário
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

    const listaResponsaveis = carregarResponsaveis();
    const formData = new FormData(form);
    const novoResponsavel = Object.fromEntries(formData.entries());
    novoResponsavel.id = Date.now();
    novoResponsavel.nivel = "responsavel";

    listaResponsaveis.push(novoResponsavel);
    salvarResponsaveis(listaResponsaveis);

    const urlParams = new URLSearchParams(window.location.search);
    const origem = urlParams.get("origem");

    let redirectUrl = "/index.html";
    if (origem) {
      redirectUrl += `?pagina=${origem}`;
    }

    alert("Responsavel cadastrado com sucesso!");
    window.location.href = redirectUrl;
  });

  mostrarEtapa(etapaAtual);
});
