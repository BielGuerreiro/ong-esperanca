// ======== CONFIGURAÇÃO DE VALIDAÇÃO DAS DATAS ========
function configurarValidacaoDatas() {
  const hoje = new Date().toISOString().split("T")[0];
  const inputNascimento = document.getElementById("data_nascimento");
  if (inputNascimento) {
    inputNascimento.max = hoje;
    inputNascimento.min = "1900-01-01";
  }
}

// Busca todos os responsáveis do banco
async function carregarResponsaveis() {
  try {
    const resposta = await fetch("http://localhost:3000/responsaveis");
    if (!resposta.ok) throw new Error("Erro ao buscar responsáveis");
    const lista = await resposta.json();
    return lista;
  } catch (erro) {
    console.error("Erro ao carregar responsáveis:", erro);
    return [];
  }
}

// Busca todos os residentes (crianças) do banco
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


// FUNÇÃO PARA MOSTRAR/ESCONDER SENHA
function iniciarToggleSenha(inputId, toggleId) {
  const inputSenha = document.getElementById(inputId);
  const toggleIcon = document.getElementById(toggleId);
  if (inputSenha && toggleIcon) {
    toggleIcon.addEventListener("click", function () {
      const type =
        inputSenha.getAttribute("type") === "password" ? "text" : "password";
      inputSenha.setAttribute("type", type);
      this.classList.toggle("bx-hide");
      this.classList.toggle("bx-show");
    });
  }
}

// ===== CÓDIGO PRINCIPAL DA PÁGINA _______________________________________________________________________________
document.addEventListener("DOMContentLoaded", async function () {
  const form = document.getElementById("form-responsavel");
  const etapas = document.querySelectorAll(".etapa-form");
  const botoesProximo = document.querySelectorAll(".btn-proximo");
  const botoesVoltar = document.querySelectorAll(".btn-voltar");
  const botoesCancelar = document.querySelectorAll(".btn-cancelar");
  const botaoSubmit = document.querySelector(".btn-enviar");
  const selectResidente = document.getElementById("residenteId");
  let etapaAtual = 0;

  // --- LÓGICA DE EDIÇÃO ---
  const urlParams = new URLSearchParams(window.location.search);
  const responsavelId = urlParams.get("id");
  const isEditMode = Boolean(responsavelId);

  let listaResidentes = await carregarResidentes();
  let responsavelParaEditar = null;

  if (isEditMode) {
    const titulo = document.querySelector(".titulo");
    if (titulo) titulo.textContent = "Editar Ficha de Responsável";
    if (botaoSubmit) botaoSubmit.textContent = "SALVAR ALTERAÇÕES";

    try {
      const resposta = await fetch(`http://localhost:3000/responsaveis/${responsavelId}`);
      if (resposta.ok) {
        responsavelParaEditar = await resposta.json();
        Object.keys(responsavelParaEditar).forEach((key) => {
          const campo = form.elements[key];
          if (campo) campo.value = responsavelParaEditar[key];
        });
      } else {
        console.error("Erro ao buscar responsável:", resposta.status);
      }
    } catch (erro) {
      console.error("Erro de conexão com o servidor:", erro);
    }
  }

  // --- Popula o campo de seleção de residentes ---
  if (selectResidente && listaResidentes.length > 0) {
    listaResidentes.forEach((residente) => {
      const option = new Option(
        `${residente.primeiro_nome} ${residente.sobrenome}`,
        residente.id
      );
      selectResidente.appendChild(option);
    });

    if (isEditMode && responsavelParaEditar) {
      selectResidente.value = responsavelParaEditar.id_crianca || "";
    }
  }

  // --- LÓGICA DE SALVAR E VALIDAR ---
  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    // Validação de campos obrigatórios
    let primeiroCampoInvalido = null;
    for (const campo of form.querySelectorAll("[required]")) {
      if (!campo.value.trim()) {
        primeiroCampoInvalido = campo;
        break;
      }
    }

    if (primeiroCampoInvalido) {
      form.classList.add("form-foi-validado");
      const etapaComErro = primeiroCampoInvalido.closest(".etapa-form");
      if (etapaComErro) {
        const indiceEtapaComErro = Array.from(etapas).indexOf(etapaComErro);
        if (indiceEtapaComErro !== -1) mostrarEtapa(indiceEtapaComErro);
      }
      primeiroCampoInvalido.focus();
      alert("Por favor, preencha todos os campos obrigatórios (*).");
      return;
    }

    // Monta objeto de envio
    const formData = new FormData(form);
    const dadosResponsavel = Object.fromEntries(formData.entries());

    try {
      let resposta;
      if (isEditMode) {
        // PUT (atualizar responsável)
        resposta = await fetch(`http://localhost:3000/responsaveis/${responsavelId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dadosResponsavel),
        });
      } else {
        // POST (novo responsável)
        resposta = await fetch("http://localhost:3000/responsaveis", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dadosResponsavel),
        });
      }

      if (resposta.ok) {
        alert(
          isEditMode
            ? "Ficha do responsável atualizada com sucesso!"
            : "Responsável cadastrado com sucesso!"
        );
        const origem = urlParams.get("origem") || "pagina-responsavel";
        window.location.href = `../../index.html?pagina=${origem}`;
      } else {
        const erro = await resposta.text();
        alert("Erro ao salvar responsável: " + erro);
      }
    } catch (erro) {
      console.error("Erro ao enviar dados:", erro);
      alert("Falha na comunicação com o servidor.");
    }
  });

  // --- LÓGICAS DE NAVEGAÇÃO ENTRE ETAPAS ---
  function mostrarEtapa(i) {
    etapas.forEach((e, idx) => e.classList.toggle("ativo", idx === i));
    etapaAtual = i;
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

  // --- INICIALIZAÇÃO ---
  configurarValidacaoDatas();
  iniciarToggleSenha("senha", "toggle-senha-responsavel");
  mostrarEtapa(etapaAtual);
});
