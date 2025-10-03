/*
    VERSÃO FINAL E COMPLETA DO SCRIPT DE CADASTRO DE ATIVIDADE
    - Inclui toda a lógica de botões, validação e seleção múltipla de participantes.
*/

// ===== CAMADA DE DADOS E FUNÇÕES GLOBAIS =====
function carregarAgendamentos() {
  return JSON.parse(
    sessionStorage.getItem("listaAgendamentosAtividade") || "[]"
  );
}
function salvarAgendamentos(lista) {
  sessionStorage.setItem("listaAgendamentosAtividade", JSON.stringify(lista));
}
function carregarResidentes() {
  return JSON.parse(sessionStorage.getItem("listaResidentes") || "[]");
}

// ===== CÓDIGO PRINCIPAL DA PÁGINA =====
document.addEventListener("DOMContentLoaded", function () {
  // --- Seletores de Elementos ---
  const form = document.getElementById("form-atividade");
  const botaoSubmit = document.querySelector(".btn-enviar");
  const botaoCancelar = document.querySelector(".btn-cancelar");

  // --- Lógica para Seleção Múltipla de Participantes ---
  const selectResidente = document.getElementById("residente-select");
  const tagsContainer = document.getElementById(
    "residentes-selecionados-container"
  );
  const hiddenInputIds = document.getElementById("participantes_ids");
  let idsSelecionados = [];

  const listaResidentes = carregarResidentes();
  if (selectResidente) {
    listaResidentes.forEach((residente) => {
      const option = document.createElement("option");
      option.value = residente.id;
      option.textContent = `${residente["primeiro-nome"]} ${residente.sobrenome}`;
      selectResidente.appendChild(option);
    });
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
          idsSelecionados = idsSelecionados.filter(
            (selectedId) => selectedId != id
          );
          atualizarTags();
        };
        tag.appendChild(removeIcon);
        tagsContainer.appendChild(tag);
      }
    });
    hiddenInputIds.value = idsSelecionados.join(",");
  }

  if (selectResidente) {
    selectResidente.addEventListener("change", function () {
      const id = this.value;
      if (id && !idsSelecionados.includes(id)) {
        idsSelecionados.push(id);
        atualizarTags();
      }
      this.value = "";
    });
  }

  // --- Lógica dos Botões e Envio do Formulário ---

  // Lógica do botão Cancelar
  if (botaoCancelar) {
    botaoCancelar.addEventListener("click", function () {
      if (confirm("Tem certeza que deseja cancelar?")) {
        window.location.href = "../../index.html?pagina=pagina-atividades";
      }
    });
  }

  // Lógica de Validação (roda no clique do botão de enviar)
  if (botaoSubmit) {
    botaoSubmit.addEventListener("click", function () {
      form.classList.add("form-foi-validado");
      if (!form.checkValidity()) {
        alert("Por favor, preencha todos os campos obrigatórios (*).");
      }
    });
  }

  // Lógica de Envio (só roda se o formulário for válido)
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!form.checkValidity()) return;

    const listaAgendamentos = carregarAgendamentos();
    const formData = new FormData(form);
    const novoAgendamento = Object.fromEntries(formData.entries());
    novoAgendamento.id = Date.now();
    novoAgendamento.status = "Agendada"; // Status inicial

    listaAgendamentos.push(novoAgendamento);
    salvarAgendamentos(listaAgendamentos);

    alert("Atividade agendada com sucesso!");
    window.location.href = "../../index.html?pagina=pagina-atividades";
  });
});
