// Funções de dados no topo do arquivo_______________________________________________________________________________
/*
  Este bloco contém funções de "ajuda" para gerenciar os dados. Elas são responsáveis 
  por carregar ('carregar') da memória do navegador (sessionStorage) as listas de 
  tratamentos e de residentes, e também por salvar ('salvar') essas listas de volta 
  na memória após qualquer alteração.
*/
function carregarTratamentos() {
  return JSON.parse(sessionStorage.getItem("listaTratamentos") || "[]");
}
function salvarTratamentos(lista) {
  sessionStorage.setItem("listaTratamentos", JSON.stringify(lista));
}
function carregarResidentes() {
  return JSON.parse(sessionStorage.getItem("listaResidentes") || "[]");
}

// O código principal roda quando a página carrega_______________________________________________________________________________
/*
  Este é o bloco principal que é executado assim que a página HTML termina de carregar. 
  Ele é o responsável por iniciar todas as funcionalidades do formulário, como 
  selecionar os elementos, verificar se a página está em modo de edição, popular 
  os campos de seleção e definir o que acontece quando os botões são clicados.
*/
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("form-medicamento");
  const selectResidente = document.getElementById("residenteId");
  const botaoSubmit = document.querySelector(".btn-enviar");
  const botaoCancelar = document.querySelector(".btn-cancelar");

  // --- LÓGICA DE EDIÇÃO _______________________________________________________________________________
  /*
    Esta seção ativa o "Modo de Edição". Ela verifica se a URL da página contém um ID. 
    Se um ID for encontrado, o script altera o título e o texto do botão de salvar, 
    busca os dados daquele tratamento específico na memória e preenche os campos do 
    formulário com as informações existentes.
  */
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

  // Popula a seleção de RESIDENTES_______________________________________________________________________________
  /*
    Este trecho de código é responsável por preencher o campo de seleção "Para qual Residente?". 
    Ele busca a lista de todos os residentes cadastrados e cria uma opção no menu dropdown 
    para cada um deles, facilitando a vinculação do tratamento ao residente correto.
  */
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

  // --- LÓGICA DE SALVAR (UNIFICADA PARA CRIAR E EDITAR) _______________________________________________________________________________
  /*
    Este bloco define a ação principal do formulário. Quando o botão de salvar é clicado, 
    ele primeiro valida se os campos obrigatórios foram preenchidos. Depois, verifica se 
    está em "Modo de Edição" para decidir se deve ATUALIZAR um tratamento existente ou 
    CRIAR um novo (com status "Pendente"). Após salvar, exibe um alerta de sucesso e 
    redireciona o usuário de volta para a lista de medicamentos.
  */
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

  // Lógica do botão Cancelar_______________________________________________________________________________
  /*
    Esta parte do código adiciona a funcionalidade ao botão "Cancelar". Ao ser clicado,
    ele exibe uma caixa de diálogo pedindo confirmação. Se o usuário confirmar, ele 
    é redirecionado de volta para a página de medicamentos, descartando quaisquer 
    alterações feitas no formulário.
  */
  if (botaoCancelar) {
    botaoCancelar.addEventListener("click", function () {
      if (confirm("Tem certeza que deseja cancelar?")) {
        const origem = urlParams.get("origem") || "pagina-medicamentos";
        window.location.href = `../../index.html?pagina=${origem}`;
      }
    });
  }
});
