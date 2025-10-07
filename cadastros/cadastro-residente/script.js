// Funções de dados para carregar e salvar a lista de residentes_______________________________________________________________________________
/*
  Estas são as funções de "ajuda" que cuidam da persistência dos dados. 
  'carregarResidentes' lê a lista de residentes da memória do navegador (sessionStorage),
  enquanto 'salvarResidentes' grava a lista atualizada de volta na memória.
*/
function carregarResidentes() {
  const dados = sessionStorage.getItem("listaResidentes");
  return JSON.parse(dados || "[]");
}

function salvarResidentes(lista) {
  sessionStorage.setItem("listaResidentes", JSON.stringify(lista));
}

// O código principal roda quando a página carrega_______________________________________________________________________________
/*
  Este é o bloco de código principal que é executado assim que toda a página HTML 
  é carregada. Ele serve como o ponto de partida que organiza e inicializa 
  todas as funcionalidades do formulário.
*/
document.addEventListener("DOMContentLoaded", function () {
  // --- 1. SELEÇÃO DOS ELEMENTOS DO HTML _______________________________________________________________________________
  /*
    Nesta primeira parte, o script "captura" todos os elementos importantes da página 
    HTML (o formulário, as etapas, os botões, etc.) e os armazena em variáveis. 
    Isso é feito para que o restante do código possa manipular e interagir com 
    esses elementos de forma fácil e eficiente.
  */
  const form = document.getElementById("form-residente");
  if (!form) {
    console.error(
      "ERRO CRÍTICO: O formulário com id='form-residente' não foi encontrado!"
    );
    return; // Para a execução se o formulário não existir
  }
  const etapas = document.querySelectorAll(".etapa-form");
  const botoesProximo = document.querySelectorAll(".btn-proximo");
  const botoesVoltar = document.querySelectorAll(".btn-voltar");
  const botoesCancelar = document.querySelectorAll(".btn-cancelar");
  const botaoSubmit = document.querySelector(".btn-enviar");
  const selectFrequentaEscola = document.getElementById("frequenta-escola");
  const containerDadosEscola = document.getElementById(
    "dados-escola-container"
  );
  let etapaAtual = 0;

  // --- 2. LÓGICA DE EDIÇÃO (COM VERIFICAÇÕES DE SEGURANÇA) _______________________________________________________________________________
  /*
    Este é o controlador do "Modo de Edição". Ele verifica se a URL da página contém 
    um ID de residente. Se um ID for encontrado, o script ajusta a interface (título e botão),
    busca os dados daquele residente específico e preenche automaticamente todos os campos 
    do formulário, incluindo a lógica para mostrar ou esconder os dados da escola.
  */
  const urlParams = new URLSearchParams(window.location.search);
  const residenteId = urlParams.get("id");
  const isEditMode = Boolean(residenteId);

  if (isEditMode) {
    console.log("Modo de Edição Ativado! ID:", residenteId); // Mensagem de diagnóstico

    const titulo = document.querySelector("h2");
    if (titulo) {
      titulo.textContent = "Editar Ficha de Residente";
    }
    if (botaoSubmit) {
      botaoSubmit.textContent = "SALVAR ALTERAÇÕES";
    }

    const listaResidentes = carregarResidentes();
    const residenteParaEditar = listaResidentes.find(
      (r) => r.id == residenteId
    );

    if (residenteParaEditar) {
      Object.keys(residenteParaEditar).forEach((key) => {
        const campo = form.elements[key];
        if (campo) {
          if (campo.type === "radio") {
            document.querySelector(
              `input[name="${key}"][value="${residenteParaEditar[key]}"]`
            ).checked = true;
          } else {
            campo.value = residenteParaEditar[key];
          }
        }
      });
      if (selectFrequentaEscola) {
        selectFrequentaEscola.dispatchEvent(new Event("change"));
      }
    }
  }

  // --- 3. CONFIGURAÇÃO DOS EVENTOS _______________________________________________________________________________
  /*
    Esta seção torna a página interativa. Ela define o que acontece quando os botões 
    são clicados. 'mostrarEtapa' controla a visibilidade das diferentes partes do 
    formulário. Os blocos seguintes ativam os botões "Próximo", "Voltar" e "Cancelar".
    A última parte, 'form.addEventListener', é a mais importante: ela gerencia o processo 
    de salvar os dados, seja criando um novo residente ou atualizando um existente.
  */
  function mostrarEtapa(indiceEtapa) {
    etapas.forEach((etapa, indice) =>
      etapa.classList.toggle("ativo", indice === indiceEtapa)
    );
  }

  botoesProximo.forEach((botao) => {
    botao.addEventListener("click", () => {
      if (etapaAtual < etapas.length - 1) {
        etapaAtual++;
        mostrarEtapa(etapaAtual);
      }
    });
  });

  botoesVoltar.forEach((botao) => {
    botao.addEventListener("click", () => {
      if (etapaAtual > 0) {
        etapaAtual--;
        mostrarEtapa(etapaAtual);
      }
    });
  });

  botoesCancelar.forEach((botao) => {
    botao.addEventListener("click", function () {
      if (confirm("Tem certeza que deseja cancelar?")) {
        window.location.href = "../../index.html?pagina=pagina-residentes";
      }
    });
  });

  if (selectFrequentaEscola) {
    selectFrequentaEscola.addEventListener("change", function () {
      if (containerDadosEscola) {
        containerDadosEscola.style.display =
          this.value === "sim" ? "block" : "none";
      }
    });
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!form.checkValidity()) {
      alert("Por favor, preencha todos os campos obrigatórios (*).");
      form.classList.add("form-foi-validado");
      return;
    }
    const listaResidentes = carregarResidentes();
    const formData = new FormData(form);
    const dadosResidente = Object.fromEntries(formData.entries());

    if (isEditMode) {
      const index = listaResidentes.findIndex((r) => r.id == residenteId);
      if (index !== -1) {
        listaResidentes[index] = {
          ...dadosResidente,
          id: parseInt(residenteId),
        };
        salvarResidentes(listaResidentes);
        alert("Ficha atualizada com sucesso!");
      }
    } else {
      dadosResidente.id = Date.now();
      listaResidentes.push(dadosResidente);
      salvarResidentes(listaResidentes);
      alert("Residente cadastrado com sucesso!");
    }
    const origem = urlParams.get("origem") || "pagina-residentes";
    window.location.href = `../../index.html?pagina=${origem}`;
  });

  // --- 4. INICIALIZAÇÃO DA PÁGINA _______________________________________________________________________________
  /*
    Este é o comando final. Após todas as funções e lógicas terem sido definidas, 
    esta linha é executada para garantir que a primeira etapa do formulário ('etapa 1') 
    seja exibida para o usuário assim que ele abre a página.
  */
  mostrarEtapa(etapaAtual);
});
