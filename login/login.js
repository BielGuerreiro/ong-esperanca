document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("login-form");
  const inputCpf = document.getElementById("cpf");
  const inputRegistro = document.getElementById("registro");
  const inputSenha = document.getElementById("senha");
  const toggleSenha = document.getElementById("toggle-senha");
  const divMensagem = document.getElementById("mensagem-feedback");

  toggleSenha.addEventListener("click", function () {
    const type =
      inputSenha.getAttribute("type") === "password" ? "text" : "password";
    inputSenha.setAttribute("type", type);
    this.classList.toggle("bx-eye-slash");
    this.classList.toggle("bx-eye");
  });

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const cpf = inputCpf.value.trim();
    const registro = inputRegistro.value.trim();
    const senha = inputSenha.value.trim();

    if (!cpf || !registro || !senha) {
      mostrarMensagem("Por favor, preencha todos os campos.", "erro");
      return;
    }

    const dadosLogin = {
      cpf: cpf,
      registro: registro,
      senha: senha,
    };

    try {
      const response = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dadosLogin),
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        mostrarMensagem("Login bem-sucedido! Redirecionando...", "sucesso");

        localStorage.setItem("usuarioLogado", JSON.stringify(data));
        localStorage.setItem("loginTimestamp", new Date().toISOString());

        setTimeout(() => {
          window.location.href = "/index.html";
        }, 1000);
      } else {
        mostrarMensagem(data.mensagem || "Erro ao tentar fazer login.", "erro");
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
      mostrarMensagem(
        "Não foi possível conectar ao servidor. Tente novamente.",
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
