import { Request, Response } from 'express';
import { User } from '../models/User';
import { Client } from '../models/Client';
import { Payment } from '../models/Payment';
import { Delivery } from '../models/Delivery';
import { Project } from '../models/Project';
import { BusinessMetrics } from '../models/BusinessMetrics';

export async function listUsers(req: Request, res: Response) {
  try {
    const adminId = (req as any).userId;

    // Só admin pode ver usuários
    const admin = await User.findById(adminId);
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    // Admin vê todos os usuários que ele criou + ele mesmo
    const users = await User.find({
      $or: [
        { _id: adminId },
        { createdBy: adminId },
      ]
    }).select('-password').sort({ createdAt: -1 }).lean();

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar usuários' });
  }
}

export async function createUser(req: Request, res: Response) {
  try {
    const adminId = (req as any).userId;

    const admin = await User.findById(adminId);
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const { name, email, password, plan } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'E-mail já cadastrado' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: 'client',
      plan: plan || 'free',
      createdBy: adminId,
    });

    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      plan: user.plan,
      createdAt: user.createdAt,
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
}

export async function deleteUser(req: Request, res: Response) {
  try {
    const adminId = (req as any).userId;
    const userIdToDelete = req.params.id;

    const admin = await User.findById(adminId);
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    // Não pode deletar a si mesmo
    if (userIdToDelete === adminId) {
      return res.status(400).json({ error: 'Não é possível deletar seu próprio usuário' });
    }

    const user = await User.findOne({ _id: userIdToDelete, createdBy: adminId });
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Deletar todos os dados do usuário
    await Promise.all([
      Client.deleteMany({ userId: userIdToDelete }),
      Payment.deleteMany({ userId: userIdToDelete }),
      Delivery.deleteMany({ userId: userIdToDelete }),
      Project.deleteMany({ userId: userIdToDelete }),
      BusinessMetrics.deleteMany({ userId: userIdToDelete }),
      User.findByIdAndDelete(userIdToDelete),
    ]);

    res.json({ message: 'Usuário e todos os dados removidos com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover usuário' });
  }
}

export async function resetUserData(req: Request, res: Response) {
  try {
    const adminId = (req as any).userId;
    const userIdToReset = req.params.id;

    const admin = await User.findById(adminId);
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    // Limpa todos os dados mas mantém o usuário
    await Promise.all([
      Client.deleteMany({ userId: userIdToReset }),
      Payment.deleteMany({ userId: userIdToReset }),
      Delivery.deleteMany({ userId: userIdToReset }),
      Project.deleteMany({ userId: userIdToReset }),
      BusinessMetrics.deleteMany({ userId: userIdToReset }),
    ]);

    res.json({ message: 'Dados do usuário resetados com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao resetar dados' });
  }
}