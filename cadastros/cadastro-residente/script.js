// Funções de dados para carregar e salvar a lista de residentes
function carregarResidentes() {
  const dados = sessionStorage.getItem("listaResidentes");
  return JSON.parse(dados || "[]");
}

function salvarResidentes(lista) {
  sessionStorage.setItem("listaResidentes", JSON.stringify(lista));
}

// O código principal roda quando a página carrega
document.addEventListener("DOMContentLoaded", function () {
  // --- 1. SELEÇÃO DOS ELEMENTOS DO HTML ---
  const form = document.getElementById("form-residente");
  if (!form) {
    console.error(
      "ERRO CRÍTICO: O formulário com id='form-residente' não foi encontrado!"
    );
    return; // Para a execução se o formulário não existir
  }
  const etapas = document.querySelectorAll(".etapa-form");
  const botoesProximo = document.querySelectorAll(".btn-proximo");
  const botoesVoltar = document.querySelectorAll(".btn-voltar");
  const botoesCancelar = document.querySelectorAll(".btn-cancelar");
  const botaoSubmit = document.querySelector(".btn-enviar");
  const selectFrequentaEscola = document.getElementById("frequenta-escola");
  const containerDadosEscola = document.getElementById(
    "dados-escola-container"
  );
  let etapaAtual = 0;

  // --- 2. LÓGICA DE EDIÇÃO (COM VERIFICAÇÕES DE SEGURANÇA) ---
  const urlParams = new URLSearchParams(window.location.search);
  const residenteId = urlParams.get("id");
  const isEditMode = Boolean(residenteId);

  if (isEditMode) {
    console.log("Modo de Edição Ativado! ID:", residenteId); // Mensagem de diagnóstico

    // ATUALIZAÇÃO: Verifica se os elementos existem antes de modificá-los
    const titulo = document.querySelector("h2");
    if (titulo) {
      titulo.textContent = "Editar Ficha de Residente";
    }
    if (botaoSubmit) {
      botaoSubmit.textContent = "SALVAR ALTERAÇÕES";
    }

    const listaResidentes = carregarResidentes();
    const residenteParaEditar = listaResidentes.find(
      (r) => r.id == residenteId
    );

    if (residenteParaEditar) {
      // Preenche os campos do formulário
      Object.keys(residenteParaEditar).forEach((key) => {
        const campo = form.elements[key];
        if (campo) {
          // Trata o caso de radio buttons
          if (campo.type === "radio") {
            document.querySelector(
              `input[name="${key}"][value="${residenteParaEditar[key]}"]`
            ).checked = true;
          } else {
            campo.value = residenteParaEditar[key];
          }
        }
      });
      if (selectFrequentaEscola) {
        selectFrequentaEscola.dispatchEvent(new Event("change"));
      }
    }
  }

  // --- 3. CONFIGURAÇÃO DOS EVENTOS ---
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
        window.location.href = "../../index.html?pagina=pagina-residentes";
      }
    });
  });

  if (selectFrequentaEscola) {
    selectFrequentaEscola.addEventListener("change", function () {
      if (containerDadosEscola) {
        containerDadosEscola.style.display =
          this.value === "sim" ? "block" : "none";
      }
    });
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!form.checkValidity()) {
      alert("Por favor, preencha todos os campos obrigatórios (*).");
      form.classList.add("form-foi-validado");
      return;
    }
    const listaResidentes = carregarResidentes();
    const formData = new FormData(form);
    const dadosResidente = Object.fromEntries(formData.entries());

    if (isEditMode) {
      const index = listaResidentes.findIndex((r) => r.id == residenteId);
      if (index !== -1) {
        listaResidentes[index] = {
          ...dadosResidente,
          id: parseInt(residenteId),
        };
        salvarResidentes(listaResidentes);
        alert("Ficha atualizada com sucesso!");
      }
    } else {
      dadosResidente.id = Date.now();
      listaResidentes.push(dadosResidente);
      salvarResidentes(listaResidentes);
      alert("Residente cadastrado com sucesso!");
    }
    const origem = urlParams.get("origem") || "pagina-residentes";
    window.location.href = `../../index.html?pagina=${origem}`;
  });

  // --- 4. INICIALIZAÇÃO DA PÁGINA ---
  mostrarEtapa(etapaAtual);
});
