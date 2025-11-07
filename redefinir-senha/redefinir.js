// ------------------------------------
// ARQUIVO COMPLETO: redefinir-senha/redefinir.js
// ------------------------------------
document.addEventListener("DOMContentLoaded", function () {
  const API_URL = "http://localhost:3000/api"; // URL do seu backend

  const form = document.getElementById("redefinir-form");
  const etapas = document.querySelectorAll(".etapa-form");
  const btnVerificar = document.getElementById("btn-verificar");
  const botoesVoltar = document.querySelectorAll(".btn-cancelar");

  // Campos da Etapa 1
  const inputCpf = document.getElementById("cpf");
  const inputRegistro = document.getElementById("registro");
  const inputEmail = document.getElementById("email");
  const inputDataNascimento = document.getElementById("data-nascimento"); // MODIFICADO

  // Campos da Etapa 2
  const inputNovaSenha = document.getElementById("nova-senha");
  const inputConfirmarSenha = document.getElementById("confirmar-nova-senha");

  const divMensagem = document.getElementById("mensagem-feedback");

  let idUsuarioParaRedefinir = null;

  function mostrarEtapa(indice) {
    etapas.forEach((etapa, idx) => {
      etapa.classList.toggle("ativo", idx === indice);
    });
  }

  // --- LÓGICA DO BOTÃO "VERIFICAR" (Etapa 1) ---
  btnVerificar.addEventListener("click", async () => {
    divMensagem.style.display = "none";
    const cpf = inputCpf.value;
    const registro = inputRegistro.value;
    const email = inputEmail.value;
    const dataNascimento = inputDataNascimento.value; // MODIFICADO

    if (!cpf || !registro || !email || !dataNascimento) {
      // MODIFICADO
      mostrarMensagem("Por favor, preencha todos os campos.", "erro");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/verificar-identidade`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Envia os 4 campos para o backend
        body: JSON.stringify({ cpf, registro, email, dataNascimento }), // MODIFICADO
        // credentials: "include", // Descomente se esta for uma rota protegida
      });

      const data = await response.json();

      if (response.ok) {
        idUsuarioParaRedefinir = data.id; // Backend retorna o ID do usuário
        mostrarEtapa(1); // Vai para a Etapa 2
      } else {
        mostrarMensagem(data.mensagem || "Dados não conferem.", "erro");
      }
    } catch (error) {
      console.error("Erro ao verificar dados:", error);
      mostrarMensagem("Erro de conexão com o servidor.", "erro");
    }
  });

  // --- LÓGICA DO FORMULÁRIO "SUBMIT" (Etapa 2) ---
  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    divMensagem.style.display = "none";

    const novaSenha = inputNovaSenha.value;
    const confirmarSenha = inputConfirmarSenha.value;

    if (!novaSenha || !confirmarSenha) {
      mostrarMensagem("Por favor, preencha a nova senha.", "erro");
      return;
    }

    if (novaSenha !== confirmarSenha) {
      mostrarMensagem("As novas senhas não coincidem.", "erro");
      return;
    }

    if (!inputNovaSenha.checkValidity()) {
      mostrarMensagem(
        inputNovaSenha.title ||
          "A senha não atende aos requisitos de segurança.",
        "erro"
      );
      return;
    }

    if (!idUsuarioParaRedefinir) {
      mostrarMensagem(
        "Erro de verificação. Por favor, volte ao início.",
        "erro"
      );
      return;
    }

    try {
      const response = await fetch(`${API_URL}/atualizar-senha`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: idUsuarioParaRedefinir,
          novaSenha: novaSenha,
        }),
        // credentials: "include", // Descomente se esta for uma rota protegida
      });

      const data = await response.json();

      if (response.ok) {
        mostrarMensagem(
          "Senha alterada com sucesso! Redirecionando...",
          "sucesso"
        );
        idUsuarioParaRedefinir = null;
        setTimeout(() => {
          // Volta para a página de login, pois a senha mudou
          window.location.href = "../login/index.html";
        }, 2000);
      } else {
        mostrarMensagem(
          data.mensagem || "Não foi possível alterar a senha.",
          "erro"
        );
      }
    } catch (error) {
      console.error("Erro ao atualizar senha:", error);
      mostrarMensagem("Erro de conexão com o servidor.", "erro");
    }
  });

  // --- Funções Auxiliares ---

  botoesVoltar.forEach((botao) => {
    botao.addEventListener("click", () => {
      // Se estiver na etapa 2, volta para a 1. Se estiver na 1, volta pro login.
      if (document.getElementById("etapa-2").classList.contains("ativo")) {
        mostrarEtapa(0);
        idUsuarioParaRedefinir = null; // Reseta a verificação
      } else {
        // O botão voltar da Etapa 1 sempre volta para o login
        window.location.href = "../login/index.html";
      }
    });
  });

  function iniciarToggleSenha(inputId, toggleId) {
    const input = document.getElementById(inputId);
    const toggle = document.getElementById(toggleId);
    if (input && toggle) {
      toggle.addEventListener("click", () => {
        const type =
          input.getAttribute("type") === "password" ? "text" : "password";
        input.setAttribute("type", type);
        toggle.classList.toggle("bx-eye-slash");
        toggle.classList.toggle("bx-eye");
      });
    }
  }

  function mostrarMensagem(texto, tipo) {
    divMensagem.textContent = texto;
    divMensagem.className = tipo;
    divMensagem.style.display = "block";
  }

  // Inicializa os botões de "olho" da Etapa 2
  iniciarToggleSenha("nova-senha", "toggle-nova-senha");
  iniciarToggleSenha("confirmar-nova-senha", "toggle-confirmar-senha");
});
