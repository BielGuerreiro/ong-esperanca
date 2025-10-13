// Funções de dados para carregar e salvar a lista de residentes
function carregarResidentes() {
  return JSON.parse(sessionStorage.getItem("listaResidentes") || "[]");
}
function salvarResidentes(lista) {
  sessionStorage.setItem("listaResidentes", JSON.stringify(lista));
}

// ===== CÓDIGO PRINCIPAL DA PÁGINA =====
document.addEventListener("DOMContentLoaded", function () {
  // --- SELEÇÃO DOS ELEMENTOS ---
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
  const containerDadosEscola = document.getElementById(
    "dados-escola-container"
  );
  let etapaAtual = 0;

  // --- DESATIVA VALIDAÇÃO NATIVA ---
  form.setAttribute("novalidate", true);

  // --- LÓGICA DE EDIÇÃO ---
  const urlParams = new URLSearchParams(window.location.search);
  const residenteId = urlParams.get("id");
  const isEditMode = Boolean(residenteId);

  if (isEditMode) {
    const titulo = document.querySelector(".titulo");
    if (titulo) titulo.textContent = "Editar Ficha do Residente";
    if (botaoSubmit) botaoSubmit.textContent = "SALVAR ALTERAÇÕES";

    const listaResidentes = carregarResidentes();
    const residenteParaEditar = listaResidentes.find(
      (r) => r.id == residenteId
    );
    if (residenteParaEditar) {
      Object.keys(residenteParaEditar).forEach((key) => {
        const campo = form.elements[key];
        if (campo) {
          if (campo.type === "radio") {
            const radioToSelect = document.querySelector(
              `input[name="${key}"][value="${residenteParaEditar[key]}"]`
            );
            if (radioToSelect) radioToSelect.checked = true;
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

  // --- LÓGICA DE MOSTRAR/ESCONDER DADOS DA ESCOLA ---
  if (selectFrequentaEscola) {
    selectFrequentaEscola.addEventListener("change", function () {
      if (containerDadosEscola) {
        containerDadosEscola.style.display =
          this.value === "sim" ? "block" : "none";
      }
    });
  }

  // --- LÓGICA DE SALVAR (COM VALIDAÇÃO GLOBAL IGUAL À DO RESPONSÁVEL) ---
  form.addEventListener("submit", function (event) {
    event.preventDefault();

    let primeiroCampoInvalido = null;

    // Validação manual global (verifica todos os campos obrigatórios)
    for (const campo of form.querySelectorAll("[required]")) {
      if (!campo.value.trim()) {
        primeiroCampoInvalido = campo;
        break; // Para no primeiro erro
      }
    }

    if (primeiroCampoInvalido) {
      form.classList.add("form-foi-validado");

      const etapaComErro = primeiroCampoInvalido.closest(".etapa-form");
      if (etapaComErro) {
        const indiceEtapaComErro = Array.from(etapas).indexOf(etapaComErro);
        if (indiceEtapaComErro !== -1) {
          mostrarEtapa(indiceEtapaComErro);
        }
      }

      primeiroCampoInvalido.focus();
      alert("Por favor, preencha todos os campos obrigatórios (*).");
      return;
    }

    // --- SE PASSAR NA VALIDAÇÃO ---
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
        alert("Ficha do residente atualizada com sucesso!");
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

  // --- LÓGICAS DE NAVEGAÇÃO ---
  function mostrarEtapa(i) {
    etapas.forEach((e, idx) => e.classList.toggle("ativo", idx === i));
    etapaAtual = i;
  }

  botoesProximo.forEach((b) => {
    b.addEventListener("click", () => {
      if (etapaAtual < etapas.length - 1) {
        etapaAtual++;
        mostrarEtapa(etapaAtual);
      }
    });
  });

  botoesVoltar.forEach((b) => {
    b.addEventListener("click", () => {
      if (etapaAtual > 0) {
        etapaAtual--;
        mostrarEtapa(etapaAtual);
      }
    });
  });

  botoesCancelar.forEach((b) => {
    b.addEventListener("click", () => {
      if (confirm("Deseja cancelar?")) {
        window.location.href = "../../index.html?pagina=pagina-residentes";
      }
    });
  });

  // --- INICIALIZAÇÃO DA PÁGINA ---
  mostrarEtapa(etapaAtual);
});
