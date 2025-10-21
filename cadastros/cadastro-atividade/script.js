// ===== CAMADA DE DADOS E FUNÇÕES GLOBAIS _______________________________________________________________________________
/*
  Estas são funções de "ajuda" reutilizáveis. Elas são responsáveis por 
  buscar e salvar as listas de agendamentos de atividades e de residentes 
  no sessionStorage do navegador, que funciona como uma memória temporária 
  para os dados do seu sistema.
*/
// Função: buscar todas as atividades do banco
async function carregarAgendamentos() {
  try {
    const resposta = await fetch("http://localhost:3000/atividades");
    if (!resposta.ok) throw new Error("Erro ao buscar atividades");
    const lista = await resposta.json();
    return lista;
  } catch (erro) {
    console.error("Erro ao carregar agendamentos:", erro);
    return [];
  }
}

// Função: salvar nova atividade (ou editar existente)
async function salvarAgendamento(Atividades, id = null) {
  try {
    const url = id
      ? `http://localhost:3000/atividades/${id}` // editar
      : "http://localhost:3000/atividades"; // criar nova

    const metodo = id ? "PUT" : "POST";

    const resposta = await fetch(url, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Atividades),
    });

    if (!resposta.ok) {
      const erroTexto = await resposta.text();
      throw new Error(`Erro ao salvar atividade: ${erroTexto}`);
    }

    const resultado = await resposta.json();
    return resultado;
  } catch (erro) {
    console.error("Erro ao salvar agendamento:", erro);
    throw erro;
  }
}

// Função: buscar todos os residentes (crianças) do banco
async function carregarResidentes() {
  try {
    const resposta = await fetch("http://localhost:3000/criancas");
    if (!resposta.ok) throw new Error("Erro ao buscar residentes");
    const lista = await resposta.json();
    return lista;
  } catch (erro) {
    console.error("Erro ao carregar residentes:", erro);
    return [];
  }
}


// ===== CÓDIGO PRINCIPAL DA PÁGINA _______________________________________________________________________________
/*
  Este é o bloco principal que roda assim que a página de cadastro de atividade 
  é totalmente carregada. Ele coordena todas as outras funcionalidades 
  dentro da página, como a lógica de edição, seleção de participantes e o 
  salvamento do formulário.
*/
document.addEventListener("DOMContentLoaded", async function () {
  const form = document.getElementById("form-atividade");
  const botaoSubmit = document.querySelector(".btn-enviar");
  const botaoCancelar = document.querySelector(".btn-cancelar");

  const urlParams = new URLSearchParams(window.location.search);
  const atividadeId = urlParams.get("id");
  const isEditMode = Boolean(atividadeId);

  const selectResidente = document.getElementById("residente-select");
  const tagsContainer = document.getElementById("residentes-selecionados-container");
  const hiddenInputIds = document.getElementById("participantes_ids");

  let idsSelecionados = [];
  let listaResidentes = [];

  // ✅ Espera carregar os residentes do banco
  try {
    listaResidentes = await carregarResidentes();
  } catch (erro) {
    console.error("Erro ao carregar residentes:", erro);
  }

  // --- Edição (busca dados da atividade) ---
  if (isEditMode) {
    const titulo = document.querySelector(".titulo");
    if (titulo) titulo.textContent = "Editar Atividade";
    if (botaoSubmit) botaoSubmit.textContent = "SALVAR ALTERAÇÕES";

    try {
      const listaAgendamentos = await carregarAgendamentos();
      const atividadeParaEditar = listaAgendamentos.find((a) => a.id == atividadeId);

      if (atividadeParaEditar) {
        Object.keys(atividadeParaEditar).forEach((key) => {
          const campo = form.elements[key];
          if (campo) campo.value = atividadeParaEditar[key];
        });

        if (atividadeParaEditar.participantes_ids) {
          idsSelecionados = String(atividadeParaEditar.participantes_ids).split(",");
          atualizarTags();
        }
      }
    } catch (erro) {
      console.error("Erro ao carregar atividade:", erro);
    }
  }

  // --- Preenche o select de residentes ---
  if (selectResidente) {
    listaResidentes.forEach((residente) => {
      const option = new Option(
        `${residente.primeiro_nome} ${residente.sobrenome}`,
        residente.id
      );
      selectResidente.appendChild(option);
    });
  }

  function atualizarTags() {
    if (!tagsContainer || !hiddenInputIds) return;
    tagsContainer.innerHTML = "";
    idsSelecionados.forEach((id) => {
      const residente = listaResidentes.find((r) => String(r.id) === String(id));
      if (residente) {
        const tag = document.createElement("span");
        tag.className = "tag";
        tag.textContent = `${residente.primeiro_nome} ${residente.sobrenome}`;
        const removeIcon = document.createElement("i");
        removeIcon.className = "bx bx-x";
        removeIcon.onclick = () => {
          idsSelecionados = idsSelecionados.filter((selectedId) => selectedId != id);
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

  // --- Envio do formulário ---
  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    if (!form.checkValidity()) return;

    const formData = new FormData(form);
    const dadosAtividade = Object.fromEntries(formData.entries());
    dadosAtividade.participantes_ids = idsSelecionados.join(",");
    dadosAtividade.status = "Agendada";

    try {
      if (isEditMode) {
        await salvarAgendamento(dadosAtividade, atividadeId);
        alert("Atividade atualizada com sucesso!");
      } else {
        await salvarAgendamento(dadosAtividade);
        alert("Atividade agendada com sucesso!");
      }

      const origem = urlParams.get("origem") || "pagina-atividades";
      window.location.href = `../../index.html?pagina=${origem}`;
    } catch (erro) {
      console.error("Erro ao salvar atividade:", erro);
      alert("Erro ao salvar atividade.");
    }
  });
});
