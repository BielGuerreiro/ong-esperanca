document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("form-add-estoque");
  const tabelaBody = document.getElementById("lista-estoque-body");
  const ctx = document.getElementById("grafico-estoque")?.getContext("2d");
  let graficoEstoque = null;

  function carregarEstoque() {
    return JSON.parse(sessionStorage.getItem("listaEstoque") || "[]");
  }

  function salvarEstoque(estoque) {
    sessionStorage.setItem("listaEstoque", JSON.stringify(estoque));
  }

  function renderizarTudo() {
    const estoque = carregarEstoque();

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

  form.addEventListener("submit", function (event) {
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

    const estoque = carregarEstoque();
    const itemExistente = estoque.find(
      (item) => item.nome.toLowerCase() === nomeMedicamento.toLowerCase()
    );

    if (itemExistente) {
      itemExistente.quantidade += quantidade;
    } else {
      estoque.push({ nome: nomeMedicamento, quantidade: quantidade });
    }

    salvarEstoque(estoque);
    form.reset();
    renderizarTudo();
  });

  renderizarTudo();
});
