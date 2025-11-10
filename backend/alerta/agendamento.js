require("dotenv").config();
const cron = require("node-cron");
const db = require("../database.js");
const { enviarEmailBase } = require("./notificacao.js");

// === 🔧 Função auxiliar para formatar hora no padrão HH:MM ===
function formatarHora(horario) {
  if (!horario) return "-";
  return horario.substring(0, 5);
}

// === 🧠 Busca todos os medicamentos do dia ===
async function buscarMedicamentosDoDia() {
  let conn;
  try {
    conn = await db.getConnection();

    const [rows] = await conn.query(`
      SELECT 
        m.nome_medicamento AS medicamento,
        m.tipo,
        m.dosagem,
        m.horario,
        m.frequencia,
        m.duracao,
        m.data_vencimento AS validade,
        CONCAT(r.primeiro_nome, ' ', r.sobrenome) AS residenteNome
      FROM medicamentos m
      JOIN recebe rec ON rec.medicamento_id_tratamento = m.id_tratamento
      JOIN residentes r ON r.id_residente = rec.residente_id_residente
      ORDER BY m.horario ASC
    `);

    return rows.map(row => ({
      ...row,
      horario: formatarHora(row.horario),
    }));
  } catch (err) {
    console.error("Erro ao buscar medicamentos do dia:", err);
    return [];
  } finally {
    if (conn) conn.release();
  }
}

// === ✉️ Monta corpo de e-mail ===
function montarCorpoEmail(lista) {
  if (lista.length === 0) {
    return `<p>Nenhum medicamento programado para hoje.</p>`;
  }

  const linhas = lista.map(med => `
    <tr>
      <td>${med.horario}</td>
      <td>${med.medicamento}</td>
      <td>${med.tipo}</td>
      <td>${med.dosagem}</td>
      <td>${med.residenteNome}</td>
    </tr>
  `).join("");

  return `
    <h2>🕐 Lembrete de Medicamentos do Dia</h2>
    <p>Segue a lista de medicamentos que precisam ser administrados hoje:</p>
    <table border="1" cellspacing="0" cellpadding="6" style="border-collapse: collapse; font-family: Arial; font-size: 14px;">
      <thead style="background-color: #f2f2f2;">
        <tr>
          <th>Horário</th>
          <th>Medicamento</th>
          <th>Tipo</th>
          <th>Dosagem</th>
          <th>Residente</th>
        </tr>
      </thead>
      <tbody>${linhas}</tbody>
    </table>
    <p style="margin-top: 12px;">🕒 Este e-mail foi enviado automaticamente 1 hora antes dos horários programados.</p>
  `;
}

// === ⏰ Agendamento com node-cron ===
cron.schedule("*/5 * * * *", async () => {
  const agora = new Date();
  const horaAtual = agora.getHours();
  const minutoAtual = agora.getMinutes();

  const horaAlvo = new Date(agora.getTime() + 60 * 60 * 1000);
  const horaStr = horaAlvo.toTimeString().substring(0, 5); // HH:MM

  const medicamentos = await buscarMedicamentosDoDia();

  const proximos = medicamentos.filter(med => {
    return med.horario === horaStr;
  });

  if (proximos.length > 0) {
    const corpo = montarCorpoEmail(proximos);
    await enviarEmailBase("Lembrete de Medicamentos - 1h antes", corpo);
  }
});

