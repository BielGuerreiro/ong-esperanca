document.addEventListener("DOMContentLoaded", () => {
  const darkModeToggle = document.getElementById("dark-mode-toggle");
  const body = document.body;

  const aplicarTema = (tema) => {
    if (tema === "dark") {
      body.classList.add("dark-mode");
    } else {
      body.classList.remove("dark-mode");
    }

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

  const temaSalvo = localStorage.getItem("theme");

  aplicarTema(temaSalvo || "light");

  if (darkModeToggle) {
    darkModeToggle.addEventListener("change", () => {
      const novoTema = darkModeToggle.checked ? "dark" : "light";

      aplicarTema(novoTema);
      localStorage.setItem("theme", novoTema);
    });
  }
});
