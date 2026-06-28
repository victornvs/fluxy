import { Request, Response } from 'express';
import { Client } from '../models/Client';
import { cache, CacheKeys } from '../services/cache';

export async function listClients(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const clients = await Client.find({ userId }).sort({ createdAt: -1 }).lean();
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar clientes' });
  }
}

export async function getClient(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const client = await Client.findOne({ _id: req.params.id, userId }).lean();
    if (!client) return res.status(404).json({ error: 'Cliente não encontrado' });
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar cliente' });
  }
}

export async function createClient(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const { name, email, phone, company, status, notes } = req.body;
    const client = await Client.create({
      userId,
      name, email, phone,
      company: company || '',
      status: status || 'active',
      notes: notes || '',
      totalRevenue: 0,
      joinedAt: new Date(),
    });
    // Invalidate dashboard cache
    cache.invalidate(`dashboard:${userId}`);
    cache.invalidate(`summary:${userId}`);
    cache.invalidate(`clients:${userId}`);
    res.status(201).json(client);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar cliente' });
  }
}

export async function updateClient(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const client = await Client.findOneAndUpdate(
      { _id: req.params.id, userId },
      { $set: req.body },
      { new: true }
    );
    if (!client) return res.status(404).json({ error: 'Cliente não encontrado' });
    // Invalidate dashboard cache
    cache.invalidate(`dashboard:${userId}`);
    cache.invalidate(`summary:${userId}`);
    cache.invalidate(`clients:${userId}`);
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar cliente' });
  }
}

export async function deleteClient(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const client = await Client.findOneAndDelete({ _id: req.params.id, userId });
    if (!client) return res.status(404).json({ error: 'Cliente não encontrado' });
    // Invalidate dashboard cache
    cache.invalidate(`dashboard:${userId}`);
    cache.invalidate(`summary:${userId}`);
    cache.invalidate(`clients:${userId}`);
    res.json({ message: 'Cliente removido com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover cliente' });
  }
}