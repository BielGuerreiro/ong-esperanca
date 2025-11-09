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

// === 🔧 Função utilitária para formatar datas no padrão brasileiro ===
function formatarData(data) {
  if (!data) return "-";
  const d = new Date(data);
  if (isNaN(d)) return data; // se não for uma data válida, retorna como está
  const dia = String(d.getDate()).padStart(2, "0");
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const ano = d.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

// === 🔹 NOVO MEDICAMENTO ===
async function enviarEmailMedicamento(med) {
  const corpo = `
    <h2>💊 Novo Medicamento Cadastrado</h2>
    <p><b>Medicamento:</b> ${med.medicamento}</p>
    <p><b>Tipo:</b> ${med.tipo}</p>
    <p><b>Dosagem:</b> ${med.dosagem}</p>
    <p><b>Horário:</b> ${med.horario}</p>
    <p><b>Frequência:</b> ${med.frequencia}</p>
    <p><b>Duração:</b> ${med.duracao}</p>
    <p><b>Validade:</b> ${formatarData(med.validade)}</p>
    <p><b>Residente:</b> ${med.residenteNome}</p>
  `;

  await enviarEmailBase("Novo Medicamento Cadastrado", corpo);
}

// === 🔹 MEDICAMENTO ATUALIZADO ===
async function enviarEmailAtualizacaoMedicamento(med) {
  const corpo = `
    <h2>✏️ Medicamento Atualizado</h2>
    <p>O medicamento de <b>${med.residenteNome}</b> foi atualizado.</p>
    <p><b>Medicamento:</b> ${med.medicamento}</p>
    <p><b>Dosagem:</b> ${med.dosagem}</p>
    <p><b>Tipo:</b> ${med.tipo}</p>
    <p><b>Horário:</b> ${med.horario}</p>
    <p><b>Frequência:</b> ${med.frequencia}</p>
    <p><b>Duração:</b> ${med.duracao}</p>
    <p><b>Validade:</b> ${formatarData(med.validade)}</p>
  `;

  await enviarEmailBase("Medicamento Atualizado", corpo);
}

// === 🔹 MEDICAMENTO EXCLUÍDO ===
async function enviarEmailExclusaoMedicamento(med) {
  const corpo = `
    <h2>❌ Medicamento Excluído</h2>
    <p>O medicamento <b>${med.medicamento}</b> foi removido do residente <b>${med.residenteNome}</b>.</p>
    <p><b>Tipo:</b> ${med.tipo}</p>
    <p><b>Dosagem:</b> ${med.dosagem}</p>
    <p><b>Horário:</b> ${med.horario}</p>
    <p><b>Frequência:</b> ${med.frequencia}</p>
    <p><b>Duração:</b> ${med.duracao}</p>
    <p><b>Validade:</b> ${formatarData(med.validade)}</p>
  `;

  await enviarEmailBase("Medicamento Excluído", corpo);
}

async function enviarEmailBase(assunto, corpo) {
  try {
    await transporter.sendMail({
      from: `"Acolhe+" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_DESTINATARIO,
      subject: assunto,
      html: corpo,
    });
    console.log(`✅ E-mail enviado: ${assunto}`);
  } catch (err) {
    console.error(`❌ Falha ao enviar e-mail (${assunto}):`, err);
  }
}

module.exports = {
  enviarEmailMedicamento,
  enviarEmailAtualizacaoMedicamento,
  enviarEmailExclusaoMedicamento,
  enviarEmailBase
};
