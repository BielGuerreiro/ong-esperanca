document.addEventListener("DOMContentLoaded", function () {
  const API_URL = "http://localhost:3000/api";
  const form = document.getElementById("form-add-estoque");
  const tabelaBody = document.getElementById("lista-estoque-body");
  const ctx = document.getElementById("grafico-estoque")?.getContext("2d");
  let graficoEstoque = null;

  async function carregarEstoqueDoBackend() {
    try {
      const res = await fetch(`${API_URL}/estoque`);
      if (!res.ok) throw new Error("Erro ao buscar estoque");
      return await res.json();
    } catch (err) {
      console.error(err);
      tabelaBody.innerHTML = `<tr><td colspan="2" style="text-align:center;">Erro ao carregar estoque.</td></tr>`;
      return [];
    }
  }

  async function renderizarTudo() {
    const estoque = await carregarEstoqueDoBackend();

    tabelaBody.innerHTML = "";
    if (estoque.length === 0) {
      tabelaBody.innerHTML = `<tr><td colspan="2" style="text-align:center;">Estoque vazio.</td></tr>`;
    } else {
      estoque.sort((a, b) => a.nome.localeCompare(b.nome));
      estoque.forEach((item) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${item.nome}</td>
          <td>${item.quantidade}</td>
        `;
        tabelaBody.appendChild(tr);
      });
    }

    // Renderiza o gráfico ______________________________________________________________________
    if (ctx) {
      if (graficoEstoque) {
        graficoEstoque.destroy();
      }
      const labels = estoque.map((item) => item.nome);
      const data = estoque.map((item) => item.quantidade);
      graficoEstoque = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Quantidade em Estoque",
              data: data,
              backgroundColor: [
                "rgba(117, 175, 220, 0.7)",
                "rgba(255, 159, 64, 0.7)",
                "rgba(75, 192, 192, 0.7)",
                "rgba(255, 99, 132, 0.7)",
                "rgba(153, 102, 255, 0.7)",
                "rgba(255, 205, 86, 0.7)",
                "rgba(54, 162, 235, 0.7)",
              ],
              borderColor: "#fff",
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: { legend: { position: "top" } },
        },
      });
    }
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    const nomeMedicamentoInput = document.getElementById(
      "nome-medicamento-estoque"
    );
    const quantidadeInput = document.getElementById("quantidade-add-estoque");

    const nomeMedicamento = nomeMedicamentoInput.value.trim();
    const quantidade = parseInt(quantidadeInput.value);

    if (!nomeMedicamento || isNaN(quantidade) || quantidade <= 0) {
      alert("Por favor, preencha o nome e uma quantidade válida.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/estoque`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: nomeMedicamento,
          quantidade: quantidade,
        }),
      });

      if (res.ok) {
        // Sucesso!
        form.reset();
        renderizarTudo();
      } else {
        const erro = await res.json();
        alert("Erro ao salvar: " + (erro.error || "desconhecido"));
      }
    } catch (err) {
      console.error(err);
      alert("Erro de rede ao salvar no estoque.");
    }
  });

  renderizarTudo();
});
