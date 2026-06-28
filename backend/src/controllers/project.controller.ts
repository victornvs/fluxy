import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Project } from '../models/Project';

export async function listProjects(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const projects = await Project.find({ userId }).sort({ createdAt: -1 }).lean();
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar projetos' });
  }
}

export async function getProject(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const project = await Project.findOne({ _id: req.params.id, userId }).lean();
    if (!project) return res.status(404).json({ error: 'Projeto não encontrado' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar projeto' });
  }
}

export async function createProject(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const project = await Project.create({ ...req.body, userId });
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar projeto' });
  }
}

export async function updateProject(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, userId },
      { $set: req.body },
      { new: true }
    );
    if (!project) return res.status(404).json({ error: 'Projeto não encontrado' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar projeto' });
  }
}

export async function deleteProject(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const project = await Project.findOneAndDelete({ _id: req.params.id, userId });
    if (!project) return res.status(404).json({ error: 'Projeto não encontrado' });
    res.json({ message: 'Projeto removido com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover projeto' });
  }
}

export async function getPortfolioSummary(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;

    // Single aggregation pipeline replaces 4 separate queries
    const [result] = await Project.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalProjects: { $sum: 1 },
          completedProjects: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          totalValue: { $sum: '$value' },
          websites: { $sum: { $cond: [{ $eq: ['$type', 'website'] }, 1, 0] } },
        },
      },
    ]);

    if (!result) {
      return res.json({ totalProjects: 0, completedProjects: 0, totalValue: 0, websites: 0 });
    }

    res.json({
      totalProjects: result.totalProjects,
      completedProjects: result.completedProjects,
      totalValue: result.totalValue,
      websites: result.websites,
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar resumo do portfólio' });
  }
}