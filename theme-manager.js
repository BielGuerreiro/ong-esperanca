// Arquivo: theme-manager.js

document.addEventListener("DOMContentLoaded", () => {
  // Tenta encontrar o botão de toggle na página atual
  const darkModeToggle = document.getElementById("dark-mode-toggle");
  const body = document.body;

  // Função para aplicar o tema e, se possível, atualizar o switch
  const aplicarTema = (tema) => {
    // Aplica a classe ao corpo da página (SEMPRE FAZ ISSO)
    if (tema === "dark") {
      body.classList.add("dark-mode");
    } else {
      body.classList.remove("dark-mode");
    }

    // Tenta atualizar a interface do switch APENAS SE ELE EXISTIR na página
    if (darkModeToggle) {
      const textoDoSwitch = document.getElementById("dark-mode-text");
      const iconeDoSwitch = document.querySelector(".opcao-dark-mode .bx");

      if (tema === "dark") {
        darkModeToggle.checked = true;
        if (textoDoSwitch) textoDoSwitch.textContent = "Modo Claro";
        if (iconeDoSwitch) iconeDoSwitch.classList.replace("bx-moon", "bx-sun");
      } else {
        darkModeToggle.checked = false;
        if (textoDoSwitch) textoDoSwitch.textContent = "Modo Escuro";
        if (iconeDoSwitch) iconeDoSwitch.classList.replace("bx-sun", "bx-moon");
      }
    }
  };

  // 1. Pega o tema salvo na memória do navegador
  const temaSalvo = localStorage.getItem("theme");

  // 2. Aplica o tema salvo assim que a página carregar
  // Se não houver tema salvo, o padrão será 'light' (claro)
  aplicarTema(temaSalvo || "light");

  // 3. Adiciona o evento de clique APENAS se o botão de troca de tema existir na página
  if (darkModeToggle) {
    darkModeToggle.addEventListener("change", () => {
      const novoTema = darkModeToggle.checked ? "dark" : "light";

      // Aplica o novo tema e salva a escolha na memória
      aplicarTema(novoTema);
      localStorage.setItem("theme", novoTema);
    });
  }
});
