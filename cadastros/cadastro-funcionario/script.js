document.addEventListener("DOMContentLoaded", function () {
  const API_URL = "http://localhost:3000/api";

  const form = document.getElementById("form-funcionario");
  if (!form) return;

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
  let listaResidentes = [];

  const urlParams = new URLSearchParams(window.location.search);
  const funcionarioId = urlParams.get("id");
  const isEditMode = Boolean(funcionarioId);
  const inputSenha = document.getElementById("senha");

  form.setAttribute("novalidate", true);

  async function carregarDadosIniciais() {
    try {
      const res = await fetch(`${API_URL}/residentes`);
      if (res.ok) {
        listaResidentes = await res.json();
        popularDropdownResidentes();
      } else {
        console.warn(
          "Não foi possível carregar residentes. O dropdown ficará vazio."
        );
      }
    } catch (error) {
      console.error("Erro ao carregar residentes:", error);
    }

    if (isEditMode) {
      const titulo = document.querySelector(".titulo");
      if (titulo) titulo.textContent = "Editar Ficha Do Funcionário";
      if (botaoSubmit) botaoSubmit.textContent = "SALVAR ALTERAÇÕES";

      try {
        const funcRes = await fetch(`${API_URL}/funcionarios/${funcionarioId}`);
        if (!funcRes.ok) {
          const err = await funcRes.json();
          throw new Error(
            err.error || `Erro ${funcRes.status} ao buscar funcionário.`
          );
        }

        const funcionarioParaEditar = await funcRes.json();

        if (funcionarioParaEditar) {
          // Etapa 1: Dados Pessoais ______________________________________________________________________________________________
          form.elements["primeiro-nome"].value =
            funcionarioParaEditar.primeiro_nome || "";
          form.elements["sobrenome"].value =
            funcionarioParaEditar.sobrenome || "";
          form.elements["cpf"].value = funcionarioParaEditar.cpf || "";
          if (funcionarioParaEditar.data_nascimento) {
            form.elements["nascimento"].value =
              funcionarioParaEditar.data_nascimento.split("T")[0];
          }
          form.elements["sexo"].value = funcionarioParaEditar.sexo || "";
          form.elements["telefone"].value =
            funcionarioParaEditar.telefone || "";
          form.elements["email"].value = funcionarioParaEditar.email || "";

          // Etapa 2: Endereço ______________________________________________________________________________________________________
          form.elements["cep"].value = funcionarioParaEditar.cep || "";
          form.elements["rua"].value = funcionarioParaEditar.rua || "";
          form.elements["numero"].value = funcionarioParaEditar.numero || "";
          form.elements["bairro"].value = funcionarioParaEditar.bairro || "";
          form.elements["cidade"].value = funcionarioParaEditar.cidade || "";
          form.elements["uf"].value = funcionarioParaEditar.uf || "";

          // Etapa 3: Dados Profissionais _______________________________________________________________________________________________
          form.elements["numero_registro"].value =
            funcionarioParaEditar.numero_registro || "";
          form.elements["cargo"].value = funcionarioParaEditar.cargo || "";
          if (funcionarioParaEditar.data_admissao) {
            form.elements["admissao"].value =
              funcionarioParaEditar.data_admissao.split("T")[0];
          }
          form.elements["nivel-acesso"].value =
            funcionarioParaEditar.nivel_acesso || "";
          form.elements["turno"].value = funcionarioParaEditar.turno || "";
          form.elements["status"].value = funcionarioParaEditar.status || "";
          form.elements["descricao"].value =
            funcionarioParaEditar.descricao || "";

          // BLOQUEIA OS CAMPOS _______________________________________________________________________________________________________
          form.elements["numero_registro"].readOnly = true;
          form.elements["cpf"].readOnly = true;
          form.elements["nascimento"].readOnly = true;
          form.elements["admissao"].readOnly = true;
          form.elements["senha"].readOnly = true;

          form.elements["numero_registro"].classList.add("campo-travado");
          form.elements["cpf"].classList.add("campo-travado");
          form.elements["nascimento"].classList.add("campo-travado");
          form.elements["admissao"].classList.add("campo-travado");
          form.elements["senha"].classList.add("campo-travado");

          form.elements["senha"].placeholder = "Não pode ser alterado aqui";
          form.elements["senha"].removeAttribute("required");

          // Lógica das tags de residentes _____________________________________________________________________________________________
          if (
            funcionarioParaEditar.residentes_vinculados_ids &&
            typeof funcionarioParaEditar.residentes_vinculados_ids === "string"
          ) {
            idsSelecionados = funcionarioParaEditar.residentes_vinculados_ids
              .split(",")
              .filter(Boolean);
            atualizarTags();
          }
        }
      } catch (error) {
        console.error(error);
        alert("Erro ao carregar dados do funcionário: " + error.message);
        window.location.href = `../../index.html?pagina=pagina-funcionarios`;
      }
    }
  }

  // --- LÓGICA DE SALVAR (SUBMIT) ---
  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    form.classList.remove("form-foi-validado");

    let primeiroCampoInvalido = null;

    for (const campo of form.querySelectorAll("[required]")) {
      if (
        campo.closest('[style*="display: none"]') === null &&
        !campo.readOnly
      ) {
        if (campo.tagName === "SELECT" && campo.value === "") {
          primeiroCampoInvalido = campo;
          break;
        }

        if (campo.tagName === "INPUT" && !campo.value.trim()) {
          primeiroCampoInvalido = campo;
          break;
        }

        if (campo.tagName === "INPUT" && !campo.checkValidity()) {
          primeiroCampoInvalido = campo;
          break;
        }
      }
    }

    if (primeiroCampoInvalido) {
      // ADICIONA A CLASSE PARA AS BORDAS VERMELHAS _+_____________________________________________________________________________________
      form.classList.add("form-foi-validado");

      const etapaComErro = primeiroCampoInvalido.closest(".etapa-form");
      if (etapaComErro) {
        const indiceEtapaComErro = Array.from(etapas).indexOf(etapaComErro);

        if (indiceEtapaComErro !== -1 && indiceEtapaComErro !== etapaAtual) {
          mostrarEtapa(indiceEtapaComErro);
        }
      }

      primeiroCampoInvalido.focus();
      alert("Por favor, preencha todos os campos obrigatórios (*).");
      return;
    }

    const formData = new FormData(form);
    const dadosFuncionario = Object.fromEntries(formData.entries());
    let metodo = "POST";
    let url = `${API_URL}/funcionarios`;

    if (isEditMode) {
      metodo = "PUT";
      url = `${API_URL}/funcionarios/${funcionarioId}`;

      if (dadosFuncionario.senha === "") {
        delete dadosFuncionario.senha;
      }
    }

    try {
      const response = await fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosFuncionario),
      });

      const resData = await response.json();
      if (response.ok) {
        const mensagem = isEditMode
          ? "Funcionário atualizado com sucesso!"
          : `Funcionário cadastrado com sucesso!`;

        alert(mensagem);

        setTimeout(() => {
          const origem = urlParams.get("origem") || "pagina-funcionarios";
          window.location.href = `../../index.html?pagina=${origem}`;
        }, 500);
      } else {
        alert("Erro ao salvar: " + (resData.error || "Erro desconhecido."));
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
      alert("Erro de conexão. Não foi possível salvar o funcionário.");
    }
  });

  //  LÓGICA DE NAVEGAÇÃO _________________________________________________________________________________________________________
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
        const origem = urlParams.get("origem") || "pagina-funcionarios";
        window.location.href = `../../index.html?pagina=${origem}`;
      }
    })
  );

  function popularDropdownResidentes() {
    if (!selectResidenteMultiplo) return;
    selectResidenteMultiplo.innerHTML =
      '<option value="" disabled selected>Adicionar um residente...</option>';
    listaResidentes.forEach((r) =>
      selectResidenteMultiplo.appendChild(
        new Option(`${r.primeiro_nome} ${r.sobrenome}`, r.id_residente)
      )
    );
  }

  function atualizarTags() {
    if (!tagsContainer || !hiddenInputIds) return;
    tagsContainer.innerHTML = "";
    idsSelecionados.forEach((id) => {
      const residente = listaResidentes.find((r) => r.id_residente == id);
      if (residente) {
        const tag = document.createElement("span");
        tag.className = "tag";
        tag.textContent = `${residente.primeiro_nome} ${residente.sobrenome}`;
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

  //  FUNÇÕES DE APOIO _____________________________________________________________________________________________________
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
        if (!inputSenha.readOnly) {
          const type =
            inputSenha.getAttribute("type") === "password"
              ? "text"
              : "password";
          inputSenha.setAttribute("type", type);
          this.classList.toggle("bx-eye-slash");
          this.classList.toggle("bx-eye");
        }
      });
    }
  }

  // --- INICIALIZAÇÃO ---
  configurarValidacaoDatas();
  iniciarToggleSenha("senha", "toggle-senha-funcionario");
  mostrarEtapa(etapaAtual);
  carregarDadosIniciais();
});
