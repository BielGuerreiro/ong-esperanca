// URL base da API
const API_URL = "http://localhost:3000/api";

// ===== FUNÇÕES AUXILIARES DE API =====
async function carregarResidentes() {
  try {
    const res = await fetch(`${API_URL}/residentes`);
    if (!res.ok) throw new Error("Erro ao buscar residentes");
    return await res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}

async function carregarMedicamentos() {
  try {
    const res = await fetch(`${API_URL}/medicamentos`);
    if (!res.ok) throw new Error("Erro ao buscar medicamentos");
    const tratamentos = await res.json();
    const nomes = tratamentos.map((t) => t.medicamento);
    return [...new Set(nomes)];
  } catch (err) {
    console.error(err);
    return [];
  }
}

async function buscarRelatorioPorId(id) {
  try {
    const res = await fetch(`${API_URL}/relatorios/${id}`);
    if (!res.ok) throw new Error("Relatório não encontrado");
    return await res.json();
  } catch (err) {
    console.error(err);
    return null;
  }
}

// ===== CÓDIGO PRINCIPAL DA PÁGINA _______________________________________________________________________________
document.addEventListener("DOMContentLoaded", async function () {
  const form = document.getElementById("form-relatorio");
  if (!form) return;

  const selectResidente = document.getElementById("residenteId");
  const inputData = document.getElementById("data");
  const botaoCancelar = document.querySelector(".btn-cancelar");
  const accordionHeaders = document.querySelectorAll(".accordion-header");
  const todosBotoesStatus = document.querySelectorAll(".botoes-status");
  const selectMedicamento = document.getElementById("medicamento");

  form.setAttribute("novalidate", true);

  // --- LÓGICA DE EDIÇÃO ---
  const urlParams = new URLSearchParams(window.location.search);
  const relatorioId = urlParams.get("id");
  const isEditMode = Boolean(relatorioId);

  // --- Popula a lista de Residentes (via fetch) ---
  if (selectResidente) {
    const listaResidentes = await carregarResidentes();
    selectResidente.innerHTML =
      '<option value="" disabled selected>Selecione um residente</option>';
    listaResidentes.forEach((residente) => {
      selectResidente.appendChild(
        new Option(
          `${residente.primeiro_nome} ${residente.sobrenome}`,
          residente.id_residente // Salva o ID
        )
      );
    });
  }

  // --- Popula a lista de Medicamentos (via fetch) ---
  if (selectMedicamento) {
    const listaNomesMedicamentos = await carregarMedicamentos();
    listaNomesMedicamentos.forEach((nome) => {
      const option = new Option(nome, nome); // O valor é o próprio nome
      selectMedicamento.appendChild(option);
    });
  }

  if (isEditMode) {
    const titulo = document.querySelector(".titulo");
    if (titulo) titulo.textContent = "Editar Ficha de Evolução";
    document.querySelector(".btn-enviar").textContent = "SALVAR ALTERAÇÕES";

    const relatorioParaEditar = await buscarRelatorioPorId(relatorioId);

    if (relatorioParaEditar) {
      // Preenche os campos (o loop automático do backend já faz a maior parte)
      Object.keys(relatorioParaEditar).forEach((key) => {
        if (form.elements[key]) {
          form.elements[key].value = relatorioParaEditar[key];
        }
      });

      // --- CORREÇÃO MANUAL (Para campos com nomes diferentes) ---
      form.elements["descricao_fisio"].value =
        relatorioParaEditar.descricao_fisica || "";
      form.elements["evolucao_fisio"].value =
        relatorioParaEditar.evolucao_fisica || "";
      // --- FIM DA CORREÇÃO ---

      // Preenche o checkbox de medicação
      const foiMedicadoCheckbox = document.getElementById("foi-medicado");
      if (foiMedicadoCheckbox) {
        foiMedicadoCheckbox.checked = relatorioParaEditar["foi-medicado"];
      }

      // Preenche os botões de status (Evolução)
      todosBotoesStatus.forEach((container) => {
        const inputName = container.dataset.inputName;
        const valorSalvo =
          relatorioParaEditar[inputName] ||
          relatorioParaEditar[inputName.replace("_fisio", "_fisica")]; // Tenta os dois nomes
        if (valorSalvo) {
          const botaoParaSelecionar = container.querySelector(
            `.btn-status[data-value="${valorSalvo}"]`
          );
          if (botaoParaSelecionar) {
            botaoParaSelecionar.classList.add("selecionado");
          }
        }
      });

      // Seleciona o residente correto
      if (selectResidente) {
        selectResidente.value = relatorioParaEditar.residenteId;
      }
      // Seleciona o medicamento correto
      if (selectMedicamento) {
        selectMedicamento.value = relatorioParaEditar.medicamento;
      }
    }
  } else {
    // Define a data atual para novos relatórios
    inputData.valueAsDate = new Date();
  }

  // --- LÓGICA DO ACCORDION (Mantida) ---
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

  // --- LÓGICA DOS BOTÕES DE STATUS (Mantida) ---
  todosBotoesStatus.forEach((container) => {
    const inputEscondido = form.elements[container.dataset.inputName];
    container.querySelectorAll(".btn-status").forEach((botao) => {
      botao.addEventListener("click", function () {
        if (this.classList.contains("selecionado")) {
          this.classList.remove("selecionado");
          if (inputEscondido) inputEscondido.value = "";
        } else {
          container
            .querySelectorAll(".btn-status")
            .forEach((b) => b.classList.remove("selecionado"));
          this.classList.add("selecionado");
          if (inputEscondido) {
            inputEscondido.value = this.dataset.value;
          }
        }
      });
    });
  });

  // --- LÓGICA DE ENVIO DO FORMULÁRIO (Atualizada para fetch) ---
  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    if (!form.checkValidity()) {
      alert("Por favor, preencha os campos obrigatórios (*).");
      return;
    }

    const formData = new FormData(form);
    const dadosFicha = Object.fromEntries(formData.entries());

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

    let url = `${API_URL}/relatorios`;
    let method = "POST";

    if (isEditMode) {
      url = `${API_URL}/relatorios/${relatorioId}`;
      method = "PUT";
    }

    try {
      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosFicha),
      });

      if (response.ok) {
        const resData = await response.json();
        alert(resData.message || "Operação realizada com sucesso!");

        const origem = urlParams.get("origem") || "pagina-relatorios";
        window.location.href = `../../index.html?pagina=${origem}`;
      } else {
        const erro = await response.json();
        alert("Erro ao salvar: " + (erro.error || "desconhecido"));
      }
    } catch (err) {
      console.error("Erro na requisição:", err);
      alert("Erro de conexão ao salvar relatório.");
    }
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
