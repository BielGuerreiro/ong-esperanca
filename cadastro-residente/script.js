/*
    VERSÃO FINAL E UNIFICADA DO SCRIPT DE CADASTRO
    Este código combina todas as funcionalidades em um único bloco para evitar erros.
*/

// ===== CAMADA DE DADOS (usando sessionStorage, como solicitado) =====
function carregarResidentes() {
  const dados = sessionStorage.getItem("listaResidentes");
  return JSON.parse(dados || "[]");
}

function salvarResidentes(lista) {
  sessionStorage.setItem("listaResidentes", JSON.stringify(lista));
}

function configurarValidacaoDatas() {
  const hoje = new Date().toISOString().split("T")[0];
  const inputNascimento = document.getElementById("nascimento");
  if (inputNascimento) {
    inputNascimento.max = hoje;
    inputNascimento.min = "1900-01-01";
  }
  const inputEntrada = document.getElementById("entrada");
  if (inputEntrada) {
    inputEntrada.max = "2100-12-31";
    inputEntrada.min = "1900-01-01";
  }
  const inputSaida = document.getElementById("saida");
  if (inputSaida) {
    inputSaida.max = "2100-12-31";
    inputSaida.min = "1900-01-01";
  }
}

// ===== CÓDIGO PRINCIPAL DA PÁGINA (executado apenas uma vez) =====
document.addEventListener("DOMContentLoaded", function () {
  // --- Seletores de Elementos (feitos uma única vez) ---
  const form = document.getElementById("form-residente");
  const etapas = document.querySelectorAll(".etapa-form");
  const botoesProximo = document.querySelectorAll(".btn-proximo");
  const botoesVoltar = document.querySelectorAll(".btn-voltar");
  const botoesCancelar = document.querySelectorAll(".btn-cancelar");
  const botaoSubmit = document.querySelector(".btn-enviar");
  let etapaAtual = 0;

  // --- Lógica Inicial da Página ---
  configurarValidacaoDatas(); // Configura as datas assim que a página carrega

  // --- Lógica do modo "Ver Ficha" ---
  const urlParams = new URLSearchParams(window.location.search);
  const residenteId = urlParams.get("id");
  if (residenteId) {
    const listaResidentes = carregarResidentes();
    const residente = listaResidentes.find((r) => r.id == residenteId);
    if (residente) {
      Object.keys(residente).forEach((key) => {
        const campo = document.getElementById(key);
        if (campo) {
          campo.value = residente[key];
          campo.disabled = true;
        }
      });
      if (botaoSubmit) botaoSubmit.style.display = "none";
    }
  }

  // --- Lógica de Navegação entre Etapas ---
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
  form.addEventListener("submit", function (event) {
    event.preventDefault(); // Sempre previne o comportamento padrão primeiro

    // Validação final antes de salvar
    if (!form.checkValidity()) {
      form.classList.add("form-foi-validado");
      alert(
        "Por favor, preencha todos os campos obrigatórios (*) antes de prosseguir."
      );
      return; // Para a execução se o formulário for inválido
    }

    const listaResidentes = carregarResidentes();

    // Maneira segura de pegar todos os dados do formulário
    const formData = new FormData(form);
    const novoResidente = Object.fromEntries(formData.entries());
    novoResidente.id = Date.now();

    listaResidentes.push(novoResidente);
    salvarResidentes(listaResidentes);

    alert("Residente cadastrado com sucesso!"); // Este alerta agora só aparece uma vez
    window.location.href = "/index.html";
  });

  // Exibe a primeira etapa ao carregar a página
  mostrarEtapa(etapaAtual);
});
