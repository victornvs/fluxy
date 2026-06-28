import axios from 'axios';

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || 'http://localhost:8080';
const WHATSAPP_API_KEY = process.env.WHATSAPP_API_KEY || '';
const WHATSAPP_INSTANCE = process.env.WHATSAPP_INSTANCE || 'fluxy';

// Suporta Evolution API, Baileys, e Typebot
export async function sendWhatsAppMessage(to: string, message: string): Promise<boolean> {
  try {
    // Remove non-digits, ensure +55 format
    const cleanNumber = to.replace(/\D/g, '');
    const formattedNumber = cleanNumber.startsWith('55') ? cleanNumber : `55${cleanNumber}`;

    console.log(`📱 Enviando WhatsApp para ${formattedNumber}...`);

    // Tenta Evolution API primeiro
    try {
      await axios.post(`${WHATSAPP_API_URL}/message/sendText/${WHATSAPP_INSTANCE}`, {
        number: formattedNumber,
        text: message,
        delay: 1200,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'apikey': WHATSAPP_API_KEY,
        },
        timeout: 5000,
      });
      console.log(`✅ WhatsApp enviado para ${formattedNumber}`);
      return true;
    } catch (err) {
      console.log(`⚠️ Evolution API falhou, tentando formato simples...`);
    }

    // Fallback: Tenta API genérica
    try {
      await axios.post(`${WHATSAPP_API_URL}/send`, {
        phone: formattedNumber,
        message: message,
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000,
      });
      return true;
    } catch {
      console.log(`⚠️ WhatsApp não disponível. Configure WHATSAPP_API_URL no .env`);
      return false;
    }
  } catch (error) {
    console.error('❌ Erro ao enviar WhatsApp:', error);
    return false;
  }
}

export function formatWhatsAppMessage(type: string, data: any): string {
  const userName = data.userName || 'Cliente';
  const businessName = 'Fluxy';

  const templates: Record<string, string> = {
    welcome: `👋 Olá *${userName}*! Bem-vindo ao *${businessName}* 🎉

Seu acesso foi criado com sucesso! Agora você pode gerenciar seu negócio:
📊 Dashboard financeiro
👥 Clientes
📦 Entregas
💰 Recebimentos
🌐 Portfólio

Acesse: https://app.fluxy.com.br
Email: ${data.email || ''}
Senha: (informada pelo admin)

Qualquer dúvida, estamos aqui! 🚀`,

    weekly_report: `📊 *Relatório Semanal - ${businessName}*
Olá *${userName}*!

Resumo da semana:
💰 Faturamento: ${data.revenue || 'R$ 0'}
📦 Entregas: ${data.deliveries || 0}
👥 Clientes novos: ${data.newClients || 0}
⏳ Pendentes: ${data.pending || 0}

Continue o ótimo trabalho! 💪`,

    monthly_report: `📈 *Relatório Mensal - ${businessName}*
Olá *${userName}*!

Resumo do mês ${data.month || ''}:
💰 Faturamento: ${data.revenue || 'R$ 0'}
💵 Lucro: ${data.profit || 'R$ 0'}
📦 Entregas realizadas: ${data.deliveries || 0}
👥 Total de clientes: ${data.clients || 0}

Meta: ${data.meta || 'R$ 0'}
Progresso: ${data.progress || '0%'}

Continue evoluindo! 🚀`,

    delivery_reminder: `⏰ *Lembrete de Entrega - ${businessName}*
Olá *${userName}*!

Você tem uma entrega próxima:
📋 ${data.title || 'Entrega'}
👤 Cliente: ${data.client || ''}
📅 Prazo: ${data.dueDate || ''}
💰 Valor: ${data.value || 'R$ 0'}
⚡ Prioridade: ${data.priority || 'Média'}

Não deixe para última hora! 💪`,

    payment_reminder: `💳 *Lembrete de Recebimento - ${businessName}*
Olá *${userName}*!

Recebimento próximo:
📝 ${data.description || ''}
👤 Cliente: ${data.client || ''}
💰 Valor: ${data.amount || 'R$ 0'}
📅 Vencimento: ${data.dueDate || ''}

Fique atento ao prazo! ✅`,

    payment_overdue: `⚠️ *RECEBIMENTO VENCIDO - ${businessName}*
Olá *${userName}*!

O seguinte recebimento está VENCIDO:
📝 ${data.description || ''}
👤 Cliente: ${data.client || ''}
💰 Valor: ${data.amount || 'R$ 0'}
📅 Venceu em: ${data.dueDate || ''}

Entre em contato com o cliente! 📞`,
  };

  return templates[type] || `📩 *${businessName}*\nOlá *${userName}*!\n\n${data.message || ''}`;
}