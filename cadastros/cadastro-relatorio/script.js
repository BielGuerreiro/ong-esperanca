const API_URL = "http://localhost:3000/api";

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

async function carregarFuncionarios() {
  try {
    const res = await fetch(`${API_URL}/funcionarios`);
    if (!res.ok) throw new Error("Erro ao buscar funcionários");
    return await res.json();
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

  const selectFuncionario = document.getElementById("funcionarioId");

  form.setAttribute("novalidate", true);

  const urlParams = new URLSearchParams(window.location.search);
  const relatorioId = urlParams.get("id");
  const isEditMode = Boolean(relatorioId);

  if (selectResidente) {
    const listaResidentes = await carregarResidentes();
    selectResidente.innerHTML =
      '<option value="" disabled selected>Selecione um residente</option>';
    listaResidentes.forEach((residente) => {
      selectResidente.appendChild(
        new Option(
          `${residente.primeiro_nome} ${residente.sobrenome}`,
          residente.id_residente
        )
      );
    });
  }

  if (selectMedicamento) {
    const listaNomesMedicamentos = await carregarMedicamentos();
    listaNomesMedicamentos.forEach((nome) => {
      const option = new Option(nome, nome);
      selectMedicamento.appendChild(option);
    });
  }

  if (selectFuncionario) {
    const listaFuncionarios = await carregarFuncionarios();
    selectFuncionario.innerHTML =
      '<option value="" disabled selected>Selecione seu nome</option>';
    listaFuncionarios.forEach((func) => {
      selectFuncionario.appendChild(
        new Option(
          `${func.primeiro_nome} ${func.sobrenome}`,
          func.id_funcionario
        )
      );
    });
  }

  if (isEditMode) {
    const titulo = document.querySelector(".titulo");
    if (titulo) titulo.textContent = "Editar Ficha de Evolução";
    document.querySelector(".btn-enviar").textContent = "SALVAR ALTERAÇÕES";

    const relatorioParaEditar = await buscarRelatorioPorId(relatorioId);

    if (relatorioParaEditar) {
      Object.keys(relatorioParaEditar).forEach((key) => {
        if (form.elements[key]) {
          form.elements[key].value = relatorioParaEditar[key];
        }
      });

      form.elements["descricao_fisio"].value =
        relatorioParaEditar.descricao_fisica || "";
      form.elements["evolucao_fisio"].value =
        relatorioParaEditar.evolucao_fisica || "";
      form.elements["funcionarioId"].value =
        relatorioParaEditar.funcionario_id_funcionario || "";

      const foiMedicadoCheckbox = document.getElementById("foi-medicado");
      if (foiMedicadoCheckbox) {
        foiMedicadoCheckbox.checked = relatorioParaEditar["foi-medicado"];
      }

      todosBotoesStatus.forEach((container) => {
        const inputName = container.dataset.inputName;
        const dbKey = inputName.replace("_fisio", "_fisica");
        const valorSalvo =
          relatorioParaEditar[inputName] || relatorioParaEditar[dbKey];

        if (valorSalvo) {
          const botaoParaSelecionar = container.querySelector(
            `.btn-status[data-value="${valorSalvo}"]`
          );
          if (botaoParaSelecionar) {
            botaoParaSelecionar.classList.add("selecionado");
            if (form.elements[inputName]) {
              form.elements[inputName].value = valorSalvo;
            }
          }
        }
      });

      if (selectResidente) {
        selectResidente.value = relatorioParaEditar.residenteId;
      }
      if (selectMedicamento) {
        selectMedicamento.value = relatorioParaEditar.medicamento || "";
      }
    }
  } else {
    inputData.valueAsDate = new Date();
  }

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

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    form.classList.remove("form-foi-validado");

    let primeiroCampoInvalido = null;
    for (const campo of form.querySelectorAll("[required]")) {
      if (campo.closest('[style*="display: none"]') === null) {
        if (!campo.value.trim()) {
          primeiroCampoInvalido = campo;
          break;
        }
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

    const formData = new FormData(form);
    const dadosFicha = Object.fromEntries(formData.entries());

    if (selectFuncionario && selectFuncionario.selectedIndex > 0) {
      dadosFicha.responsavelNome =
        selectFuncionario.options[selectFuncionario.selectedIndex].text;
    } else {
      dadosFicha.responsavelNome = "Não informado";
    }

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
