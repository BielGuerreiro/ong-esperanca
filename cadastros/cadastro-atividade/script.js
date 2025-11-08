// URL base do backend
const API_URL = "http://localhost:3000/api";

// ===== FUNÇÕES AUXILIARES =====
async function carregarResidentes() {
  try {
    const res = await fetch(`${API_URL}/residentes`);
    if (!res.ok) throw new Error("Erro ao buscar residentes");
    return await res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}

async function buscarAtividadePorId(id) {
  try {
    const res = await fetch(`${API_URL}/atividades/${id}`);
    if (!res.ok) throw new Error("Atividade não encontrada");
    return await res.json();
  } catch (err) {
    console.error(err);
    return null;
  }
}

// ===== CÓDIGO PRINCIPAL =====
document.addEventListener("DOMContentLoaded", async function () {
  const form = document.getElementById("form-atividade");
  if (!form) return;

  const botaoSubmit = document.querySelector(".btn-enviar");
  const botaoCancelar = document.querySelector(".btn-cancelar");
  const selectResidente = document.getElementById("residente-select");
  const tagsContainer = document.getElementById(
    "residentes-selecionados-container"
  );
  const hiddenInputIds = document.getElementById("participantes_ids");
  const containerStatus = document.getElementById("container-status");
  const selectStatus = document.getElementById("status");

  // --- Lógica do Responsável Automático ---
  const inputResponsavel = document.getElementById("responsavel-atividade");
  const usuarioJSON = localStorage.getItem("usuarioLogado");

  if (usuarioJSON && inputResponsavel) {
    const usuarioLogado = JSON.parse(usuarioJSON);
    const nomeCompleto = `${usuarioLogado.nome} ${usuarioLogado.sobrenome}`;
    inputResponsavel.value = nomeCompleto;
    inputResponsavel.readOnly = true;
  }

  let idsSelecionados = [];

  // --- Carrega residentes ---
  const listaResidentes = await carregarResidentes();
  if (selectResidente) {
    selectResidente.innerHTML =
      '<option value="" disabled selected>Selecione um residente</option>';
    listaResidentes.forEach((residente) => {
      const option = new Option(
        `${residente.primeiro_nome} ${residente.sobrenome}`,
        residente.id_residente
      );
      selectResidente.appendChild(option);
    });
  }

  // --- Lógica de edição ---
  const urlParams = new URLSearchParams(window.location.search);
  const atividadeId = urlParams.get("id");
  const isEditMode = Boolean(atividadeId);

  if (isEditMode) {
    if (containerStatus) {
      containerStatus.style.display = "block";
    }

    const titulo = document.querySelector(".titulo");
    if (titulo) titulo.textContent = "Editar Atividade";
    if (botaoSubmit) botaoSubmit.textContent = "SALVAR ALTERAÇÕES";

    const atividade = await buscarAtividadePorId(atividadeId);
    if (atividade) {
      form.elements["nome-atividade"].value = atividade.nome_atividade || "";
      form.elements["categoria-atividade"].value = atividade.categoria || "";
      form.elements["local"].value = atividade.local || "";
      form.elements["data"].value = atividade.data
        ? atividade.data.split("T")[0]
        : "";
      form.elements["horario"].value = atividade.horario.substring(0, 5) || "";
      form.elements["duracao"].value = atividade.duracao || "";

      if (!inputResponsavel.readOnly) {
        form.elements["responsavel-atividade"].value =
          atividade.responsavel || "";
      }

      let statusFinal = atividade.status;

      if (statusFinal !== "concluida" && statusFinal !== "cancelada") {
        statusFinal = "Agendada";
      }

      if (statusFinal === "Agendada") {
        const dataForm = form.elements["data"].value;
        const horaForm = form.elements["horario"].value;

        if (dataForm && horaForm) {
          const dataAtividade = new Date(`${dataForm}T${horaForm}`);
          const agora = new Date();

          if (dataAtividade < agora) {
            statusFinal = "concluida";
          }
        }
      }

      selectStatus.value = statusFinal;

      if (atividade.participantes_ids) {
        idsSelecionados = atividade.participantes_ids
          .split(",")
          .filter(Boolean);
        atualizarTags();
      }
    }
  } else {
  }

  function atualizarTags() {
    if (!tagsContainer || !hiddenInputIds) return;
    tagsContainer.innerHTML = "";
    idsSelecionados.forEach((id) => {
      const residente = listaResidentes.find(
        (r) => String(r.id_residente) === String(id)
      );
      if (residente) {
        const tag = document.createElement("span");
        tag.className = "tag";
        tag.textContent = `${residente.primeiro_nome} ${residente.sobrenome}`;

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

  // --- Botão cancelar ---
  if (botaoCancelar) {
    botaoCancelar.addEventListener("click", function () {
      if (confirm("Tem certeza que deseja cancelar?")) {
        window.location.href = "../../index.html?pagina=pagina-atividades";
      }
    });
  }

  // --- Lógica de envio ---
  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    form.classList.remove("form-foi-validado");
    let primeiroCampoInvalido = null;
    for (const campo of form.querySelectorAll("[required]")) {
      if (campo.closest('[style*="display: none"]') === null) {
        if (
          !campo.checkValidity() ||
          (campo.value.trim() === "" && campo.tagName !== "SELECT") ||
          (campo.tagName === "SELECT" && campo.value === "")
        ) {
          primeiroCampoInvalido = campo;
          break;
        }
      }
    }

    if (primeiroCampoInvalido) {
      form.classList.add("form-foi-validado");
      primeiroCampoInvalido.focus();
      alert("Por favor, preencha todos os campos obrigatórios (*).");
      return;
    }

    const formData = new FormData(form);

    const dadosAtividade = {
      nome: formData.get("nome-atividade"),
      categoria: formData.get("categoria-atividade"),
      local: formData.get("local"),
      data: formData.get("data"),
      horario: formData.get("horario"),
      duracao: formData.get("duracao"),
      responsavel: formData.get("responsavel-atividade"),
      participantes_ids: idsSelecionados.join(","),
      status: formData.get("status"),
    };

    try {
      let url = `${API_URL}/atividades`;
      let method = "POST";

      if (isEditMode) {
        url = `${API_URL}/atividades/${atividadeId}`;
        method = "PUT";
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosAtividade),
      });

      if (res.ok) {
        alert(
          isEditMode
            ? "Atividade atualizada com sucesso!"
            : "Atividade cadastrada com sucesso!"
        );
        const origem = urlParams.get("origem") || "pagina-atividades";
        window.location.href = `../../index.html?pagina=${origem}`;
      } else {
        const erro = await res.json();
        alert("Erro ao salvar atividade: " + (erro.error || "desconhecido"));
      }
    } catch (err) {
      console.error(err);
      alert("Erro de rede ao salvar atividade.");
    }
  });
});
