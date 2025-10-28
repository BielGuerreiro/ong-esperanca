// =========================================================
// 🔹 FUNÇÕES DE INTEGRAÇÃO COM O BACKEND (API)
// =========================================================

// Buscar todos os residentes do backend
async function carregarResidentes() {
  try {
    const response = await fetch("http://localhost:3000/criancas");
    if (!response.ok) throw new Error("Erro ao buscar residentes");
    return await response.json();
  } catch (error) {
    console.error("Erro ao carregar residentes:", error);
    alert("Erro ao carregar lista de residentes.");
    return [];
  }
}

// Criar ou atualizar um residente
async function salvarResidente(dadosResidente, isEditMode = false, id = null) {
  try {
    const url = isEditMode
      ? `http://localhost:3000/criancas/${id}`
      : "http://localhost:3000/criancas";
    const method = isEditMode ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dadosResidente),
    });

    if (!response.ok) throw new Error("Erro ao salvar residente");
    return await response.json();
  } catch (error) {
    console.error("Erro ao salvar residente:", error);
    alert("Erro ao salvar os dados do residente.");
  }
}

// =========================================================
// 🔹 LÓGICA PRINCIPAL DA PÁGINA
// =========================================================
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

  const selectFrequentaEscola = document.getElementById("frequenta_escola");
  const containerDadosEscola = document.getElementById("dados-escola-container");

  const selectResponsavel = document.getElementById("possui_responsavel");
  const containerResponsavel = document.getElementById("dados-responsavel-container");

  const selectEnderecoIgual = document.getElementById("endereco_responsavel_igual");
  const containerEnderecoResponsavel = document.getElementById("endereco-responsavel-container");

  let etapaAtual = 0;
  form.setAttribute("novalidate", true);

  // =========================================================
  // 🔹 MODO DE EDIÇÃO
  // =========================================================
  const urlParams = new URLSearchParams(window.location.search);
  const residenteId = urlParams.get("id");
  const isEditMode = Boolean(residenteId);

  if (isEditMode) {
    const titulo = document.querySelector(".titulo");
    if (titulo) titulo.textContent = "Editar Ficha do Residente";
    if (botaoSubmit) botaoSubmit.textContent = "SALVAR ALTERAÇÕES";

    try {
      const resposta = await fetch(`http://localhost:3000/criancas/${residenteId}`);
      if (!resposta.ok) throw new Error("Erro ao buscar dados do residente");

      const residente = await resposta.json();

      // Preenche os campos automaticamente
      Object.keys(residente).forEach((key) => {
        const campo = form.elements[key];
        if (!campo) return;

        if (key.toLowerCase().includes("data")) {
          campo.value = residente[key]
            ? new Date(residente[key]).toISOString().split("T")[0]
            : "";
        } else if (campo.type === "radio") {
          const radioToSelect = document.querySelector(
            `input[name="${key}"][value="${residente[key]}"]`
          );
          if (radioToSelect) radioToSelect.checked = true;
        } else {
          campo.value = residente[key] ?? "";
        }
      });

      // Atualiza UI conforme os valores booleanos
      if (selectFrequentaEscola) selectFrequentaEscola.dispatchEvent(new Event("change"));
      if (selectResponsavel) selectResponsavel.dispatchEvent(new Event("change"));
      if (selectEnderecoIgual) selectEnderecoIgual.dispatchEvent(new Event("change"));
    } catch (erro) {
      console.error("Erro ao carregar residente para edição:", erro);
      alert("Erro ao carregar dados do residente. Tente novamente.");
    }
  }

  // =========================================================
  // 🔹 LÓGICA DE EXIBIÇÃO (MOSTRAR/ESCONDER CAMPOS)
  // =========================================================
  if (selectFrequentaEscola && containerDadosEscola) {
    selectFrequentaEscola.addEventListener("change", function () {
      containerDadosEscola.style.display = this.value === "sim" ? "block" : "none";
    });
  }

  if (selectResponsavel && containerResponsavel) {
    selectResponsavel.addEventListener("change", function () {
      const mostrar = this.value === "sim";
      containerResponsavel.style.display = mostrar ? "block" : "none";

      // Define obrigatoriedade dos campos
      containerResponsavel.querySelectorAll("input, select").forEach((campo) => {
        const obrigatorio = [
          "responsavel_primeiro_nome",
          "responsavel_sobrenome",
          "responsavel_nascimento",
          "responsavel_cpf",
          "responsavel_sexo",
          "responsavel_telefone",
          "responsavel_parentesco",
        ].includes(campo.name);
        campo.required = mostrar && obrigatorio;
      });

      if (selectEnderecoIgual)
        selectEnderecoIgual.dispatchEvent(new Event("change"));
    });
  }

  // --- LÓGICA DO ENDEREÇO DO RESPONSÁVEL ---
