// URL base da API
const API_URL = "http://localhost:3000/api";

// ===== FUNÇÕES AUXILIARES DE API  _______________________________________________________________________ =====
async function buscarResidentePorId(id) {
  try {
    const res = await fetch(`${API_URL}/residentes/${id}`);
    if (!res.ok) throw new Error("Residente não encontrado");
    return await res.json();
  } catch (err) {
    console.error(err);
    alert("Erro ao carregar dados do residente: " + err.message);
    return null;
  }
}

// ===== CÓDIGO PRINCIPAL DA PÁGINA  _______________________________________________________________________ =====
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
  const containerDadosEscola = document.getElementById(
    "dados-escola-container"
  );
  let etapaAtual = 0;

  // --- DESATIVA VALIDAÇÃO NATIVA  _______________________________________________________________________---
  form.setAttribute("novalidate", true);

  // --- LÓGICA DE EDIÇÃO  _______________________________________________________________________---
  const urlParams = new URLSearchParams(window.location.search);
  const residenteId = urlParams.get("id");
  const isEditMode = Boolean(residenteId);

  if (isEditMode) {
    const titulo = document.querySelector(".titulo");
    if (titulo) titulo.textContent = "Editar Ficha do Residente";
    if (botaoSubmit) botaoSubmit.textContent = "SALVAR ALTERAÇÕES";

    // Busca os dados do backend _______________________________________________________________________
    const residenteParaEditar = await buscarResidentePorId(residenteId);

    if (residenteParaEditar) {
      Object.keys(residenteParaEditar).forEach((key) => {
        const campo = form.elements[key];
        if (campo) {
          // Aplica máscara nos campos que precisam
          if (key === "cpf" || key === "responsavel-cpf") {
            campo.value = residenteParaEditar[key];
            formatarCampo(campo, "###.###.###-##");
          } else if (
            key === "cep" ||
            key === "responsavel-cep" ||
            key === "escola-cep"
          ) {
            campo.value = residenteParaEditar[key];
            formatarCampo(campo, "#####-###");
          } else if (key === "responsavel-telefone") {
            campo.value = residenteParaEditar[key];
            formatarCampo(campo, "(##) #####-####");
          } else {
            campo.value = residenteParaEditar[key];
          }
        }
      });

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

  // --- LÓGICA DE MOSTRAR/ESCONDER DADOS DA ESCOLA  _______________________________________________________________________---
  if (selectFrequentaEscola) {
    selectFrequentaEscola.addEventListener("change", function () {
      const mostrar = this.value === "sim";
      if (containerDadosEscola) {
        containerDadosEscola.style.display = mostrar ? "block" : "none";
      }
      containerDadosEscola
        .querySelectorAll("input, select")
        .forEach((campo) => {
          const eObrigatorio = [
            "escola-nome",
            "escola-cep",
            "escola-rua",
            "escola-numero",
            "escola-bairro",
            "escola-cidade",
            "escola-uf",
          ].includes(campo.name);
          if (eObrigatorio) {
            campo.required = mostrar;
          }
        });
    });
  }

  // --- LÓGICA DO RESPONSÁVEL  _______________________________________________________________________---
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
            "endereco-responsavel-igual",
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
      const mostrarEndereco =
        selectResponsavel.value === "sim" && this.value === "nao";
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

  // --- LÓGICA DE SALVAR _______________________________________________________________________ ---
  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    let primeiroCampoInvalido = null;
    form.classList.remove("form-foi-validado");

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

    const formData = new FormData(form);
    const dadosResidente = Object.fromEntries(formData.entries());

    let url = `${API_URL}/residentes`;
    let method = "POST";

    if (isEditMode) {
      url = `${API_URL}/residentes/${residenteId}`;
      method = "PUT";
    }

    try {
      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosResidente),
      });

      if (response.ok) {
        const resData = await response.json();
        alert(resData.message || "Operação realizada com sucesso!");

        const origem = urlParams.get("origem") || "pagina-residentes";
        window.location.href = `../../index.html?pagina=${origem}`;
      } else {
        const erro = await response.json();
        alert("Erro ao salvar: " + (erro.error || "desconhecido"));
      }
    } catch (err) {
      console.error("Erro na requisição:", err);
      alert("Erro de conexão ao salvar residente.");
    }
  });

  // --- LÓGICAS DE NAVEGAÇÃO _______________________________________________________________________ ---
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

  // --- FUNÇÕES DE FORMATAÇÃO _______________________________________________________________________ ---
  function formatarCampo(campo, mascara) {
    if (!campo) return;

    let valorInicial = campo.value.replace(/\D/g, "");
    if (valorInicial) {
      let valorFormatado = "";
      for (
        let i = 0, j = 0;
        i < mascara.length && j < valorInicial.length;
        i++
      ) {
        if (mascara[i] === "#") {
          valorFormatado += valorInicial[j++];
        } else {
          valorFormatado += mascara[i];
        }
      }
      campo.value = valorFormatado;
    }

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

  formatarCampo(document.getElementById("cpf"), "###.###.###-##");
  formatarCampo(document.getElementById("responsavel-cpf"), "###.###.###-##");
  formatarCampo(document.getElementById("cep"), "#####-###");
  formatarCampo(document.getElementById("responsavel-cep"), "#####-###");
  formatarCampo(document.getElementById("escola-cep"), "#####-###");
  formatarCampo(
    document.getElementById("responsavel-telefone"),
    "(##) #####-####"
  );

  mostrarEtapa(etapaAtual);

  if (!isEditMode) {
    if (selectFrequentaEscola)
      selectFrequentaEscola.dispatchEvent(new Event("change"));
    if (selectResponsavel) selectResponsavel.dispatchEvent(new Event("change"));
  }
});
