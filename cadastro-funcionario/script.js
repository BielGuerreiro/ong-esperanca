/*
    VERSÃO FINAL E UNIFICADA DO SCRIPT DE CADASTRO DE FUNCIONÁRIO
*/

// ===== CAMADA DE DADOS (específica para funcionários) =====
function carregarFuncionarios() {
  const dados = sessionStorage.getItem("listaFuncionarios");
  return JSON.parse(dados || "[]");
}

function salvarFuncionarios(lista) {
  sessionStorage.setItem("listaFuncionarios", JSON.stringify(lista));
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

// ===== CÓDIGO PRINCIPAL DA PÁGINA (executado apenas uma vez) =====
document.addEventListener("DOMContentLoaded", function () {
  // --- Seletores de Elementos ---
  const form = document.getElementById("form-funcionario"); // MUDOU AQUI
  const etapas = document.querySelectorAll(".etapa-form");
  const botoesProximo = document.querySelectorAll(".btn-proximo");
  const botoesVoltar = document.querySelectorAll(".btn-voltar");
  const botoesCancelar = document.querySelectorAll(".btn-cancelar");
  const botaoSubmit = document.querySelector(".btn-enviar");
  let etapaAtual = 0;

  // --- Lógica Inicial ---
  configurarValidacaoDatas();

  // --- Lógica do modo "Ver Ficha" ---
  const urlParams = new URLSearchParams(window.location.search);
  const funcionarioId = urlParams.get("id"); // MUDOU AQUI
  if (funcionarioId) {
    const listaFuncionarios = carregarFuncionarios(); // MUDOU AQUI
    const funcionario = listaFuncionarios.find((f) => f.id == funcionarioId); // MUDOU AQUI
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

  // --- Lógica de Navegação entre Etapas (IDÊNTICA) ---
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

  // --- Lógica de Validação e Envio do Formulário ---
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
    if (!form.checkValidity()) return; // Garantia extra

    const listaFuncionarios = carregarFuncionarios(); // MUDOU AQUI

    const formData = new FormData(form);
    const novoFuncionario = Object.fromEntries(formData.entries()); // MUDOU AQUI
    novoFuncionario.id = Date.now();

    listaFuncionarios.push(novoFuncionario); // MUDOU AQUI
    salvarFuncionarios(listaFuncionarios); // MUDOU AQUI

    alert("Funcionário cadastrado com sucesso!"); // MUDOU AQUI
    window.location.href = "/index.html";
  });

  // Mostra a primeira etapa ao carregar
  mostrarEtapa(etapaAtual);
});
