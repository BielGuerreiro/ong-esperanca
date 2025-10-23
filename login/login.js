document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("login-form");
  const inputCpf = document.getElementById("cpf");
  const inputEmail = document.getElementById("email");
  const inputSenha = document.getElementById("senha");
  const toggleSenha = document.getElementById("toggle-senha");
  const divMensagem = document.getElementById("mensagem-feedback");

  function carregarFuncionarios() {
    return JSON.parse(sessionStorage.getItem("listaFuncionarios") || "[]");
  }

  toggleSenha.addEventListener("click", function () {
    const type =
      inputSenha.getAttribute("type") === "password" ? "text" : "password";
    inputSenha.setAttribute("type", type);
    this.classList.toggle("bx-eye-slash");
    this.classList.toggle("bx-eye");
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const cpf = inputCpf.value.trim();
    const email = inputEmail.value.trim();
    const senha = inputSenha.value.trim();

    if (!cpf || !email || !senha) {
      mostrarMensagem("Por favor, preencha todos os campos.", "erro");
      return;
    }

    const listaFuncionarios = carregarFuncionarios();
    const funcionarioEncontrado = listaFuncionarios.find(
      (f) => f.cpf === cpf && f.email === email && f.senha === senha
    );

    if (funcionarioEncontrado) {
      mostrarMensagem("Login bem-sucedido! Redirecionando...", "sucesso");
      sessionStorage.setItem(
        "usuarioLogado",
        JSON.stringify(funcionarioEncontrado)
      );

      setTimeout(() => {
        window.location.href = "../index.html";
      });
    } else {
      mostrarMensagem(
        "Credenciais inválidas. Verifique os dados e tente novamente.",
        "erro"
      );
    }
  });

  function mostrarMensagem(texto, tipo) {
    divMensagem.textContent = texto;
    divMensagem.className = tipo;
    divMensagem.style.display = "block";
  }
});
