import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Single source of truth for JWT_SECRET - must be configured for production
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET não configurado. Defina JWT_SECRET no arquivo .env ou nas variáveis de ambiente.');
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    (req as any).userId = decoded.id;
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
}