// --- LÓGICA DO ENDEREÇO DO RESPONSÁVEL ---
  if (selectEnderecoIgual && containerEnderecoResponsavel) {
    const atualizarCamposEndereco = () => {
      // Normaliza o valor para comparação (remove acentos e converte para minúsculas)
      const valor = selectEnderecoIgual.value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, ""); // remove acentos

      // Se valor for "nao" → mostra campos; se "sim" → esconde
      const mostrarEndereco = valor === "nao";

      // Exibe ou oculta o bloco de endereço
      containerEnderecoResponsavel.style.display = mostrarEndereco ? "block" : "none";

      // Torna os campos obrigatórios apenas se for "Não"
      containerEnderecoResponsavel.querySelectorAll("input, select").forEach((campo) => {
        campo.required = mostrarEndereco;
        if (!mostrarEndereco) campo.value = ""; // limpa se o endereço for igual
    });
  };

  // Dispara sempre que o usuário muda a opção
  selectEnderecoIgual.addEventListener("change", atualizarCamposEndereco);

  // E também ao carregar a página (modo de edição)
  atualizarCamposEndereco();
}


  // =========================================================
  // 🔹 SALVAR (ENVIAR PARA BACKEND)
  // =========================================================
  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    let primeiroCampoInvalido = null;
    for (const campo of form.querySelectorAll("[required]")) {
      if (campo.closest('[style*="display: none"]') === null) {
        if (!campo.value.trim()) {
          primeiroCampoInvalido = campo;
          break;
        }
      }
    }

    if (primeiroCampoInvalido) {
      form.classList.add("form-foi-validado");
      const etapaComErro = primeiroCampoInvalido.closest(".etapa-form");
      if (etapaComErro) {
        const indice = Array.from(etapas).indexOf(etapaComErro);
        if (indice !== -1) mostrarEtapa(indice);
      }
      primeiroCampoInvalido.focus();
      alert("Por favor, preencha todos os campos obrigatórios (*).");
      return;
    }

    // Copiar endereço principal para responsável, se for igual
    if (
      selectResponsavel &&
      selectEnderecoIgual &&
      selectResponsavel.value === "sim" &&
      selectEnderecoIgual.value === "sim"
    ) {
      document.getElementById("responsavel_cep").value = document.getElementById("cep").value;
      document.getElementById("responsavel_rua").value = document.getElementById("rua").value;
      document.getElementById("responsavel_numero").value = document.getElementById("numero").value;
      document.getElementById("responsavel_bairro").value = document.getElementById("bairro").value;
      document.getElementById("responsavel_cidade").value = document.getElementById("cidade").value;
      document.getElementById("responsavel_uf").value = document.getElementById("uf").value;
    }

    const formData = new FormData(form);
    const dadosResidente = Object.fromEntries(formData.entries());

    await salvarResidente(dadosResidente, isEditMode, residenteId);

    alert(isEditMode ? "Ficha do residente atualizada com sucesso!" : "Residente cadastrado com sucesso!");
    const origem = urlParams.get("origem") || "pagina-residentes";
    window.location.href = `../../index.html?pagina=${origem}`;
  });

  // =========================================================
  // 🔹 NAVEGAÇÃO ENTRE ETAPAS
  // =========================================================
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

  // =========================================================
  // 🔹 MÁSCARAS AUTOMÁTICAS
  // =========================================================
  function formatarCampo(campo, mascara) {
    if (!campo) return;
    campo.addEventListener("input", (e) => {
      let valor = e.target.value.replace(/\D/g, "");
      if (!valor) {
        e.target.value = "";
        return;
      }
      let valorFormatado = "";
      for (let i = 0, j = 0; i < mascara.length && j < valor.length; i++) {
        valorFormatado += mascara[i] === "#" ? valor[j++] : mascara[i];
      }
      e.target.value = valorFormatado;
    });
  }

  formatarCampo(document.getElementById("cpf"), "###.###.###-##");
  formatarCampo(document.getElementById("responsavel_cpf"), "###.###.###-##");
  formatarCampo(document.getElementById("cep"), "#####-###");
  formatarCampo(document.getElementById("responsavel_cep"), "#####-###");
  formatarCampo(document.getElementById("responsavel_telefone"), "(##) #####-####");

  // Inicialização
  mostrarEtapa(etapaAtual);
  if (selectFrequentaEscola) selectFrequentaEscola.dispatchEvent(new Event("change"));
  if (selectResponsavel) selectResponsavel.dispatchEvent(new Event("change"));
  if (selectEnderecoIgual) selectEnderecoIgual.dispatchEvent(new Event("change"));
});
