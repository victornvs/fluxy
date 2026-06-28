import { Request, Response } from 'express';
import { Notification } from '../models/Notification';
import { User } from '../models/User';
import { sendWhatsAppMessage, formatWhatsAppMessage } from '../services/whatsapp';
import { Client } from '../models/Client';
import { Payment } from '../models/Payment';
import { Delivery } from '../models/Delivery';
import { BusinessMetrics } from '../models/BusinessMetrics';

export async function listNotifications(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ userId })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean(),
      Notification.countDocuments({ userId, read: false }),
    ]);
    res.json({ notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar notificações' });
  }
}

export async function markAsRead(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    await Notification.updateMany(
      { userId, _id: req.params.id },
      { $set: { read: true } }
    );
    res.json({ message: 'Notificação marcada como lida' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao marcar notificação' });
  }
}

export async function markAllAsRead(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    await Notification.updateMany(
      { userId, read: false },
      { $set: { read: true } }
    );
    res.json({ message: 'Todas notificações marcadas como lidas' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao marcar notificações' });
  }
}

export async function sendTestWhatsApp(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const user = await User.findById(userId);

    if (!user || !user.whatsapp) {
      return res.status(400).json({ error: 'WhatsApp não configurado' });
    }

    const sent = await sendWhatsAppMessage(
      user.whatsapp,
      `🔔 *Teste de Notificação*\n\nOlá ${user.name}! Esta é uma mensagem de teste do seu sistema Fluxy.\n\nNotificações ativadas com sucesso! ✅`
    );

    if (sent) {
      await Notification.create({
        userId,
        type: 'custom',
        title: 'Teste de WhatsApp',
        message: 'Mensagem de teste enviada com sucesso!',
        sentWhatsApp: true,
      });
      res.json({ message: 'WhatsApp testado com sucesso!' });
    } else {
      res.status(500).json({ error: 'Erro ao enviar WhatsApp. Verifique a configuração.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro ao testar WhatsApp' });
  }
}

export async function generateWeeklyReport(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [user, newClients, payments, deliveries, metrics, pendingPayments] = await Promise.all([
      User.findById(userId),
      Client.countDocuments({ userId, createdAt: { $gte: weekAgo } }),
      Payment.find({ userId, status: 'paid', createdAt: { $gte: weekAgo } }).lean(),
      Delivery.countDocuments({ userId, status: 'delivered', createdAt: { $gte: weekAgo } }),
      BusinessMetrics.findOne({ userId }).sort({ createdAt: -1 }).lean(),
      Payment.countDocuments({
        userId,
        status: { $in: ['pending', 'overdue'] },
      }),
    ]);

    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

    const revenue = payments.reduce((a, p) => a + p.amount, 0);

    const data = {
      userName: user.name,
      revenue: revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      deliveries,
      newClients,
      pending: pendingPayments,
    };

    const title = `📊 Relatório Semanal - ${now.toLocaleDateString('pt-BR')}`;
    const message = `Faturamento: ${data.revenue} | Entregas: ${data.deliveries} | Novos clientes: ${data.newClients} | Pendentes: ${data.pending}`;

    await Notification.create({
      userId,
      type: 'weekly_report',
      title,
      message,
      data,
    });

    if (user.whatsapp && user.notifications?.whatsappEnabled && user.notifications?.weeklyReport) {
      const msg = formatWhatsAppMessage('weekly_report', { ...data, userName: user.name });
      const sent = await sendWhatsAppMessage(user.whatsapp, msg);
      if (sent) {
        await Notification.updateOne(
          { userId, type: 'weekly_report', title },
          { $set: { sentWhatsApp: true } }
        );
      }
    }

    res.json({ message: 'Relatório semanal gerado com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao gerar relatório' });
  }
}

export async function generateMonthlyReport(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;

    const [user, metrics, totalPaid, totalClients, deliveredCount] = await Promise.all([
      User.findById(userId),
      BusinessMetrics.findOne({ userId }).sort({ createdAt: -1 }).lean(),
      Payment.aggregate([
        { $match: { userId: userId, status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Client.countDocuments({ userId }),
      Delivery.countDocuments({ userId, status: 'delivered' }),
    ]);

    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

    const totalRevenue = totalPaid[0]?.total || 0;
    const month = metrics?.month || new Date().toLocaleString('pt-BR', { month: 'long' });
    const monthlyRevenue = metrics?.monthlyRevenue || totalRevenue;
    const monthlyGoal = metrics?.monthlyGoal || 1;

    const data = {
      userName: user.name,
      month,
      revenue: monthlyRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      profit: (metrics?.profit || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      deliveries: deliveredCount,
      clients: totalClients,
      meta: monthlyGoal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      progress: `${Math.min(Math.round((monthlyRevenue / monthlyGoal) * 100), 100)}%`,
    };

    const title = `📈 Relatório Mensal - ${data.month}`;
    const message = `Faturamento: ${data.revenue} | Lucro: ${data.profit} | Clientes: ${data.clients} | Meta: ${data.progress}`;

    await Notification.create({
      userId,
      type: 'monthly_report',
      title,
      message,
      data,
    });

    if (user.whatsapp && user.notifications?.whatsappEnabled && user.notifications?.monthlyReport) {
      const msg = formatWhatsAppMessage('monthly_report', { ...data, userName: user.name });
      const sent = await sendWhatsAppMessage(user.whatsapp, msg);
      if (sent) {
        await Notification.updateOne(
          { userId, type: 'monthly_report', title },
          { $set: { sentWhatsApp: true } }
        );
      }
    }

    res.json({ message: 'Relatório mensal gerado com sucesso!' });
  } catch (error) {
    console.error('generateMonthlyReport error:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório' });
  }
}