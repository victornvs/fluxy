import { Request, Response } from 'express';
import { Payment } from '../models/Payment';
import { cache, CacheKeys } from '../services/cache';

function getUserId(req: Request): string {
  return (req as any).userId;
}

export async function listPayments(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    const payments = await Payment.find({ userId }).sort({ dueDate: 1 }).lean();
    res.json(payments);
  } catch (error) {
    console.error('listPayments error:', error);
    res.status(500).json({ error: 'Erro ao listar recebimentos' });
  }
}

export async function getPayment(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    const payment = await Payment.findOne({ _id: req.params.id, userId }).lean();
    if (!payment) {
      return res.status(404).json({ error: 'Recebimento não encontrado' });
    }
    res.json(payment);
  } catch (error) {
    console.error('getPayment error:', error);
    res.status(500).json({ error: 'Erro ao buscar recebimento' });
  }
}

export async function createPayment(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    const { clientId, clientName, description, amount, dueDate, status, paymentMethod } = req.body;

    if (!clientName || !description || !amount || !dueDate) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
    }

    const payment = await Payment.create({
      userId,
      clientId,
      clientName,
      description,
      amount,
      dueDate: new Date(dueDate),
      status: status || 'pending',
      paymentMethod: paymentMethod || '',
    });

    cache.invalidate(CacheKeys.dashboard(userId));
    cache.invalidate(CacheKeys.summary(userId));
    cache.invalidate(CacheKeys.payments(userId));

    res.status(201).json(payment);
  } catch (error) {
    console.error('createPayment error:', error);
    res.status(500).json({ error: 'Erro ao criar recebimento' });
  }
}

export async function updatePayment(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    const updateData = { ...req.body };

    if (updateData.dueDate) {
      updateData.dueDate = new Date(updateData.dueDate);
    }

    const payment = await Payment.findOneAndUpdate(
      { _id: req.params.id, userId },
      { $set: updateData },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({ error: 'Recebimento não encontrado' });
    }

    cache.invalidate(CacheKeys.dashboard(userId));
    cache.invalidate(CacheKeys.summary(userId));
    cache.invalidate(CacheKeys.payments(userId));

    res.json(payment);
  } catch (error) {
    console.error('updatePayment error:', error);
    res.status(500).json({ error: 'Erro ao atualizar recebimento' });
  }
}

export async function deletePayment(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    const payment = await Payment.findOneAndDelete({ _id: req.params.id, userId });
    if (!payment) {
      return res.status(404).json({ error: 'Recebimento não encontrado' });
    }

    cache.invalidate(CacheKeys.dashboard(userId));
    cache.invalidate(CacheKeys.summary(userId));
    cache.invalidate(CacheKeys.payments(userId));

    res.json({ message: 'Recebimento removido com sucesso' });
  } catch (error) {
    console.error('deletePayment error:', error);
    res.status(500).json({ error: 'Erro ao remover recebimento' });
  }
}
