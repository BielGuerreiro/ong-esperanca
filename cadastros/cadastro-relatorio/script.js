// ===== CAMADA DE DADOS (Funções para carregar e salvar no sessionStorage) _______________________________________________________________________________
/*
  Este bloco contém funções de "ajuda" para gerenciar os dados. Elas são responsáveis 
  por carregar ('carregar') da memória do navegador (sessionStorage) as listas de 
  relatórios, residentes e tratamentos, e também por salvar ('salvar') essas listas 
  de volta na memória após qualquer alteração.
*/
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
/*
  Este é o motor da página, executado quando o HTML termina de carregar. Ele coordena 
  todas as funcionalidades do formulário, como detectar o modo de edição, preencher 
  as listas de seleção e definir o que acontece ao salvar ou cancelar.
*/
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("form-relatorio");
  const selectResidente = document.getElementById("residenteId");
  const selectMedicamento = document.getElementById("medicamento");
  const inputDataRelatorio = document.getElementById("data");
  const botaoSubmit = document.querySelector(".btn-enviar");
  const botaoCancelar = document.querySelector(".btn-cancelar");

  // --- LÓGICA DE EDIÇÃO (ADICIONADA) _______________________________________________________________________________
  /*
    Esta seção ativa o "Modo de Edição". Ela verifica se a URL da página contém um ID. 
    Se um ID for encontrado, o script altera a interface (título e botão), busca os 
    dados daquele relatório específico na memória e preenche os campos do formulário,
    incluindo o estado correto do checkbox de medicação.
  */
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
          if (campo.type === "checkbox" && key === "foi-medicado") {
            // Pula, pois será tratado abaixo
          } else {
            campo.value = relatorioParaEditar[key];
          }
        }
      });
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

  // Popula a lista de seleção de RESIDENTES_______________________________________________________________________________
  /*
    Este trecho é responsável por preencher o campo de seleção "Para qual Residente?". 
    Ele busca a lista de todos os residentes cadastrados e cria uma opção no menu 
    dropdown para cada um, facilitando a criação do relatório para o residente correto.
  */
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
  }

  // Popula a lista de seleção de MEDICAMENTOS_______________________________________________________________________________
  /*
    Esta parte do código preenche o campo de seleção "Medicamento Administrado". 
    Ela busca a lista de todos os tratamentos agendados e cria uma opção no menu 
    dropdown para cada um, mostrando o nome e a dosagem do medicamento.
  */
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

  // --- LÓGICA DE ENVIO DO FORMULÁRIO (AGORA UNIFICADA) _______________________________________________________________________________
  /*
    Este bloco define a ação principal do formulário. Ao salvar, ele valida os campos, 
    coleta os dados e processa o status da medicação com base no checkbox. Em seguida, 
    verifica se está em "Modo de Edição" para ATUALIZAR um relatório existente ou CRIAR 
    um novo. No final, exibe um alerta de sucesso e redireciona o usuário.
  */
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!form.checkValidity()) {
      alert("Preencha os campos obrigatórios.");
      return;
    }

    const listaRelatorios = carregarRelatorios();
    const formData = new FormData(form);
    const dadosRelatorio = Object.fromEntries(formData.entries());

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

    const origem = urlParams.get("origem") || "pagina-relatorios";
    window.location.href = `../../index.html?pagina=${origem}`;
  });

  // Lógica do botão Cancelar_______________________________________________________________________________
  /*
    Esta seção ativa o botão "Cancelar". Ao ser clicado, exibe uma mensagem pedindo 
    confirmação ao usuário. Se confirmado, a operação é cancelada e o usuário é 
    redirecionado de volta para a página de relatórios, sem salvar nenhuma informação.
  */
  if (botaoCancelar) {
    botaoCancelar.addEventListener("click", function () {
      if (confirm("Tem certeza que deseja cancelar o registro?")) {
        window.location.href = "../../index.html?pagina=pagina-relatorios";
      }
    });
  }
});
