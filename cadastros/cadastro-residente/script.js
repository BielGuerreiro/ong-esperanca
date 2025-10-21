
// FUNÇÕES DE INTEGRAÇÃO COM O BACKEND (API)


// 🔹 Buscar todos os residentes do backend
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

// 🔹 Criar ou atualizar um residente
async function salvarResidente(dadosResidente, isEditMode = false, id = null) {
  try {
    const url = isEditMode
      ? `http://localhost:3000/criancas/${id}` // PUT para editar
      : "http://localhost:3000/criancas"; // POST para criar

    const method = isEditMode ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dadosResidente),
    });

    if (!response.ok) {
      throw new Error("Erro ao salvar residente");
    }

    return await response.json();
  } catch (error) {
    console.error("Erro ao salvar residente:", error);
    alert("Erro ao salvar os dados do residente.");
  }
}


// LÓGICA PRINCIPAL DA PÁGINA

document.addEventListener("DOMContentLoaded", async function () {
  const form = document.getElementById("form-residente");
  if (!form) {
    console.error("ERRO: O formulário 'form-residente' não foi encontrado!");
    return;
  }

  const etapas = document.querySelectorAll(".etapa-form");
  const botoesProximo = document.querySelectorAll(".btn-proximo");
  const botoesVoltar = document.querySelectorAll(".btn-voltar");
  const botoesCancelar = document.querySelectorAll(".btn-cancelar");
  const botaoSubmit = document.querySelector(".btn-enviar");
  const selectFrequentaEscola = document.getElementById("frequenta-escola");
  const containerDadosEscola = document.getElementById("dados-escola-container");
  let etapaAtual = 0;

  form.setAttribute("novalidate", true);

  // --- LÓGICA DE EDIÇÃO ---
  const urlParams = new URLSearchParams(window.location.search);
  const residenteId = urlParams.get("id");
  const isEditMode = Boolean(residenteId);

  if (isEditMode) {
    const titulo = document.querySelector(".titulo");
    const botaoSubmitLocal = document.querySelector("#botao-submit");

    if (titulo) titulo.textContent = "Editar Ficha do Residente";
    if (botaoSubmitLocal) botaoSubmitLocal.textContent = "SALVAR ALTERAÇÕES";

    try {
      const resposta = await fetch(`http://localhost:3000/criancas/${residenteId}`);
      if (!resposta.ok) throw new Error("Erro ao buscar dados da criança");

      const residente = await resposta.json();

      // Preenche os campos do form conforme chave -> name do campo
      Object.keys(residente).forEach((key) => {
        const campo = form.elements[key];
        if (!campo) return;
        // radio handling
        if (campo.type === "radio" || (campo.length && campo[0].type === "radio")) {
          const radioToSelect = document.querySelector(`input[name="${key}"][value="${residente[key]}"]`);
          if (radioToSelect) radioToSelect.checked = true;
        } else {
          campo.value = residente[key] ?? "";
        }
      });

      // Dispare eventos que atualizam UI, ex.: select de escola
      const selectFrequentaEscolaField = form.elements["frequenta_escola"];
      if (selectFrequentaEscolaField) {
        selectFrequentaEscolaField.dispatchEvent(new Event("change"));
      }
    } catch (erro) {
      console.error("Erro ao carregar residente para edição:", erro);
      alert("Erro ao carregar dados do residente. Tente novamente.");
    }
  }

  // --- MOSTRAR/ESCONDER DADOS ESCOLA ---
  if (selectFrequentaEscola) {
    selectFrequentaEscola.addEventListener("change", function () {
      if (!containerDadosEscola) return;
      containerDadosEscola.style.display = this.value === "sim" ? "block" : "none";
    });
    // aciona ao carregar para ajustar UI (se estiver em modo edição)
    selectFrequentaEscola.dispatchEvent(new Event("change"));
  }

  // --- SALVAR (ENVIO AO BACKEND) ---
  form.addEventListener("submit", async function (event) {
    event.preventDefault();

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

    const formData = new FormData(form);
    const dadosResidente = Object.fromEntries(formData.entries());

    await salvarResidente(dadosResidente, isEditMode, residenteId);

    alert(isEditMode ? "Ficha do residente atualizada com sucesso!" : "Residente cadastrado com sucesso!");

    const origem = urlParams.get("origem") || "pagina-residentes";
    window.location.href = `../../index.html?pagina=${origem}`;
  });

  // --- NAVEGAÇÃO ENTRE ETAPAS ---
  function mostrarEtapa(i) {
    etapas.forEach((e, idx) => e.classList.toggle("ativo", idx === i));
    etapaAtual = i;
  }

  botoesProximo.forEach((b) =>
    b.addEventListener("click", () => {
      if (etapaAtual < etapas.length - 1) mostrarEtapa(etapaAtual + 1);
    })
  );

  botoesVoltar.forEach((b) =>
    b.addEventListener("click", () => {
      if (etapaAtual > 0) mostrarEtapa(etapaAtual - 1);
    })
  );

  botoesCancelar.forEach((b) =>
    b.addEventListener("click", () => {
      if (confirm("Deseja cancelar?")) {
        window.location.href = "../../index.html?pagina=pagina-residentes";
      }
    })
  );

  mostrarEtapa(etapaAtual);
});
