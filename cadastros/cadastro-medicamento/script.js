/*
    VERSÃO COMPLETA E FUNCIONAL DO SCRIPT DE CADASTRO DE MEDICAMENTO
    - Inclui a lógica completa dos botões e validação.
*/

// Funções de dados
function carregarTratamentos() {
  return JSON.parse(sessionStorage.getItem("listaTratamentos") || "[]");
}
function salvarTratamentos(lista) {
  sessionStorage.setItem("listaTratamentos", JSON.stringify(lista));
}
function carregarResidentes() {
  return JSON.parse(sessionStorage.getItem("listaResidentes") || "[]");
}

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("form-medicamento");
  const selectResidente = document.getElementById("residenteId");
  const botaoSubmit = document.querySelector(".btn-enviar");
  const botaoCancelar = document.querySelector(".btn-cancelar");

  // Popula a seleção de RESIDENTES
  const listaResidentes = carregarResidentes();
  if (selectResidente) {
    listaResidentes.forEach((residente) => {
      const option = document.createElement("option");
      option.value = residente.id;
      option.textContent = `${residente["primeiro-nome"]} ${residente.sobrenome}`;
      selectResidente.appendChild(option);
    });
  }

  // --- LÓGICA DOS BOTÕES E VALIDAÇÃO ---

  // Lógica do botão Cancelar
  if (botaoCancelar) {
    botaoCancelar.addEventListener("click", function () {
      if (confirm("Tem certeza que deseja cancelar?")) {
        const urlParams = new URLSearchParams(window.location.search);
        const origem = urlParams.get("origem");
        let redirectUrl = "../../index.html"; // Caminho relativo para a raiz
        if (origem) {
          redirectUrl += `?pagina=${origem}`;
        }
        window.location.href = redirectUrl;
      }
    });
  }

  // Lógica de Validação (roda no clique)
  if (botaoSubmit) {
    botaoSubmit.addEventListener("click", function () {
      form.classList.add("form-foi-validado");
      if (!form.checkValidity()) {
        alert("Por favor, preencha todos os campos obrigatórios (*).");
      }
    });
  }

  // Lógica de Envio do formulário (só roda se for válido)
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!form.checkValidity()) return;

    const listaTratamentos = carregarTratamentos();
    const formData = new FormData(form);
    const novoTratamento = Object.fromEntries(formData.entries());
    novoTratamento.id = Date.now();
    novoTratamento.status = "Pendente";

    listaTratamentos.push(novoTratamento);
    salvarTratamentos(listaTratamentos);

    alert("Tratamento cadastrado com sucesso!");

    // Redireciona de volta para a página de medicamentos
    const urlParams = new URLSearchParams(window.location.search);
    const origem = urlParams.get("origem");
    let redirectUrl = "../../index.html";
    if (origem) {
      redirectUrl += `?pagina=${origem}`;
    }
    window.location.href = redirectUrl;
  });
});
