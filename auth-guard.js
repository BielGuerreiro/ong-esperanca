(function () {
  const usuarioJSON = localStorage.getItem("usuarioLogado");
  const loginTimestamp = localStorage.getItem("loginTimestamp");
  const caminhoPagina = window.location.pathname;

  if (!caminhoPagina.includes("/login/")) {
    if (!usuarioJSON || !loginTimestamp) {
      console.log("AuthGuard: Nenhum login local. Redirecionando...");
      window.location.href = "/login/index.html";
      return;
    }

    const dataLogin = new Date(loginTimestamp);
    const dataHoje = new Date();

    if (dataLogin.toDateString() !== dataHoje.toDateString()) {
      console.log("AuthGuard: Sessão de ontem expirou. Limpando...");

      localStorage.clear();
      alert("Sua sessão expirou. Por favor, faça login novamente.");
      window.location.href = "/login/index.html";
      return;
    }
  }
})();
