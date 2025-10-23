document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("redefinir-form");
  const etapas = document.querySelectorAll(".etapa-form");
  const btnVerificar = document.getElementById("btn-verificar");
  const botoesVoltar = document.querySelectorAll(".btn-cancelar");

  const inputCpf = document.getElementById("cpf");
  const inputEmail = document.getElementById("email");
  const inputNovaSenha = document.getElementById("nova-senha");
  const inputConfirmarSenha = document.getElementById("confirmar-nova-senha");
  const divMensagem = document.getElementById("mensagem-feedback");

  let usuarioParaRedefinir = null;

  function carregarFuncionarios() {
    return JSON.parse(sessionStorage.getItem("listaFuncionarios") || "[]");
  }
  function salvarFuncionarios(lista) {
    sessionStorage.setItem("listaFuncionarios", JSON.stringify(lista));
  }

  // ==========================================================
  //     *** FUNÇÃO PARA CRIAR UM USUÁRIO DE TESTE ***
  // ==========================================================
  function criarFuncionarioDeTeste() {
    let funcionarios = carregarFuncionarios();
    const testeExiste = funcionarios.some((f) => f.cpf === "11111111111");

    if (!testeExiste) {
      const funcionarioTeste = {
        id: 100,
        cpf: "11111111111",
        email: "teste@ong.com",
        senha: "SenhaAntiga123@",
        "primeiro-nome": "Usuário",
        sobrenome: "Teste",
      };
      funcionarios.push(funcionarioTeste);
      salvarFuncionarios(funcionarios);
      console.log("Funcionário de teste criado:", funcionarioTeste);
    }
  }

  criarFuncionarioDeTeste();

  function mostrarEtapa(indice) {
    etapas.forEach((etapa, idx) => {
      etapa.classList.toggle("ativo", idx === indice);
    });
  }

  // LÓGICA DO BOTÃO "VERIFICAR" _____________________________________________________________________________________
  btnVerificar.addEventListener("click", () => {
    divMensagem.style.display = "none";
    const cpf = inputCpf.value.replace(/\D/g, "");
    const email = inputEmail.value;

    if (!cpf || !email) {
      mostrarMensagem("Por favor, preencha o CPF e o E-mail.", "erro");
      return;
    }

    const listaFuncionarios = carregarFuncionarios();
    const funcionarioEncontrado = listaFuncionarios.find(
      (f) => f.cpf === cpf && f.email === email
    );

    if (funcionarioEncontrado) {
      usuarioParaRedefinir = funcionarioEncontrado;
      mostrarEtapa(1);
    } else {
      mostrarMensagem("CPF ou E-mail não encontrado no sistema.", "erro");
    }
  });

  //  LÓGICA DO FORMULÁRIO "SUBMIT" ___________________________________________________________________________________________________________ ---
  form.addEventListener("submit", function (event) {
    event.preventDefault();
  });

  botoesVoltar.forEach((botao) => {
    botao.addEventListener("click", () => {
      window.location.href = "../index.html";
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
  iniciarToggleSenha("nova-senha", "toggle-nova-senha");
  iniciarToggleSenha("confirmar-nova-senha", "toggle-confirmar-senha");
});
