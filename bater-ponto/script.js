document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("ponto-form");
  const inputMatricula = document.getElementById("matricula");
  const inputSenha = document.getElementById("senha");
  const toggleSenha = document.getElementById("toggle-senha");
  const divMensagem = document.getElementById("mensagem-feedback");
  const dataHoraEl = document.getElementById("data-hora-atual");

  function carregarFuncionarios() {
    return JSON.parse(sessionStorage.getItem("listaFuncionarios") || "[]");
  }

  function carregarRegistrosDePonto() {
    return JSON.parse(sessionStorage.getItem("registrosDePonto") || "[]");
  }
  function salvarRegistrosDePonto(registros) {
    sessionStorage.setItem("registrosDePonto", JSON.stringify(registros));
  }

  function atualizarRelogio() {
    if (!dataHoraEl) return;
    const agora = new Date();
    const data = agora.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
    const hora = agora.toLocaleTimeString("pt-BR");
    dataHoraEl.textContent = `${data} | ${hora}`;
  }

  atualizarRelogio();
  setInterval(atualizarRelogio, 1000);

  toggleSenha.addEventListener("click", function () {
    const type =
      inputSenha.getAttribute("type") === "password" ? "text" : "password";
    inputSenha.setAttribute("type", type);
    this.classList.toggle("bx-eye-slash");
    this.classList.toggle("bx-eye");
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const matricula = inputMatricula.value;
    const senha = inputSenha.value;

    divMensagem.style.display = "none";

    if (!matricula || !senha) {
      mostrarMensagem("Preencha todos os campos.", "erro");
      return;
    }

    const listaFuncionarios = carregarFuncionarios();
    const funcionario = listaFuncionarios.find((f) => f.id == matricula);

    if (!funcionario || funcionario.senha !== senha) {
      mostrarMensagem("Número do funcionário ou senha inválidos.", "erro");
      return;
    }

    const todosRegistros = carregarRegistrosDePonto();
    const registrosDoFuncionario = todosRegistros.filter(
      (r) => r.funcionarioId == matricula
    );

    const ultimoRegistro =
      registrosDoFuncionario.length > 0
        ? registrosDoFuncionario[registrosDoFuncionario.length - 1]
        : null;
    const proximoTipo =
      !ultimoRegistro || ultimoRegistro.tipo === "saida" ? "entrada" : "saida";

    const novoRegistro = {
      funcionarioId: matricula,
      timestamp: new Date(),
      tipo: proximoTipo,
    };

    todosRegistros.push(novoRegistro);
    salvarRegistrosDePonto(todosRegistros);

    const nomeFuncionario = `${funcionario["primeiro-nome"]} ${funcionario.sobrenome}`;
    const horaRegistro = new Date(novoRegistro.timestamp).toLocaleTimeString(
      "pt-BR"
    );
    const tipoFormatado =
      proximoTipo.charAt(0).toUpperCase() + proximoTipo.slice(1);

    mostrarMensagem(
      `✅ ${tipoFormatado} registrada para ${nomeFuncionario} às ${horaRegistro}.`,
      "sucesso"
    );

    inputMatricula.value = "";
    inputSenha.value = "";
    inputMatricula.focus();
  });

  function mostrarMensagem(texto, tipo) {
    divMensagem.textContent = texto;
    divMensagem.className = tipo;
    divMensagem.style.display = "block";
  }
});
