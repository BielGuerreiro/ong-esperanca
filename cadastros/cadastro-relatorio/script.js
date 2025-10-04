/*
    VERSÃO FINAL E CORRIGIDA DO SCRIPT DE CADASTRO DE RELATÓRIO
    - Corrige o bug que impedia o preenchimento das listas de seleção de residentes e medicamentos.
    - Adiciona a data atual automaticamente no campo de data.
    - Remove código desnecessário que procurava por um select de "responsável" que não existe.
*/

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
  // Tratamentos vêm da lista de medicamentos cadastrados
  return JSON.parse(sessionStorage.getItem("listaTratamentos") || "[]");
}

// ===== CÓDIGO PRINCIPAL DA PÁGINA =====
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("form-relatorio");

  // CORREÇÃO: IDs dos campos ajustados para corresponder ao seu HTML
  const selectResidente = document.getElementById("residenteId");
  const selectMedicamento = document.getElementById("medicamento");
  const inputDataRelatorio = document.getElementById("data");

  const botaoCancelar = document.querySelector(".btn-cancelar");

  // --- LÓGICA DE INICIALIZAÇÃO E PREENCHIMENTO DOS CAMPOS ---

  // Define a data atual no campo de data, para facilitar o preenchimento
  if (inputDataRelatorio) {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");
    const dia = String(hoje.getDate()).padStart(2, "0");
    inputDataRelatorio.value = `${ano}-${mes}-${dia}`;
  }

  // Popula a lista de seleção de RESIDENTES
  if (selectResidente) {
    const listaResidentes = carregarResidentes();
    selectResidente.innerHTML =
      '<option value="" disabled selected>Selecione um residente</option>'; // Opção inicial
    listaResidentes.forEach((residente) => {
      const option = document.createElement("option");
      option.value = residente.id;
      option.textContent = `${residente["primeiro-nome"]} ${residente.sobrenome}`;
      selectResidente.appendChild(option);
    });
  }

  // Popula a lista de seleção de MEDICAMENTOS
  if (selectMedicamento) {
    const listaTratamentos = carregarTratamentos();
    // A primeira opção já está no HTML ("Nenhum"), então não a recriamos aqui.
    listaTratamentos.forEach((tratamento) => {
      const option = document.createElement("option");
      // Salva o nome do medicamento no value
      option.value = tratamento.medicamento;
      // Mostra o nome e a dosagem para facilitar a seleção
      option.textContent = `${tratamento.medicamento} (${tratamento.dosagem})`;
      selectMedicamento.appendChild(option);
    });
  }

  // --- LÓGICA DOS BOTÕES E FORMULÁRIO ---

  // Lógica do botão Cancelar
  if (botaoCancelar) {
    botaoCancelar.addEventListener("click", function () {
      if (confirm("Tem certeza que deseja cancelar o registro?")) {
        // Volta para a página de relatórios na tela principal
        window.location.href = "../../index.html?pagina=pagina-relatorios";
      }
    });
  }

  // Lógica de Envio do formulário
  form.addEventListener("submit", function (event) {
    event.preventDefault(); // Impede o recarregamento da página

    const listaRelatorios = carregarRelatorios();
    const formData = new FormData(form);
    const novoRelatorio = Object.fromEntries(formData.entries());

    // Gera um ID único para o novo relatório
    novoRelatorio.id = Date.now();

    // Define o status da medicação com base no checkbox
    if (novoRelatorio.medicamento) {
      novoRelatorio.statusMedicacao = novoRelatorio["foi-medicado"]
        ? "Medicado"
        : "Não Medicado";
    } else {
      novoRelatorio.statusMedicacao = "N/A";
    }
    delete novoRelatorio["foi-medicado"]; // Remove o campo do checkbox que não precisamos salvar

    listaRelatorios.push(novoRelatorio);
    salvarRelatorios(listaRelatorios);

    alert("Registro diário salvo com sucesso!");
    window.location.href = "../../index.html?pagina=pagina-relatorios";
  });
});
