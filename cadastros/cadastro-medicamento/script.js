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

  // Lógica de envio do formulário
  form.addEventListener("submit", function (event) {
    event.preventDefault();

    // ... (cole aqui a lógica de validação com checkValidity() e o alerta de erro)

    const listaTratamentos = carregarTratamentos();
    const formData = new FormData(form);
    const novoTratamento = Object.fromEntries(formData.entries());
    novoTratamento.id = Date.now();
    novoTratamento.status = "Pendente";

    listaTratamentos.push(novoTratamento);
    salvarTratamentos(listaTratamentos);

    alert("Tratamento cadastrado com sucesso!");
    window.location.href = "/index.html?pagina=pagina-medicamentos";
  });

  // ... (cole aqui a lógica dos botões cancelar e validação, dos outros formulários)
});
