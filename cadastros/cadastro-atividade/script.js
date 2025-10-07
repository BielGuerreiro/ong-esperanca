// ===== CAMADA DE DADOS E FUNÇÕES GLOBAIS _______________________________________________________________________________
/*
  Estas são funções de "ajuda" reutilizáveis. Elas são responsáveis por 
  buscar e salvar as listas de agendamentos de atividades e de residentes 
  no sessionStorage do navegador, que funciona como uma memória temporária 
  para os dados do seu sistema.
*/
function carregarAgendamentos() {
  return JSON.parse(
    sessionStorage.getItem("listaAgendamentosAtividade") || "[]"
  );
}
function salvarAgendamentos(lista) {
  sessionStorage.setItem("listaAgendamentosAtividade", JSON.stringify(lista));
}
function carregarResidentes() {
  return JSON.parse(sessionStorage.getItem("listaResidentes") || "[]");
}

// ===== CÓDIGO PRINCIPAL DA PÁGINA _______________________________________________________________________________
/*
  Este é o bloco principal que roda assim que a página de cadastro de atividade 
  é totalmente carregada. Ele coordena todas as outras funcionalidades 
  dentro da página, como a lógica de edição, seleção de participantes e o 
  salvamento do formulário.
*/
document.addEventListener("DOMContentLoaded", function () {
  // --- Seletores de Elementos ---
  const form = document.getElementById("form-atividade");
  const botaoSubmit = document.querySelector(".btn-enviar");
  const botaoCancelar = document.querySelector(".btn-cancelar");

  // --- LÓGICA DE EDIÇÃO (ADICIONADA) _______________________________________________________________________________
  /*
    Este trecho verifica se a página foi aberta através de um link de "Editar" 
    (procurando por um `id` na URL). Se for o caso, ele ativa o "Modo de Edição": 
    muda o título da página e o texto do botão, busca os dados da atividade específica 
    que está sendo editada e preenche todos os campos do formulário com essas 
    informações, incluindo a lista de participantes.
  */
  const urlParams = new URLSearchParams(window.location.search);
  const atividadeId = urlParams.get("id");
  const isEditMode = Boolean(atividadeId);

  if (isEditMode) {
    const titulo = document.querySelector("h2");
    if (titulo) titulo.textContent = "Editar Atividade";
    if (botaoSubmit) botaoSubmit.textContent = "SALVAR ALTERAÇÕES";

    const listaAgendamentos = carregarAgendamentos();
    const atividadeParaEditar = listaAgendamentos.find(
      (a) => a.id == atividadeId
    );

    if (atividadeParaEditar) {
      Object.keys(atividadeParaEditar).forEach((key) => {
        const campo = form.elements[key];
        if (campo) {
          campo.value = atividadeParaEditar[key];
        }
      });
      if (
        atividadeParaEditar.participantes_ids &&
        typeof atividadeParaEditar.participantes_ids === "string"
      ) {
        idsSelecionados = atividadeParaEditar.participantes_ids.split(",");
        atualizarTags();
      }
    }
  }

  // --- Lógica para Seleção Múltipla de Participantes _______________________________________________________________________________
  /*
    Esta seção cuida da funcionalidade de adicionar participantes a uma atividade. 
    Ela primeiro carrega a lista de todos os residentes e os adiciona como opções 
    no campo de seleção. Depois, ela gerencia a criação e remoção das "tags" visuais 
    para cada participante que você seleciona, guardando os IDs para salvar no final.
  */
  const selectResidente = document.getElementById("residente-select");
  const tagsContainer = document.getElementById(
    "residentes-selecionados-container"
  );
  const hiddenInputIds = document.getElementById("participantes_ids");
  let idsSelecionados = [];

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

  function atualizarTags() {
    if (!tagsContainer || !hiddenInputIds) return;
    tagsContainer.innerHTML = "";
    idsSelecionados.forEach((id) => {
      const residente = listaResidentes.find((r) => r.id == id);
      if (residente) {
        const tag = document.createElement("span");
        tag.className = "tag";
        tag.textContent = `${residente["primeiro-nome"]} ${residente.sobrenome}`;
        const removeIcon = document.createElement("i");
        removeIcon.className = "bx bx-x";
        removeIcon.onclick = () => {
          idsSelecionados = idsSelecionados.filter(
            (selectedId) => selectedId != id
          );
          atualizarTags();
        };
        tag.appendChild(removeIcon);
        tagsContainer.appendChild(tag);
      }
    });
    hiddenInputIds.value = idsSelecionados.join(",");
  }

  if (selectResidente) {
    selectResidente.addEventListener("change", function () {
      const id = this.value;
      if (id && !idsSelecionados.includes(id)) {
        idsSelecionados.push(id);
        atualizarTags();
      }
      this.value = "";
    });
  }

  // --- Lógica dos Botões e Envio _______________________________________________________________________________
  /*
    Aqui é definida a ação dos botões principais. O código do botão "Cancelar" 
    pergunta se o usuário tem certeza e o redireciona. A parte principal, no 'submit' do formulário,
    valida os campos, verifica se está em "Modo de Edição" para decidir se deve 
    ATUALIZAR ou CRIAR uma atividade, exibe um alerta de sucesso e, por fim, 
    redireciona o usuário de volta para a agenda.
  */
  if (botaoCancelar) {
    botaoCancelar.addEventListener("click", function () {
      if (confirm("Tem certeza que deseja cancelar?")) {
        window.location.href = "../../index.html?pagina=pagina-atividades";
      }
    });
  }

  if (botaoSubmit) {
    botaoSubmit.addEventListener("click", function () {
      form.classList.add("form-foi-validado");
      if (!form.checkValidity()) {
        alert("Por favor, preencha todos os campos obrigatórios (*).");
      }
    });
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!form.checkValidity()) return;

    const listaAgendamentos = carregarAgendamentos();
    const formData = new FormData(form);
    const dadosAtividade = Object.fromEntries(formData.entries());

    if (isEditMode) {
      // ATUALIZA
      const index = listaAgendamentos.findIndex((a) => a.id == atividadeId);
      if (index !== -1) {
        const agendamentoExistente = listaAgendamentos[index];
        listaAgendamentos[index] = {
          ...agendamentoExistente,
          ...dadosAtividade,
          id: parseInt(atividadeId),
        };
        salvarAgendamentos(listaAgendamentos);
        alert("Atividade atualizada com sucesso!");
      }
    } else {
      // CRIA NOVO
      dadosAtividade.id = Date.now();
      dadosAtividade.status = "Agendada";
      listaAgendamentos.push(dadosAtividade);
      salvarAgendamentos(listaAgendamentos);
      alert("Atividade agendada com sucesso!");
    }

    // Redireciona após o alerta
    const origem = urlParams.get("origem") || "pagina-atividades";
    window.location.href = `../../index.html?pagina=${origem}`;
  });
});
