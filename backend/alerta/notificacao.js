require("dotenv").config();
const nodemailer = require("nodemailer");

// === CONFIGURA TRANSPORTADOR DE EMAIL ===
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// === FUNÇÃO: NOTIFICAR NOVO MEDICAMENTO ===
async function enviarEmailMedicamento(med) {
  const corpo = `
    <h2>💊 Novo Medicamento Cadastrado</h2>
    <p><b>Medicamento:</b> ${med.medicamento}</p>
    <p><b>Tipo:</b> ${med.tipo}</p>
    <p><b>Dosagem:</b> ${med.dosagem}</p>
    <p><b>Horário:</b> ${med.horario}</p>
    <p><b>Frequência:</b> ${med.frequencia}</p>
    <p><b>Duração:</b> ${med.duracao}</p>
    <p><b>Validade:</b> ${med.validade}</p>
    <p><b>Residente:</b> ${med.residenteNome}</p>
  `;

  try {
    await transporter.sendMail({
      from: `"Sistema de Cuidados" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_DESTINATARIO,
      subject: "Novo Medicamento Cadastrado",
      html: corpo,
    });
    console.log("✅ E-mail enviado sobre novo medicamento.");
  } catch (err) {
    console.error("❌ Falha ao enviar e-mail de medicamento:", err);
  }
}

module.exports = { enviarEmailMedicamento };
