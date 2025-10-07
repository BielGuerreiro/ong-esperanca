// ===== CAMADA DE DADOS (Funções para carregar e salvar no sessionStorage) =====
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

// ===== CÓDIGO PRINCIPAL DA PÁGINA =====
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("form-relatorio");
  const selectResidente = document.getElementById("residenteId");
  const selectMedicamento = document.getElementById("medicamento");
  const inputDataRelatorio = document.getElementById("data");
  const botaoSubmit = document.querySelector(".btn-enviar");
  const botaoCancelar = document.querySelector(".btn-cancelar");

  // --- LÓGICA DE EDIÇÃO (ADICIONADA) ---
  const urlParams = new URLSearchParams(window.location.search);
  const relatorioId = urlParams.get("id");
  const isEditMode = Boolean(relatorioId);

  if (isEditMode) {
    const titulo = document.querySelector("h2");
    if (titulo) titulo.textContent = "Editar Registro Diário";
    if (botaoSubmit) botaoSubmit.textContent = "SALVAR ALTERAÇÕES";

    const listaRelatorios = carregarRelatorios();
    const relatorioParaEditar = listaRelatorios.find(
      (r) => r.id == relatorioId
    );

    if (relatorioParaEditar) {
      Object.keys(relatorioParaEditar).forEach((key) => {
        const campo = form.elements[key];
        if (campo) {
          // Trata o checkbox de forma especial
          if (campo.type === "checkbox" && key === "foi-medicado") {
            // A gente não salva 'foi-medicado', então pulamos
          } else {
            campo.value = relatorioParaEditar[key];
          }
        }
      });
      // Lógica específica para marcar o checkbox com base no status salvo
      const foiMedicadoCheckbox = document.getElementById("foi-medicado");
      if (foiMedicadoCheckbox) {
        foiMedicadoCheckbox.checked =
          relatorioParaEditar.statusMedicacao === "Medicado";
      }
    }
  } else {
    // Define a data atual APENAS se estiver criando um novo relatório
    if (inputDataRelatorio) {
      const hoje = new Date();
      const ano = hoje.getFullYear();
      const mes = String(hoje.getMonth() + 1).padStart(2, "0");
      const dia = String(hoje.getDate()).padStart(2, "0");
      inputDataRelatorio.value = `${ano}-${mes}-${dia}`;
    }
  }

  // Popula a lista de seleção de RESIDENTES
  if (selectResidente) {
    const listaResidentes = carregarResidentes();
    selectResidente.innerHTML =
      '<option value="" disabled selected>Selecione um residente</option>';
    listaResidentes.forEach((residente) => {
      const option = new Option(
        `${residente["primeiro-nome"]} ${residente.sobrenome}`,
        residente.id
      );
      selectResidente.appendChild(option);
    });
    // Se estiver em modo de edição, o loop de preenchimento acima já terá selecionado o valor
  }

  // Popula a lista de seleção de MEDICAMENTOS
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

  // --- LÓGICA DE ENVIO DO FORMULÁRIO (AGORA UNIFICADA) ---
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!form.checkValidity()) {
      alert("Preencha os campos obrigatórios.");
      return;
    }

    const listaRelatorios = carregarRelatorios();
    const formData = new FormData(form);
    const dadosRelatorio = Object.fromEntries(formData.entries());

    // Lógica para definir o status da medicação (funciona para criar e editar)
    if (dadosRelatorio.medicamento && dadosRelatorio.medicamento !== "") {
      dadosRelatorio.statusMedicacao = dadosRelatorio["foi-medicado"]
        ? "Medicado"
        : "Não Medicado";
    } else {
      dadosRelatorio.statusMedicacao = "N/A";
    }
    delete dadosRelatorio["foi-medicado"];

    if (isEditMode) {
      // SE ESTIVER EM MODO DE EDIÇÃO
      const index = listaRelatorios.findIndex((r) => r.id == relatorioId);
      if (index !== -1) {
        listaRelatorios[index] = {
          ...dadosRelatorio,
          id: parseInt(relatorioId),
        };
        salvarRelatorios(listaRelatorios);
        alert("Registro atualizado com sucesso!");
      }
    } else {
      // SE FOR UM NOVO CADASTRO
      dadosRelatorio.id = Date.now();
      listaRelatorios.push(dadosRelatorio);
      salvarRelatorios(listaRelatorios);
      alert("Registro diário salvo com sucesso!");
    }

    // Redireciona de volta
    const origem = urlParams.get("origem") || "pagina-relatorios";
    window.location.href = `../../index.html?pagina=${origem}`;
  });

  // Lógica do botão Cancelar
  if (botaoCancelar) {
    botaoCancelar.addEventListener("click", function () {
      if (confirm("Tem certeza que deseja cancelar o registro?")) {
        window.location.href = "../../index.html?pagina=pagina-relatorios";
      }
    });
  }
});
