document.addEventListener("DOMContentLoaded", function () {
  const etapas = document.querySelectorAll(".etapa-form");
  const botoesProximo = document.querySelectorAll(".btn-proximo");
  const botoesVoltar = document.querySelectorAll(".btn-voltar");
  let etapaAtual = 0;

  function mostrarEtapa(indiceEtapa) {
    etapas.forEach((etapa, indice) => {
      etapa.classList.toggle("ativo", indice === indiceEtapa);
    });
  }

  botoesProximo.forEach((botao) => {
    botao.addEventListener("click", () => {
      // Verifica se não é a última etapa
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

  mostrarEtapa(etapaAtual);
});

// Validação para os campos de data
function configurarValidacaoDatas() {
  const hoje = new Date().toISOString().split("T")[0];

  // Campo Data de Nascimento
  const inputNascimento = document.getElementById("nascimento");
  if (inputNascimento) {
    inputNascimento.max = hoje;
    inputNascimento.min = "1900-01-01";
  }

  // Campos de Entrada e Saída
  const inputEntrada = document.getElementById("entrada");
  const inputSaida = document.getElementById("saida");

  if (inputEntrada) {
    inputEntrada.max = "2100-12-31";
    inputEntrada.min = "1900-01-01";
  }
  if (inputSaida) {
    inputSaida.max = "2100-12-31";
    inputSaida.min = "1900-01-01";
  }
}

document.addEventListener("DOMContentLoaded", function () {
  configurarValidacaoDatas();
});
