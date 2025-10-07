// Funções de dados no topo do arquivo_______________________________________________________________________________
/*
  Este bloco contém funções de "ajuda" para gerenciar os dados. As funções 'carregar' 
  e 'salvar' são responsáveis por ler e escrever as listas de responsáveis e de 
  residentes na memória do navegador (sessionStorage). A função 'configurarValidacaoDatas' 
  impede que o usuário insira datas inválidas nos campos de data do formulário.
*/
function carregarResponsaveis() {
  return JSON.parse(sessionStorage.getItem("listaResponsaveis") || "[]");
}
function salvarResponsaveis(lista) {
  sessionStorage.setItem("listaResponsaveis", JSON.stringify(lista));
}
function carregarResidentes() {
  return JSON.parse(sessionStorage.getItem("listaResidentes") || "[]");
}

function configurarValidacaoDatas() {
  const hoje = new Date().toISOString().split("T")[0];
  const inputNascimento = document.getElementById("nascimento");
  if (inputNascimento) {
    inputNascimento.max = hoje;
    inputNascimento.min = "1900-01-01";
  }
}

// ===== CÓDIGO PRINCIPAL DA PÁGINA _______________________________________________________________________________
/*
  Este é o motor da página, que roda quando o HTML termina de carregar. Ele organiza 
  todas as funcionalidades do formulário, como a seleção de elementos, a verificação 
  do modo de edição, a navegação entre etapas e o processo de salvar os dados.
*/
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("form-responsavel");
  const etapas = document.querySelectorAll(".etapa-form");
  const botoesProximo = document.querySelectorAll(".btn-proximo");
  const botoesVoltar = document.querySelectorAll(".btn-voltar");
  const botoesCancelar = document.querySelectorAll(".btn-cancelar");
  const botaoSubmit = document.querySelector(".btn-enviar");
  const selectResidente = document.getElementById("residenteId");
  let etapaAtual = 0;

  // --- LÓGICA DE EDIÇÃO (ADICIONADA) _______________________________________________________________________________
  /*
    Esta seção ativa o "Modo de Edição". Ela verifica se a URL da página contém um ID.
    Se um ID for encontrado, o script altera a interface (título e texto do botão),
    busca os dados daquele responsável específico e preenche todos os campos do 
    formulário com as informações que já foram salvas.
  */
  const urlParams = new URLSearchParams(window.location.search);
  const responsavelId = urlParams.get("id");
  const isEditMode = Boolean(responsavelId);

  if (isEditMode) {
    const titulo = document.querySelector("h2");
    if (titulo) titulo.textContent = "Editar Ficha de Responsável";
    if (botaoSubmit) botaoSubmit.textContent = "SALVAR ALTERAÇÕES";

    const listaResponsaveis = carregarResponsaveis();
    const responsavelParaEditar = listaResponsaveis.find(
      (r) => r.id == responsavelId
    );
    if (responsavelParaEditar) {
      Object.keys(responsavelParaEditar).forEach((key) => {
        const campo = form.elements[key];
        if (campo) {
          campo.value = responsavelParaEditar[key];
        }
      });
    }
  }

  // Popula o campo de seleção com os residentes existentes_______________________________________________________________________________
  /*
    Este trecho é responsável por preencher o campo de seleção "Residente Vinculado".
    Ele busca a lista de todos os residentes cadastrados e cria uma opção no menu
    dropdown para cada um, permitindo vincular o responsável ao residente correto.
  */
  const listaResidentes = carregarResidentes();
  if (selectResidente) {
    listaResidentes.forEach((residente) => {
      const option = new Option(
        `${residente["primeiro-nome"]} ${residente.sobrenome}`,
        residente.id
      );
      selectResidente.appendChild(option);
    });
  }

  // --- LÓGICA DE SALVAR (UNIFICADA) _______________________________________________________________________________
  /*
    Este bloco define a ação principal do formulário ao ser enviado. Ele valida se os 
    campos obrigatórios estão preenchidos e, em seguida, verifica se está em "Modo de Edição"
    para decidir se deve ATUALIZAR um responsável existente ou CRIAR um novo. Ao final,
    exibe um alerta de sucesso e redireciona o usuário para a página de responsáveis.
  */
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!form.checkValidity()) {
      alert("Por favor, preencha todos os campos obrigatórios (*).");
      return;
    }
    const listaResponsaveis = carregarResponsaveis();
    const formData = new FormData(form);
    const dadosResponsavel = Object.fromEntries(formData.entries());

    if (isEditMode) {
      // ATUALIZA
      const index = listaResponsaveis.findIndex((r) => r.id == responsavelId);
      if (index !== -1) {
        listaResponsaveis[index] = {
          ...dadosResponsavel,
          id: parseInt(responsavelId),
        };
        salvarResponsaveis(listaResponsaveis);
        alert("Ficha do responsável atualizada com sucesso!");
      }
    } else {
      // CRIA NOVO
      dadosResponsavel.id = Date.now();
      listaResponsaveis.push(dadosResponsavel);
      salvarResponsaveis(listaResponsaveis);
      alert("Responsável cadastrado com sucesso!");
    }
    const origem = urlParams.get("origem") || "pagina-responsavel";
    window.location.href = `../../index.html?pagina=${origem}`;
  });

  // --- LÓGICAS DE NAVEGAÇÃO E INTERAÇÃO (SEU CÓDIGO ORIGINAL) _______________________________________________________________________________
  /*
    Esta seção gerencia a experiência do usuário com o formulário de múltiplas etapas.
    A função 'mostrarEtapa' controla qual etapa do formulário está visível. Os blocos 
    seguintes ativam os botões "Próximo", "Voltar" e "Cancelar", definindo o que acontece
    quando cada um deles é clicado.
  */
  function mostrarEtapa(i) {
    etapas.forEach((e, idx) => e.classList.toggle("ativo", idx === i));
  }
  botoesProximo.forEach((b) =>
    b.addEventListener("click", () => {
      if (etapaAtual < etapas.length - 1) {
        etapaAtual++;
        mostrarEtapa(etapaAtual);
      }
    })
  );
  botoesVoltar.forEach((b) =>
    b.addEventListener("click", () => {
      if (etapaAtual > 0) {
        etapaAtual--;
        mostrarEtapa(etapaAtual);
      }
    })
  );
  botoesCancelar.forEach((b) =>
    b.addEventListener("click", () => {
      if (confirm("Deseja cancelar?")) {
        window.location.href = "../../index.html?pagina=pagina-responsavel";
      }
    })
  );

  if (botaoSubmit) {
    botaoSubmit.addEventListener("click", function () {
      form.classList.add("form-foi-validado");
      if (!form.checkValidity()) {
        alert(
          "Por favor, preencha todos os campos obrigatórios (*) antes de prosseguir."
        );
      }
    });
  }

  configurarValidacaoDatas();
  mostrarEtapa(etapaAtual);
});
