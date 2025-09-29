/*
    VERSÃO COMPLETA E FUNCIONAL DO SCRIPT DE CADASTRO DE FUNCIONÁRIO
    - Adicionada a lógica de alerta para campos obrigatórios.
*/

// ===== CAMADA DE DADOS =====
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

  // Lógica do modo "Ver Ficha"
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

  // =================================================================
  // LÓGICA DE VALIDAÇÃO E ENVIO (PARTE ADICIONADA)
  // =================================================================

  // 1. OUVINTE DE CLIQUE: Mostra o alerta de erro se o formulário for inválido.
  if (botaoSubmit) {
    botaoSubmit.addEventListener("click", function () {
      // Ao clicar, marcamos o formulário para mostrar os erros de CSS
      form.classList.add("form-foi-validado");

      // Se for inválido, mostramos o alerta de erro.
      if (!form.checkValidity()) {
        alert(
          "Por favor, preencha todos os campos obrigatórios (*) antes de prosseguir."
        );
      }
    });
  }

  // 2. OUVINTE DE SUBMIT: Este evento só será disparado se o formulário for VÁLIDO.
  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const listaFuncionarios = carregarFuncionarios();
    const formData = new FormData(form);
    const novoFuncionario = Object.fromEntries(formData.entries());
    novoFuncionario.id = Date.now();

    listaFuncionarios.push(novoFuncionario);
    salvarFuncionarios(listaFuncionarios);

    alert("Funcionário cadastrado com sucesso!");
    window.location.href = "/index.html";
  });

  mostrarEtapa(etapaAtual);
});
