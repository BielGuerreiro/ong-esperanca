// Funções de dados para carregar e salvar a lista de tratamentos
function carregarTratamentos() {
  return JSON.parse(sessionStorage.getItem("listaTratamentos") || "[]");
}
function salvarTratamentos(lista) {
  sessionStorage.setItem("listaTratamentos", JSON.stringify(lista));
}
function carregarResidentes() {
  return JSON.parse(sessionStorage.getItem("listaResidentes") || "[]");
}

// O código principal roda quando a página carrega
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("form-medicamento");
  const selectResidente = document.getElementById("residenteId");
  const botaoSubmit = document.querySelector(".btn-enviar");
  const botaoCancelar = document.querySelector(".btn-cancelar");

  // --- LÓGICA DE EDIÇÃO ---
  const urlParams = new URLSearchParams(window.location.search);
  const tratamentoId = urlParams.get("id");
  const isEditMode = Boolean(tratamentoId);

  if (isEditMode) {
    const titulo = document.querySelector("h2");
    if (titulo) titulo.textContent = "Editar Tratamento";
    if (botaoSubmit) botaoSubmit.textContent = "SALVAR ALTERAÇÕES";

    const listaTratamentos = carregarTratamentos();
    const tratamentoParaEditar = listaTratamentos.find(
      (t) => t.id == tratamentoId
    );

    if (tratamentoParaEditar) {
      // Preenche os campos do formulário com os dados existentes
      Object.keys(tratamentoParaEditar).forEach((key) => {
        const campo = form.elements[key];
        if (campo) {
          campo.value = tratamentoParaEditar[key];
        }
      });
    }
  }

  // Popula a seleção de RESIDENTES
  const listaResidentes = carregarResidentes();
  if (selectResidente) {
    // Adiciona uma opção padrão "Selecione" antes de popular
    if (!isEditMode) {
      // Só mostra no modo de cadastro
      selectResidente.innerHTML =
        '<option value="" disabled selected>Selecione um residente</option>';
    }
    listaResidentes.forEach((residente) => {
      const option = new Option(
        `${residente["primeiro-nome"]} ${residente.sobrenome}`,
        residente.id
      );
      selectResidente.appendChild(option);
    });
    // Se estiver em modo de edição, o loop acima já terá selecionado o residente correto
  }

  // --- LÓGICA DE SALVAR (UNIFICADA PARA CRIAR E EDITAR) ---
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!form.checkValidity()) {
      alert("Por favor, preencha todos os campos obrigatórios (*).");
      form.classList.add("form-foi-validado");
      return;
    }

    const listaTratamentos = carregarTratamentos();
    const formData = new FormData(form);
    const dadosTratamento = Object.fromEntries(formData.entries());

    if (isEditMode) {
      // ATUALIZA o tratamento existente
      const index = listaTratamentos.findIndex((t) => t.id == tratamentoId);
      if (index !== -1) {
        // Pega o status existente para não perdê-lo na edição
        const tratamentoExistente = listaTratamentos[index];
        listaTratamentos[index] = {
          ...tratamentoExistente,
          ...dadosTratamento,
          id: parseInt(tratamentoId),
        };
        salvarTratamentos(listaTratamentos);
        alert("Tratamento atualizado com sucesso!");
      }
    } else {
      // CRIA um novo tratamento
      dadosTratamento.id = Date.now();
      dadosTratamento.status = "Pendente"; // Status inicial para novos tratamentos
      listaTratamentos.push(dadosTratamento);
      salvarTratamentos(listaTratamentos);
      alert("Tratamento cadastrado com sucesso!");
    }

    // Redireciona de volta para a página principal de medicamentos
    const origem = urlParams.get("origem") || "pagina-medicamentos";
    window.location.href = `../../index.html?pagina=${origem}`;
  });

  // Lógica do botão Cancelar
  if (botaoCancelar) {
    botaoCancelar.addEventListener("click", function () {
      if (confirm("Tem certeza que deseja cancelar?")) {
        const origem = urlParams.get("origem") || "pagina-medicamentos";
        window.location.href = `../../index.html?pagina=${origem}`;
      }
    });
  }
});
