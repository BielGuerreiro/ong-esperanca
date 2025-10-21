// ========================== FUNÇÕES DE INTEGRAÇÃO COM BACKEND ==========================
async function carregarRelatorios() {
  try {
    const response = await fetch("http://localhost:3000/relatorio");
    if (!response.ok) throw new Error("Erro ao buscar relatórios");
    return await response.json();
  } catch (error) {
    console.error("Erro ao carregar relatórios:", error);
    alert("Erro ao carregar lista de relatórios.");
    return [];
  }
}

async function salvarRelatorios(dadosRelatorio, isEditMode = false, id = null) {
  try {
    const url = isEditMode
      ? `http://localhost:3000/relatorio/${id}` // PUT para editar
      : "http://localhost:3000/relatorio"; // POST para criar

    const method = isEditMode ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dadosRelatorio),
    });

    if (!response.ok) throw new Error("Erro ao salvar relatório");

    return await response.json();
  } catch (error) {
    console.error("Erro ao salvar relatório:", error);
    alert("Erro ao salvar os dados do relatório.");
  }
}

async function carregarResidentes() {
  try {
    const response = await fetch("http://localhost:3000/criancas");
    if (!response.ok) throw new Error("Erro ao buscar residentes");
    return await response.json();
  } catch (error) {
    console.error("Erro ao carregar residentes:", error);
    alert("Erro ao carregar lista de residentes.");
    return [];
  }
}

async function carregarTratamentos() {
  try {
    const response = await fetch("http://localhost:3000/medicamentos");
    if (!response.ok) throw new Error("Erro ao buscar tratamentos");
    return await response.json();
  } catch (error) {
    console.error("Erro ao carregar tratamentos:", error);
    alert("Erro ao carregar lista de tratamentos.");
    return [];
  }
}

