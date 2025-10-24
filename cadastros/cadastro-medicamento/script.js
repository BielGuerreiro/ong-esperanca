// Funções de dados no topo do arquivo_______________________________________________________________________________
/*
  Este bloco contém funções de "ajuda" para gerenciar os dados. Elas são responsáveis 
  por carregar ('carregar') da memória do navegador (sessionStorage) as listas de 
  tratamentos e de residentes, e também por salvar ('salvar') essas listas de volta 
  na memória após qualquer alteração.
*/
// =========================
// 🔹 Funções de conexão com o backend (API)
// =========================

// Buscar todos os tratamentos (GET /medicamentos)
async function carregarTratamentos() {
  try {
    const response = await fetch("http://localhost:3000/medicamentos");
    if (!response.ok) {
      throw new Error("Erro ao buscar tratamentos");
    }
    return await response.json();
  } catch (error) {
    console.error("Erro ao carregar tratamentos:", error);
    alert("Erro ao carregar lista de tratamentos.");
    return [];
  }
}

// Criar ou atualizar um tratamento (POST ou PUT)
async function salvarTratamento(dadosTratamento, isEditMode = false, id = null) {
  try {
    const url = isEditMode
      ? `http://localhost:3000/medicamentos/${id}` // PUT para editar
      : "http://localhost:3000/medicamentos"; // POST para criar

    const method = isEditMode ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dadosTratamento),
    });

    if (!response.ok) {
      throw new Error("Erro ao salvar tratamento");
    }

    return await response.json();
  } catch (error) {
    console.error("Erro ao salvar tratamento:", error);
    alert("Erro ao salvar o tratamento.");
  }
}

// Buscar lista de residentes (GET /criancas)
async function carregarResidentes() {
  try {
    const response = await fetch("http://localhost:3000/criancas");
    if (!response.ok) {
      throw new Error("Erro ao buscar residentes");
    }
    return await response.json();
  } catch (error) {
    console.error("Erro ao carregar residentes:", error);
    alert("Erro ao carregar lista de residentes.");
    return [];
  }
}


