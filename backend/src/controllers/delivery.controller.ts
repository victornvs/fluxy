import { Request, Response } from 'express';
import { Delivery } from '../models/Delivery';
import { cache, CacheKeys } from '../services/cache';

export async function listDeliveries(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const deliveries = await Delivery.find({ userId }).sort({ dueDate: 1 }).lean();
    res.json(deliveries);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar entregas' });
  }
}

export async function createDelivery(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const delivery = await Delivery.create({ ...req.body, userId });
    // Invalidate dashboard cache
    cache.invalidate(`dashboard:${userId}`);
    cache.invalidate(`deliveries:${userId}`);
    res.status(201).json(delivery);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar entrega' });
  }
}

export async function updateDelivery(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const delivery = await Delivery.findOneAndUpdate(
      { _id: req.params.id, userId },
      { $set: req.body },
      { new: true }
    );
    if (!delivery) return res.status(404).json({ error: 'Entrega não encontrada' });
    // Invalidate dashboard cache
    cache.invalidate(`dashboard:${userId}`);
    cache.invalidate(`deliveries:${userId}`);
    res.json(delivery);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar entrega' });
  }
}

export async function deleteDelivery(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const delivery = await Delivery.findOneAndDelete({ _id: req.params.id, userId });
    if (!delivery) return res.status(404).json({ error: 'Entrega não encontrada' });
    // Invalidate dashboard cache
    cache.invalidate(`dashboard:${userId}`);
    cache.invalidate(`deliveries:${userId}`);
    res.json({ message: 'Entrega removida com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover entrega' });
  }
}