// FUNÇÕES GLOBAIS DE APOIO ___________________________________________________________________________________________________
function carregarFuncionarios() {
  return JSON.parse(sessionStorage.getItem("listaFuncionarios") || "[]");
}
function salvarFuncionarios(lista) {
  sessionStorage.setItem("listaFuncionarios", JSON.stringify(lista));
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
  const inputAdmissao = document.getElementById("admissao");
  if (inputAdmissao) {
    inputAdmissao.max = "2100-12-31";
    inputAdmissao.min = "1900-01-01";
  }
}

function iniciarToggleSenha(inputId, toggleId) {
  const inputSenha = document.getElementById(inputId);
  const toggleIcon = document.getElementById(toggleId);

  if (inputSenha && toggleIcon) {
    toggleIcon.addEventListener("click", function () {
      const type =
        inputSenha.getAttribute("type") === "password" ? "text" : "password";
      inputSenha.setAttribute("type", type);
      this.classList.toggle("bx-eye-slash");
      this.classList.toggle("bx-eye");
    });
  }
}

//  CÓDIGO PRINCIPAL __________________________________________________________________________
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("form-funcionario");
  const etapas = document.querySelectorAll(".etapa-form");
  const botoesProximo = document.querySelectorAll(".btn-proximo");
  const botoesVoltar = document.querySelectorAll(".btn-voltar");
  const botoesCancelar = document.querySelectorAll(".btn-cancelar");
  const botaoSubmit = document.querySelector(".btn-enviar");
  let etapaAtual = 0;

  const selectResidenteMultiplo = document.getElementById("residente-select");
  const tagsContainer = document.getElementById(
    "residentes-selecionados-container"
  );
  const hiddenInputIds = document.getElementById("residentes_vinculados_ids");
  let idsSelecionados = [];
  const listaResidentes = carregarResidentes();

  form.setAttribute("novalidate", true); //LÓGICA DE EDIÇÃO E NÚMERO DE REGISTRO _________________________________________________________________________

  const urlParams = new URLSearchParams(window.location.search);
  const funcionarioId = urlParams.get("id");
  const isEditMode = Boolean(funcionarioId);
  const inputNumeroRegistro = document.getElementById("numero-registro");
  const listaFuncionarios = carregarFuncionarios(); // Carrega a lista aqui para uso no novo bloco 'else'

  if (isEditMode) {
    if (inputNumeroRegistro) {
      inputNumeroRegistro.value = funcionarioId;
      // Torna readonly no modo edição para garantir a integridade do ID
      inputNumeroRegistro.setAttribute("readonly", "readonly");
    }

    const titulo = document.querySelector(".titulo");
    if (titulo) titulo.textContent = "Editar Ficha Do Funcionário";
    if (botaoSubmit) botaoSubmit.textContent = "SALVAR ALTERAÇÕES";

    const funcionarioParaEditar = listaFuncionarios.find(
      (f) => f.id == funcionarioId
    );

    if (funcionarioParaEditar) {
      Object.keys(funcionarioParaEditar).forEach((key) => {
        const campo = form.elements[key];
        if (campo && key !== "id") {
          campo.value = funcionarioParaEditar[key];
        }
      });
      if (
        funcionarioParaEditar.residentes_vinculados_ids &&
        typeof funcionarioParaEditar.residentes_vinculados_ids === "string"
      ) {
        idsSelecionados =
          funcionarioParaEditar.residentes_vinculados_ids.split(",");
        atualizarTags();
      }
    }
  } else {
    if (inputNumeroRegistro) {
      // MODO CADASTRO: Permite a entrada manual do número de registro
      inputNumeroRegistro.removeAttribute("readonly");
      inputNumeroRegistro.placeholder = "Digite o número de registro";
    }
  } // LÓGICA DE SALVAR (COM A VALIDAÇÃO DO RESIDENTE) _____________________________________________________________________________

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    let primeiroCampoInvalido = null; // 1. Validação de campo vazio

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
        const indiceEtapaComErro = Array.from(etapas).indexOf(etapaComErro);
        if (indiceEtapaComErro !== -1) {
          mostrarEtapa(indiceEtapaComErro);
        }
      }

      primeiroCampoInvalido.focus();
      alert("Por favor, preencha todos os campos obrigatórios (*).");
      return;
    }

    // 2. Validação de Unicidade do Número de Registro (apenas para Novo Cadastro)
    if (!isEditMode && inputNumeroRegistro) {
      const novoId = parseInt(inputNumeroRegistro.value);
      if (listaFuncionarios.some((f) => parseInt(f.id) === novoId)) {
        alert(
          `O Número de Registro ${novoId} já existe. Por favor, escolha outro.`
        );
        inputNumeroRegistro.focus();
        return;
      }
    } // Continua a lógica de salvar
    // FIM das validações específicas

    const formData = new FormData(form);
    const dadosFuncionario = Object.fromEntries(formData.entries());
    dadosFuncionario.id = parseInt(dadosFuncionario.id);

    if (isEditMode) {
      const index = listaFuncionarios.findIndex((f) => f.id == funcionarioId);
      if (index !== -1) {
        listaFuncionarios[index] = dadosFuncionario;
        salvarFuncionarios(listaFuncionarios);
        alert("Cadastro de funcionário atualizado com sucesso!");
      }
    } else {
      listaFuncionarios.push(dadosFuncionario);
      salvarFuncionarios(listaFuncionarios);
      alert(
        `Funcionário cadastrado com sucesso! O número de registro é: ${dadosFuncionario.id}`
      );
    }

    setTimeout(() => {
      const origem = urlParams.get("origem") || "pagina-funcionarios";
      window.location.href = `../../index.html?pagina=${origem}`;
    }, 1000);
  });

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
        window.location.href = "../../index.html?pagina=pagina-funcionarios";
      }
    })
  );

  if (selectResidenteMultiplo) {
    listaResidentes.forEach((r) =>
      selectResidenteMultiplo.appendChild(
        new Option(`${r["primeiro-nome"]} ${r.sobrenome}`, r.id)
      )
    );
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
          idsSelecionados = idsSelecionados.filter((sid) => sid != id);
          atualizarTags();
        };
        tag.appendChild(removeIcon);
        tagsContainer.appendChild(tag);
      }
    });
    hiddenInputIds.value = idsSelecionados.join(",");
  }

  if (selectResidenteMultiplo) {
    selectResidenteMultiplo.addEventListener("change", function () {
      const id = this.value;
      if (id && !idsSelecionados.includes(id)) {
        idsSelecionados.push(id);
        atualizarTags();
      }
      this.value = "";
    });
  }

  configurarValidacaoDatas();
  iniciarToggleSenha("senha", "toggle-senha-funcionario");
  mostrarEtapa(etapaAtual);
});
