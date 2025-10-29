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
          campo.value = residenteParaEditar[key];
        }
      });

      // Dispara os eventos de change para exibir os campos corretos no modo de edição
      if (selectFrequentaEscola)
        selectFrequentaEscola.dispatchEvent(new Event("change"));
      const selectResponsavel = document.getElementById("possui-responsavel");
      if (selectResponsavel)
        selectResponsavel.dispatchEvent(new Event("change"));
      const selectEnderecoIgual = document.getElementById(
        "endereco-responsavel-igual"
      );
      if (selectEnderecoIgual)
        selectEnderecoIgual.dispatchEvent(new Event("change"));
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

  // --- LÓGICA DO RESPONSÁVEL ---
  const selectResponsavel = document.getElementById("possui-responsavel");
  const containerResponsavel = document.getElementById(
    "dados-responsavel-container"
  );
  if (selectResponsavel && containerResponsavel) {
    selectResponsavel.addEventListener("change", function () {
      const mostrar = this.value === "sim";
      containerResponsavel.style.display = mostrar ? "block" : "none";
      containerResponsavel
        .querySelectorAll("input, select")
        .forEach((campo) => {
          const eObrigatorio = [
            "responsavel-primeiro-nome",
            "responsavel-sobrenome",
            "responsavel-nascimento",
            "responsavel-sexo",
            "responsavel-cpf",
            "responsavel-telefone",
            "responsavel-parentesco",
          ].includes(campo.name);
          if (eObrigatorio) {
            campo.required = mostrar;
          }
        });
      if (document.getElementById("endereco-responsavel-igual")) {
        document
          .getElementById("endereco-responsavel-igual")
          .dispatchEvent(new Event("change"));
      }
    });
  }

  const selectEnderecoIgual = document.getElementById(
    "endereco-responsavel-igual"
  );
  const containerEnderecoResponsavel = document.getElementById(
    "endereco-responsavel-container"
  );
  if (selectEnderecoIgual && containerEnderecoResponsavel) {
    selectEnderecoIgual.addEventListener("change", function () {
      const mostrarEndereco = this.value === "nao";
      containerEnderecoResponsavel.style.display = mostrarEndereco
        ? "block"
        : "none";
      containerEnderecoResponsavel
        .querySelectorAll("input, select")
        .forEach((campo) => {
          campo.required = mostrarEndereco;
        });
    });
  }

  // ======================================================================
  // --- LÓGICA DE SALVAR (A SUA LÓGICA ORIGINAL RESTAURADA E ADAPTADA) ---
  // ======================================================================
  form.addEventListener("submit", function (event) {
    event.preventDefault();

    let primeiroCampoInvalido = null;

    // Validação manual global (verifica todos os campos obrigatórios que NÃO estão escondidos)
    for (const campo of form.querySelectorAll("[required]")) {
      // A ÚNICA MUDANÇA: só valida o campo se ele não estiver dentro de um container com "display: none"
      if (campo.closest('[style*="display: none"]') === null) {
        if (!campo.value.trim()) {
          primeiroCampoInvalido = campo;
          break; // Para no primeiro erro
        }
      }
    }

    if (primeiroCampoInvalido) {
      // Esta é a sua lógica original, que está correta:
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
      return; // Impede o envio do formulário
    }

    // --- SE PASSAR NA VALIDAÇÃO ---
    // Copia o endereço se necessário
    if (
      selectResponsavel.value === "sim" &&
      selectEnderecoIgual.value === "sim"
    ) {
      document.getElementById("responsavel-cep").value =
        document.getElementById("cep").value;
      document.getElementById("responsavel-rua").value =
        document.getElementById("rua").value;
      document.getElementById("responsavel-numero").value =
        document.getElementById("numero").value;
      document.getElementById("responsavel-bairro").value =
        document.getElementById("bairro").value;
      document.getElementById("responsavel-cidade").value =
        document.getElementById("cidade").value;
      document.getElementById("responsavel-uf").value =
        document.getElementById("uf").value;
    }

    const listaResidentes = carregarResidentes();
    const formData = new FormData(form);
    const dadosResidente = Object.fromEntries(formData.entries());

    if (isEditMode) {
      const index = listaResidentes.findIndex((r) => r.id == residenteId);
      if (index !== -1) {
        listaResidentes[index] = {
          ...listaResidentes[index],
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

  // --- FUNÇÕES DE FORMATAÇÃO AUTOMÁTICA DE CAMPOS ---
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
        if (mascara[i] === "#") {
          valorFormatado += valor[j++];
        } else {
          valorFormatado += mascara[i];
        }
      }
      e.target.value = valorFormatado;
    });
  }

  // Aplicando as máscaras aos campos
  formatarCampo(document.getElementById("cpf"), "###.###.###-##");
  formatarCampo(document.getElementById("responsavel-cpf"), "###.###.###-##");
  formatarCampo(document.getElementById("cep"), "#####-###");
  formatarCampo(document.getElementById("responsavel-cep"), "#####-###");
  formatarCampo(
    document.getElementById("responsavel-telefone"),
    "(##) #####-####"
  );

  // --- INICIALIZAÇÃO DA PÁGINA ---
  mostrarEtapa(etapaAtual);
  // Garante que o estado visual dos formulários esteja correto ao carregar
  if (selectFrequentaEscola)
    selectFrequentaEscola.dispatchEvent(new Event("change"));
  if (selectResponsavel) selectResponsavel.dispatchEvent(new Event("change"));
});
