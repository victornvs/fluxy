import { Request, Response } from 'express';
import { BusinessMetrics } from '../models/BusinessMetrics';
import { Client } from '../models/Client';
import { Payment } from '../models/Payment';
import { Delivery } from '../models/Delivery';
import { cache, CacheKeys } from '../services/cache';

function calculateGrowth(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100 * 10) / 10;
}

function getUserId(req: Request): string {
  return (req as any).userId;
}

export async function getFullDashboard(req: Request, res: Response) {
  try {
    const userId = getUserId(req);

    // Try cache first
    const cached = cache.get(CacheKeys.dashboard(userId));
    if (cached) {
      return res.json(cached);
    }

    // Parallel queries: metrics + active clients count + payments + deliveries + active clients list
    const [metricsResult, activeClientsCount, upcomingPayments, upcomingDeliveries, activeClients] =
      await Promise.all([
        BusinessMetrics.findOne({ userId }).sort({ createdAt: -1 }).lean(),
        Client.countDocuments({ userId, status: 'active' }),
        Payment.find({ userId, status: { $in: ['pending', 'overdue'] } })
          .sort({ dueDate: 1 })
          .limit(8)
          .lean(),
        Delivery.find({ userId, status: { $in: ['scheduled', 'in_progress'] } })
          .sort({ dueDate: 1 })
          .limit(8)
          .lean(),
        Client.find({ userId, status: 'active' })
          .sort({ totalRevenue: -1 })
          .limit(5)
          .select('name email phone company status totalRevenue')
          .lean(),
      ]);

    if (!metricsResult) {
      const responseData = {
        summary: {
          monthlyRevenue: 0,
          monthlyGoal: 0,
          goalProgress: 0,
          profit: 0,
          expenses: 0,
          activeClients: activeClientsCount,
          profitMargin: 0,
          month: '',
          year: new Date().getFullYear(),
        },
        growthIndicators: [],
        monthlyHistory: [],
        upcomingPayments,
        upcomingDeliveries,
        activeClients,
      };

      cache.set(CacheKeys.dashboard(userId), responseData);
      return res.json(responseData);
    }

    const goalProgress = Math.min(
      Math.round((metricsResult.monthlyRevenue / metricsResult.monthlyGoal) * 100),
      100
    );

    const growthIndicators = metricsResult.growthIndicators.map((indicator) => ({
      label: indicator.label,
      value: indicator.value,
      previousValue: indicator.previousValue,
      unit: indicator.unit,
      growth: calculateGrowth(indicator.value, indicator.previousValue),
    }));

    const responseData = {
      summary: {
        monthlyRevenue: metricsResult.monthlyRevenue,
        monthlyGoal: metricsResult.monthlyGoal,
        goalProgress,
        profit: metricsResult.profit,
        expenses: metricsResult.expenses,
        activeClients: activeClientsCount,
        profitMargin:
          metricsResult.monthlyRevenue > 0
            ? Math.round((metricsResult.profit / metricsResult.monthlyRevenue) * 100 * 10) / 10
            : 0,
        month: metricsResult.month,
        year: metricsResult.year,
      },
      growthIndicators,
      monthlyHistory: metricsResult.monthlyHistory,
      upcomingPayments,
      upcomingDeliveries,
      activeClients,
    };

    // Cache the full dashboard response
    cache.set(CacheKeys.dashboard(userId), responseData);

    res.json(responseData);
  } catch (error) {
    console.error('getFullDashboard error:', error);
    res.status(500).json({ error: 'Erro ao buscar dashboard completo' });
  }
}

export async function getDashboardSummary(req: Request, res: Response) {
  try {
    const userId = getUserId(req);

    const cached = cache.get(CacheKeys.summary(userId));
    if (cached) {
      return res.json(cached);
    }

    const [metrics, activeClientsCount] = await Promise.all([
      BusinessMetrics.findOne({ userId }).sort({ createdAt: -1 }).lean(),
      Client.countDocuments({ userId, status: 'active' }),
    ]);

    if (!metrics) {
      return res.json({
        monthlyRevenue: 0,
        monthlyGoal: 0,
        goalProgress: 0,
        profit: 0,
        expenses: 0,
        activeClients: activeClientsCount,
        profitMargin: 0,
        month: '',
        year: new Date().getFullYear(),
      });
    }

    const goalProgress = Math.min(
      Math.round((metrics.monthlyRevenue / metrics.monthlyGoal) * 100),
      100
    );

    const responseData = {
      monthlyRevenue: metrics.monthlyRevenue,
      monthlyGoal: metrics.monthlyGoal,
      goalProgress,
      profit: metrics.profit,
      expenses: metrics.expenses,
      activeClients: activeClientsCount || metrics.activeClients,
      profitMargin:
        metrics.monthlyRevenue > 0
          ? Math.round((metrics.profit / metrics.monthlyRevenue) * 100 * 10) / 10
          : 0,
      month: metrics.month,
      year: metrics.year,
    };

    cache.set(CacheKeys.summary(userId), responseData);
    res.json(responseData);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar resumo do dashboard' });
  }
}

