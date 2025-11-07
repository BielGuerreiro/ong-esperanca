const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "SEU_SEGREDO_SUPER_SECRETO_AQUI";

const authMiddleware = (req, res, next) => {
  const token = req.cookies.authToken;

  if (!token) {
    return res.status(401).json({ mensagem: "Não autorizado. Faça login." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    req.usuario = decoded;

    next();
  } catch (ex) {
    console.error("Erro na verificação do token:", ex.message);

    res.clearCookie("authToken");
    return res.status(401).json({ mensagem: "Sessão inválida ou expirada." });
  }
};

module.exports = authMiddleware;
