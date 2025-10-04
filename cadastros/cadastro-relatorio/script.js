/*
    VERSÃO COMPLETA E FUNCIONAL DO SCRIPT DE CADASTRO DE RELATÓRIO
*/

// ===== CAMADA DE DADOS =====
function carregarRelatorios() {
  return JSON.parse(sessionStorage.getItem("listaRelatoriosDiarios") || "[]");
}
function salvarRelatorios(lista) {
  sessionStorage.setItem("listaRelatoriosDiarios", JSON.stringify(lista));
}
function carregarResidentes() {
  return JSON.parse(sessionStorage.getItem("listaResidentes") || "[]");
}
function carregarTratamentos() {
  return JSON.parse(sessionStorage.getItem("listaTratamentos") || "[]");
}
function carregarFuncionarios() {
  // Função que faltava
  return JSON.parse(sessionStorage.getItem("listaFuncionarios") || "[]");
}

// ===== CÓDIGO PRINCIPAL DA PÁGINA =====
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("form-relatorio");
  const selectResidente = document.getElementById("relatorio-residenteId");
  const selectMedicamento = document.getElementById("relatorio-medicamento");
  const selectResponsavel = document.getElementById("relatorio-responsavelId");
  const botaoSubmit = document.querySelector(".btn-enviar");
  const botaoCancelar = document.querySelector(".btn-cancelar");

  // Popula todas as listas de seleção
  if (selectResidente)
    carregarResidentes().forEach((r) =>
      selectResidente.appendChild(
        new Option(`${r["primeiro-nome"]} ${r.sobrenome}`, r.id)
      )
    );
  if (selectMedicamento)
    carregarTratamentos().forEach((t) =>
      selectMedicamento.appendChild(
        new Option(`${t.medicamento} (${t.dosagem})`, t.medicamento)
      )
    );
  if (selectResponsavel)
    carregarFuncionarios().forEach((f) =>
      selectResponsavel.appendChild(
        new Option(`${f["primeiro-nome"]} ${f.sobrenome}`, f.id)
      )
    );

  // Lógica do botão Cancelar
  if (botaoCancelar) {
    botaoCancelar.addEventListener("click", function () {
      if (confirm("Tem certeza que deseja cancelar?")) {
        const urlParams = new URLSearchParams(window.location.search);
        const origem = urlParams.get("origem");
        let redirectUrl = "../../index.html";
        if (origem) {
          redirectUrl += `?pagina=${origem}`;
        }
        window.location.href = redirectUrl;
      }
    });
  }

  // Lógica de Validação e Envio do Formulário
  if (botaoSubmit) {
    botaoSubmit.addEventListener("click", function () {
      form.classList.add("form-foi-validado");
      if (!form.checkValidity()) {
        alert("Por favor, preencha todos os campos obrigatórios (*).");
      }
    });
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!form.checkValidity()) return;

    const listaRelatorios = carregarRelatorios();
    const formData = new FormData(form);
    const novoRelatorio = Object.fromEntries(formData.entries());
    novoRelatorio.id = Date.now();

    listaRelatorios.push(novoRelatorio);
    salvarRelatorios(listaRelatorios);

    alert("Registro diário salvo com sucesso!");

    const urlParams = new URLSearchParams(window.location.search);
    const origem = urlParams.get("origem");
    let redirectUrl = "../../index.html";
    if (origem) {
      redirectUrl += `?pagina=${origem}`;
    }
    window.location.href = redirectUrl;
  });
});
