import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

// Single source of truth for JWT_SECRET - must be configured for production
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET não configurado. Defina JWT_SECRET no arquivo .env ou nas variáveis de ambiente.');
}

function generateToken(userId: string): string {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '30d' });
}

function sanitizeUser(user: any) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    phone: user.phone,
    whatsapp: user.whatsapp,
    role: user.role,
    plan: user.plan,
    notifications: user.notifications || {
      whatsappEnabled: false,
      weeklyReport: true,
      monthlyReport: true,
      deliveryReminders: true,
      paymentReminders: true,
    },
  };
}

export async function register(req: Request, res: Response) {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'E-mail já cadastrado' });
    }

    const user = await User.create({
      name, email, password,
      role: 'client',
      plan: 'free',
      notifications: {
        whatsappEnabled: false,
        weeklyReport: true,
        monthlyReport: true,
        deliveryReminders: true,
        paymentReminders: true,
      },
    });
    const token = generateToken(user._id.toString());

    res.status(201).json({ token, user: sanitizeUser(user) });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao registrar usuário' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'E-mail ou senha inválidos' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'E-mail ou senha inválidos' });
    }

    const token = generateToken(user._id.toString());
    res.json({ token, user: sanitizeUser(user) });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
}

export async function getProfile(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(sanitizeUser(user));
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar perfil' });
  }
}

export async function updateProfile(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const { name, avatar, phone, whatsapp, notifications } = req.body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (phone !== undefined) updateData.phone = phone;
    if (whatsapp !== undefined) updateData.whatsapp = whatsapp;
    if (notifications !== undefined) updateData.notifications = notifications;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(sanitizeUser(user));
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar perfil' });
  }
}

export async function updatePassword(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(400).json({ error: 'Senha atual incorreta' });

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Senha atualizada com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar senha' });
  }
}