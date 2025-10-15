function carregarRelatorios() {
  return JSON.parse(sessionStorage.getItem("listaRelatoriosDiarios") || "[]");
}
function salvarRelatorios(lista) {
  sessionStorage.setItem("listaRelatoriosDiarios", JSON.stringify(lista));
}
function carregarResidentes() {
  return JSON.parse(sessionStorage.getItem("listaResidentes") || "[]");
}
function carregarTratamentos() {
  return JSON.parse(sessionStorage.getItem("listaTratamentos") || "[]");
}

// ===== CÓDIGO PRINCIPAL DA PÁGINA _______________________________________________________________________________
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("form-relatorio");
  const selectResidente = document.getElementById("residenteId");
  const inputData = document.getElementById("data");
  const botaoCancelar = document.querySelector(".btn-cancelar");

  // --- LÓGICA DO ACCORDION ---
  const accordionHeaders = document.querySelectorAll(".accordion-header");
  accordionHeaders.forEach((header) => {
    header.addEventListener("click", (event) => {
      event.preventDefault();

      header.classList.toggle("active");
      const content = header.nextElementSibling;
      if (content.style.maxHeight) {
        content.style.maxHeight = null;
        content.style.padding = "0 18px";
      } else {
        content.style.padding = "18px";
        content.style.maxHeight = content.scrollHeight + "px";
      }
    });
  });

  // --- LÓGICA DOS MÚLTIPLOS BOTÕES DE STATUS ---
  const todosBotoesStatus = document.querySelectorAll(".botoes-status");
  todosBotoesStatus.forEach((container) => {
    const inputEscondido = form.elements[container.dataset.inputName];
    container.querySelectorAll(".btn-status").forEach((botao) => {
      botao.addEventListener("click", function () {
        container
          .querySelectorAll(".btn-status")
          .forEach((b) => b.classList.remove("selecionado"));
        this.classList.add("selecionado");
        if (inputEscondido) {
          inputEscondido.value = this.dataset.value;
        }
      });
    });
  });

  // --- LÓGICA DE EDIÇÃO ---
  const urlParams = new URLSearchParams(window.location.search);
  const relatorioId = urlParams.get("id");
  const isEditMode = Boolean(relatorioId);
  if (!isEditMode) {
    inputData.valueAsDate = new Date();
  } else {
    const titulo = document.querySelector(".titulo");
    if (titulo) titulo.textContent = "Editar Ficha de Evolução";
    document.querySelector(".btn-enviar").textContent = "SALVAR ALTERAÇÕES";

    const listaRelatorios = carregarRelatorios();
    const relatorioParaEditar = listaRelatorios.find(
      (r) => r.id == relatorioId
    );
    if (relatorioParaEditar) {
      Object.keys(relatorioParaEditar).forEach((key) => {
        if (form.elements[key]) {
          form.elements[key].value = relatorioParaEditar[key];
        }
      });
      const foiMedicadoCheckbox = document.getElementById("foi-medicado");
      if (foiMedicadoCheckbox) {
        foiMedicadoCheckbox.checked =
          relatorioParaEditar.statusMedicacao === "Medicado";
      }
      todosBotoesStatus.forEach((container) => {
        const inputName = container.dataset.inputName;
        const valorSalvo = relatorioParaEditar[inputName];
        if (valorSalvo) {
          const botaoParaSelecionar = container.querySelector(
            `.btn-status[data-value="${valorSalvo}"]`
          );
          if (botaoParaSelecionar) {
            botaoParaSelecionar.classList.add("selecionado");
          }
        }
      });
    }
  }

  // --- Popula a lista de Residentes ---
  if (selectResidente) {
    const listaResidentes = carregarResidentes();
    selectResidente.innerHTML =
      '<option value="" disabled selected>Selecione um residente</option>';
    listaResidentes.forEach((residente) => {
      selectResidente.appendChild(
        new Option(
          `${residente["primeiro-nome"]} ${residente.sobrenome}`,
          residente.id
        )
      );
    });
  }
  // --- Popula a lista de Medicamentos ---
  const selectMedicamento = document.getElementById("medicamento");
  if (selectMedicamento) {
    const listaTratamentos = carregarTratamentos();
    listaTratamentos.forEach((tratamento) => {
      const option = new Option(
        `${tratamento.medicamento} (${tratamento.dosagem})`,
        tratamento.medicamento
      );
      selectMedicamento.appendChild(option);
    });
  }

  // --- LÓGICA DE ENVIO DO FORMULÁRIO ---
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!form.checkValidity()) {
      alert("Por favor, preencha os campos obrigatórios (*).");
      return;
    }

    const listaRelatorios = carregarRelatorios();
    const formData = new FormData(form);
    const dadosFicha = Object.fromEntries(formData.entries());

    // --- LÓGICA DE MEDICAÇÃO  ---
    const medicamentoSelecionado = dadosFicha.medicamento;
    const medicacaoConfirmada = dadosFicha.hasOwnProperty("foi-medicado");

    if (medicamentoSelecionado && medicamentoSelecionado !== "") {
      if (medicacaoConfirmada) {
        dadosFicha.statusMedicacao = "Medicado";
      } else {
        dadosFicha.statusMedicacao = "Não Tomado";
      }
    } else {
      dadosFicha.statusMedicacao = "N/A";
    }
    delete dadosFicha["foi-medicado"];

    if (isEditMode) {
      const index = listaRelatorios.findIndex((r) => r.id == relatorioId);
      if (index !== -1) {
        listaRelatorios[index] = { ...listaRelatorios[index], ...dadosFicha };
        salvarRelatorios(listaRelatorios);
        alert("Ficha de Evolução atualizada com sucesso!");
      }
    } else {
      dadosFicha.id = Date.now();
      listaRelatorios.push(dadosFicha);
      salvarRelatorios(listaRelatorios);
      alert("Ficha de Evolução salva com sucesso!");
    }

    const origem = urlParams.get("origem") || "pagina-relatorios";
    window.location.href = `../../index.html?pagina=${origem}`;
  });

  if (botaoCancelar) {
    botaoCancelar.addEventListener("click", () => {
      if (
        confirm("Deseja cancelar? As informações não salvas serão perdidas.")
      ) {
        window.location.href = "../../index.html?pagina=pagina-relatorios";
      }
    });
  }
});