export async function getGrowthIndicators(req: Request, res: Response) {
  try {
    const userId = getUserId(req);

    const cached = cache.get(CacheKeys.growth(userId));
    if (cached) {
      return res.json(cached);
    }

    const metrics = await BusinessMetrics.findOne({ userId })
      .sort({ createdAt: -1 })
      .lean();

    if (!metrics) {
      return res.status(404).json({ error: 'Métricas não encontradas' });
    }

    const indicators = metrics.growthIndicators.map((indicator) => ({
      label: indicator.label,
      value: indicator.value,
      previousValue: indicator.previousValue,
      unit: indicator.unit,
      growth: calculateGrowth(indicator.value, indicator.previousValue),
    }));

    cache.set(CacheKeys.growth(userId), indicators);
    res.json(indicators);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar indicadores de crescimento' });
  }
}

export async function getMonthlyHistory(req: Request, res: Response) {
  try {
    const userId = getUserId(req);

    const cached = cache.get(CacheKeys.history(userId));
    if (cached) {
      return res.json(cached);
    }

    const metrics = await BusinessMetrics.findOne({ userId })
      .sort({ createdAt: -1 })
      .lean();

    if (!metrics) {
      cache.set(CacheKeys.history(userId), []);
      return res.json([]);
    }

    cache.set(CacheKeys.history(userId), metrics.monthlyHistory);
    res.json(metrics.monthlyHistory);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar histórico mensal' });
  }
}

export async function getUpcomingPayments(req: Request, res: Response) {
  try {
    const userId = getUserId(req);

    const cached = cache.get(CacheKeys.payments(userId));
    if (cached) {
      return res.json(cached);
    }

    const [payments, overduePayments] = await Promise.all([
      Payment.find({
        userId,
        status: { $in: ['pending', 'overdue'] },
        dueDate: { $gte: new Date() },
      })
        .sort({ dueDate: 1 })
        .limit(10)
        .lean(),
      Payment.find({
        userId,
        status: 'overdue',
      })
        .sort({ dueDate: 1 })
        .limit(5)
        .lean(),
    ]);

    // Deduplicate: if a payment appears in both (pending + overdue), keep once
    const seenIds = new Set<string>();
    const allPayments = [...overduePayments, ...payments].filter((payment) => {
      const id = payment._id.toString();
      if (seenIds.has(id)) return false;
      seenIds.add(id);
      return true;
    }).slice(0, 8);

    cache.set(CacheKeys.payments(userId), allPayments);
    res.json(allPayments);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar próximos recebimentos' });
  }
}

export async function getUpcomingDeliveries(req: Request, res: Response) {
  try {
    const userId = getUserId(req);

    const cached = cache.get(CacheKeys.deliveries(userId));
    if (cached) {
      return res.json(cached);
    }

    const deliveries = await Delivery.find({
      userId,
      status: { $in: ['scheduled', 'in_progress'] },
    })
      .sort({ dueDate: 1 })
      .limit(8)
      .lean();

    cache.set(CacheKeys.deliveries(userId), deliveries);
    res.json(deliveries);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar próximas entregas' });
  }
}

export async function getActiveClients(req: Request, res: Response) {
  try {
    const userId = getUserId(req);

    const cached = cache.get(CacheKeys.clients(userId));
    if (cached) {
      return res.json(cached);
    }

    const [clients, totalActive] = await Promise.all([
      Client.find({ userId, status: 'active' })
        .sort({ totalRevenue: -1 })
        .limit(10)
        .select('name email phone company status totalRevenue')
        .lean(),
      Client.countDocuments({ userId, status: 'active' }),
    ]);

    const responseData = { clients, total: totalActive };
    cache.set(CacheKeys.clients(userId), responseData);
    res.json(responseData);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar clientes ativos' });
  }
}