// ========================== CÓDIGO PRINCIPAL DA PÁGINA ==========================
document.addEventListener("DOMContentLoaded", async function () {
  const form = document.getElementById("form-relatorio");
   const selectRelatorio = document.getElementById("id_relatorio");
  const selectResidente = document.getElementById("id_residente");
  const selectMedicamento = document.getElementById("medicamento");
  const inputDataRelatorio = document.getElementById("data");
  const botaoSubmit = document.querySelector(".btn-enviar");
  const botaoCancelar = document.querySelector(".btn-cancelar");

  const urlParams = new URLSearchParams(window.location.search);
  const relatorioId = urlParams.get("id_relatorio");
  const isEditMode = Boolean(relatorioId);

  // ========================== MODO DE EDIÇÃO ==========================
  if (isEditMode) {
    const titulo = document.querySelector("h2");
    if (titulo) titulo.textContent = "Editar Registro Diário";
    if (botaoSubmit) botaoSubmit.textContent = "SALVAR ALTERAÇÕES";

    const listaRelatorios = await carregarRelatorios();
    const relatorioParaEditar = listaRelatorios.find((r) => r.id_relatorio == relatorioId);

    if (relatorioParaEditar) {
      Object.keys(relatorioParaEditar).forEach((key) => {
  const campo = form.elements[key];
  if (campo) {
    if (campo.type === "checkbox" && key === "foi-medicado") return;

    // ✅ Formata a data para YYYY-MM-DD
    if (key === "data") {
  const dataBruta = relatorioParaEditar[key];

  if (dataBruta && dataBruta !== "0000-00-00" && !isNaN(new Date(dataBruta))) {
    // Se vier no formato ISO (2025-10-21T00:00:00.000Z) ou YYYY-MM-DD
    const dataObj = new Date(dataBruta);
    const dataIso = dataObj.toISOString().split("T")[0];
    campo.value = dataIso;
  } else {
    // Se vier inválida, preenche com a data atual
    const hoje = new Date().toISOString().split("T")[0];
    campo.value = hoje;
    }
  }
}
      });

      selectResidente.value = relatorioParaEditar.id_residente;
  selectResidente.dispatchEvent(new Event("change")); // ✅ força o carregamento

      const foiMedicadoCheckbox = document.getElementById("foi-medicado");
      if (foiMedicadoCheckbox) {
        foiMedicadoCheckbox.checked =
          relatorioParaEditar.medicacao_confirmada === "Medicado";
      }
    }
  } else {
    // Define data atual ao criar novo relatório
    if (inputDataRelatorio) {
      const hoje = new Date();
      const ano = hoje.getFullYear();
      const mes = String(hoje.getMonth() + 1).padStart(2, "0");
      const dia = String(hoje.getDate()).padStart(2, "0");
      inputDataRelatorio.value = `${ano}-${mes}-${dia}`;
    }
  }

  // ========================== POPULAR SELECT DE RESIDENTES ==========================
  if (selectResidente) {
    const listaResidentes = await carregarResidentes();
    selectResidente.innerHTML =
      '<option value="" disabled selected>Selecione um residente</option>';
    listaResidentes.forEach((residente) => {
      const option = new Option(
        `${residente["primeiro_nome"]} ${residente.sobrenome}`,
        residente.id
      );
      selectResidente.appendChild(option);
    });
  }

  // ========================== POPULAR SELECT DE MEDICAMENTOS ==========================
  if (selectResidente && selectMedicamento) {
  selectResidente.addEventListener("change", async function () {
    const id_residente = this.value;
    if (!id_residente) return;

    // Limpa as opções anteriores
    selectMedicamento.innerHTML = '<option value="">Carregando...</option>';

    try {
      const response = await fetch(`http://localhost:3000/medicamentos/${id_residente}`);
      if (!response.ok) throw new Error("Erro ao buscar medicamentos do residente");
      const listaMedicamentos = await response.json();

      selectMedicamento.innerHTML = "";

      if (listaMedicamentos.length === 0) {
        selectMedicamento.innerHTML =
          '<option value="">Nenhum medicamento destinado</option>';
      } else {
        selectMedicamento.innerHTML =
          '<option value="" disabled selected>Selecione um medicamento</option>';

        listaMedicamentos.forEach((m) => {
          const option = new Option(
            `${m.medicamento} (${m.dosagem})`,
            m.medicamento
          );
          selectMedicamento.appendChild(option);
        });
      }
    } catch (error) {
      console.error("Erro ao carregar medicamentos:", error);
      selectMedicamento.innerHTML =
        '<option value="">Erro ao carregar medicamentos</option>';
    }
  });
}

  // ========================== ENVIO DO FORMULÁRIO ==========================
  form.addEventListener("submit", async function (event) {
  event.preventDefault();

  if (!form.checkValidity()) {
    alert("Preencha os campos obrigatórios.");
    return;
  }

  const formData = new FormData(form);
  const dadosRelatorio = Object.fromEntries(formData.entries());

  // ✅ Define corretamente o valor booleano para o banco
const foiMedicado = document.getElementById("foi-medicado")?.checked;

// Se houver medicamento selecionado
if (dadosRelatorio.medicamento && dadosRelatorio.medicamento !== "") {
  dadosRelatorio.medicacao_confirmada = foiMedicado ? 1 : 0; // ✅ Booleano numérico
} else {
  dadosRelatorio.medicacao_confirmada = null; // ✅ Nenhuma medicação registrada
}

// Remove o campo checkbox do envio
delete dadosRelatorio["foi-medicado"];


  try {
    await salvarRelatorios(dadosRelatorio, isEditMode, relatorioId);
    alert("Registro salvo com sucesso!");
    const origem = urlParams.get("origem") || "pagina-relatorios";
    window.location.href = `../../index.html?pagina=${origem}`;
  } catch (error) {
    console.error("Erro ao salvar o relatório:", error);
    alert("Não foi possível salvar o relatório.");
  }
});


  

  // ========================== BOTÃO CANCELAR ==========================
  if (botaoCancelar) {
    botaoCancelar.addEventListener("click", function () {
      if (confirm("Tem certeza que deseja cancelar o registro?")) {
        window.location.href = "../../index.html?pagina=pagina-relatorios";
      }
    });
  }
});
