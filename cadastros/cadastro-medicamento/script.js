// URL base do backend
const API_URL = "http://localhost:3000/api";

// Função para carregar residentes do backend
async function carregarResidentesBackend() {
  try {
    const response = await fetch(`${API_URL}/residentes`);
    if (!response.ok) throw new Error("Erro ao buscar residentes");
    return await response.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}

// Código principal do formulário
document.addEventListener("DOMContentLoaded", async function () {
  const form = document.getElementById("form-medicamento");
  const selectResidente = document.getElementById("residenteId");
  const botaoSubmit = document.querySelector(".btn-enviar");
  const botaoCancelar = document.querySelector(".btn-cancelar");

  const urlParams = new URLSearchParams(window.location.search);
  const tratamentoId = urlParams.get("id");
  const isEditMode = Boolean(tratamentoId);

  // --- Carrega residentes do backend ---
  const listaResidentes = await carregarResidentesBackend();
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

  // --- Se estiver em edição, carrega os dados do backend ---
  if (isEditMode) {
    try {
      const res = await fetch(`${API_URL}/medicamentos/${tratamentoId}`);
      if (res.ok) {
        const tratamento = await res.json();
        if (tratamento) {
          // Preenche todos os campos do formulário
          Object.keys(tratamento).forEach((key) => {
            let campo = null;

            // Mapeia data_vencimento para input "validade"
            if (key === "data_vencimento") {
              campo = form.elements["validade"];
              if (campo && tratamento[key]) {
                // Ajusta formato YYYY-MM-DD
                campo.value = tratamento[key].split("T")[0];
              }
            } else if (key === "residenteId") {
              // Seleciona o residente correto
              campo = form.elements["residenteId"];
              if (campo) campo.value = tratamento[key];
            } else {
              campo = form.elements[key];
              if (campo) campo.value = tratamento[key];
            }
          });
        }
      }
    } catch (err) {
      console.error("Erro ao carregar tratamento:", err);
    }

    const titulo = document.querySelector("h2");
    if (titulo) titulo.textContent = "Editar Tratamento";
    if (botaoSubmit) botaoSubmit.textContent = "SALVAR ALTERAÇÕES";
  }

  // --- Lógica de submit ---
  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    if (!form.checkValidity()) {
      alert("Por favor, preencha todos os campos obrigatórios (*).");
      form.classList.add("form-foi-validado");
      return;
    }

    const formData = new FormData(form);
    const dadosTratamento = Object.fromEntries(formData.entries());

    try {
      let url = `${API_URL}/medicamentos`;
      let method = "POST";

      if (isEditMode) {
        url = `${API_URL}/medicamentos/${tratamentoId}`;
        method = "PUT";
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          residenteId: dadosTratamento.residenteId,
          medicamento: dadosTratamento.medicamento,
          tipo: dadosTratamento.tipo,
          horario: dadosTratamento.horario,
          dosagem: dadosTratamento.dosagem,
          frequencia: dadosTratamento.frequencia,
          duracao: dadosTratamento.duracao,
          validade: dadosTratamento.validade,
        }),
      });

      if (response.ok) {
        alert(
          isEditMode
            ? "Tratamento atualizado com sucesso!"
            : "Tratamento cadastrado com sucesso!"
        );
        const origem = urlParams.get("origem") || "pagina-medicamentos";
        window.location.href = `../../index.html?pagina=${origem}`;
      } else {
        const erro = await response.json();
        alert("Erro ao salvar: " + (erro.error || "desconhecido"));
      }
    } catch (err) {
      console.error(err);
      alert("Erro de rede ao salvar o tratamento.");
    }
  });

  // --- Botão cancelar ---
  if (botaoCancelar) {
    botaoCancelar.addEventListener("click", function () {
      if (confirm("Tem certeza que deseja cancelar?")) {
        const origem = urlParams.get("origem") || "pagina-medicamentos";
        window.location.href = `../../index.html?pagina=${origem}`;
      }
    });
  }
});