// O código principal roda quando a página carrega_______________________________________________________________________________
/*
  Este é o bloco principal que é executado assim que a página HTML termina de carregar. 
  Ele é o responsável por iniciar todas as funcionalidades do formulário, como 
  selecionar os elementos, verificar se a página está em modo de edição, popular 
  os campos de seleção e definir o que acontece quando os botões são clicados.
*/
document.addEventListener("DOMContentLoaded", async function () {
  const form = document.getElementById("form-medicamento");
  const selectResidente = document.getElementById("residente_id");
  const botaoSubmit = document.querySelector(".btn-enviar");
  const botaoCancelar = document.querySelector(".btn-cancelar");

  const urlParams = new URLSearchParams(window.location.search);
  const tratamentoId = urlParams.get("id");
  const isEditMode = Boolean(tratamentoId);

  // --- LÓGICA DE EDIÇÃO ------------------------------------------------------
  if (isEditMode) {
    const titulo = document.querySelector("h2");
    if (titulo) titulo.textContent = "Editar Tratamento";
    if (botaoSubmit) botaoSubmit.textContent = "SALVAR ALTERAÇÕES";

    try {
      // Busca o tratamento no backend
      const response = await fetch(`http://localhost:3000/medicamentos/${tratamentoId}`);
      if (!response.ok) throw new Error("Erro ao buscar tratamento para edição");

<<<<<<< HEAD
      const tratamentoParaEditar = await response.json();

      // Preenche os campos do formulário
=======
    if (tratamentoParaEditar) {
>>>>>>> 68eb7771a93aa7a3808d8f946c93607c4aa2b6e3
      Object.keys(tratamentoParaEditar).forEach((key) => {
  const campo = form.elements[key];
  if (campo) {
    // Corrige o formato da data antes de preencher o input
    if (campo.type === "date" && tratamentoParaEditar[key]) {
      const dataFormatada = new Date(tratamentoParaEditar[key])
        .toISOString()
        .split("T")[0]; // Pega só a parte yyyy-mm-dd
      campo.value = dataFormatada;
    } else {
      campo.value = tratamentoParaEditar[key];
    }
    }
});
    } catch (error) {
      console.error("Erro ao carregar tratamento:", error);
      alert("Erro ao carregar os dados do tratamento para edição.");
    }
  }

  // --- POPULAR RESIDENTES ----------------------------------------------------
  try {
    const listaResidentes = await carregarResidentes();

    if (selectResidente) {
      if (!isEditMode) {
        selectResidente.innerHTML =
          '<option value="" disabled selected>Selecione um residente</option>';
      }

      listaResidentes.forEach((residente) => {
        const option = new Option(
          `${residente.primeiro_nome} ${residente.sobrenome}`,
          residente.id
        );
        selectResidente.appendChild(option);
      });
    }
  } catch (error) {
    console.error("Erro ao carregar residentes:", error);
    alert("Erro ao carregar lista de residentes.");
  }

<<<<<<< HEAD
  // --- LÓGICA DE SALVAR (CRIAR OU EDITAR) ------------------------------------
  form.addEventListener("submit", async function (event) {
=======
  // Popula a seleção de RESIDENTES_______________________________________________________________________________
  /*
    Este trecho de código é responsável por preencher o campo de seleção "Para qual Residente?". 
    Ele busca a lista de todos os residentes cadastrados e cria uma opção no menu dropdown 
    para cada um deles, facilitando a vinculação do tratamento ao residente correto.
  */
  const listaResidentes = carregarResidentes();
  if (selectResidente) {
    if (!isEditMode) {
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
>>>>>>> 68eb7771a93aa7a3808d8f946c93607c4aa2b6e3
    event.preventDefault();

    if (!form.checkValidity()) {
      alert("Por favor, preencha todos os campos obrigatórios (*).");
      form.classList.add("form-foi-validado");
      return;
    }

    const formData = new FormData(form);
    const dadosTratamento = Object.fromEntries(formData.entries());

<<<<<<< HEAD
    try {
      let response;
      if (isEditMode) {
        // Atualiza tratamento existente
        response = await fetch(`http://localhost:3000/medicamentos/${tratamentoId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dadosTratamento),
        });
      } else {
        // Cria novo tratamento
        response = await fetch("http://localhost:3000/medicamentos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...dadosTratamento, status: "Pendente" }),
        });
      }

      if (!response.ok) throw new Error("Erro ao salvar tratamento");

      alert(isEditMode ? "Tratamento atualizado com sucesso!" : "Tratamento cadastrado com sucesso!");

      // Redireciona de volta para a página principal
      const origem = urlParams.get("origem") || "pagina-medicamentos";
      window.location.href = `../../index.html?pagina=${origem}`;
    } catch (error) {
      console.error("Erro ao salvar tratamento:", error);
      alert("Erro ao salvar tratamento no banco de dados.");
    }
=======
    if (isEditMode) {
      const index = listaTratamentos.findIndex((t) => t.id == tratamentoId);
      if (index !== -1) {
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
      dadosTratamento.id = Date.now();
      dadosTratamento.status = "Pendente";
      listaTratamentos.push(dadosTratamento);
      salvarTratamentos(listaTratamentos);
      alert("Tratamento cadastrado com sucesso!");
    }

    const origem = urlParams.get("origem") || "pagina-medicamentos";
    window.location.href = `../../index.html?pagina=${origem}`;
>>>>>>> 68eb7771a93aa7a3808d8f946c93607c4aa2b6e3
  });

  // --- BOTÃO CANCELAR --------------------------------------------------------
  if (botaoCancelar) {
    botaoCancelar.addEventListener("click", function () {
      const origem = urlParams.get("origem") || "pagina-medicamentos";
      window.location.href = `../../index.html?pagina=${origem}`;
    });
  }



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
