import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { Client } from '../models/Client';
import { Payment } from '../models/Payment';
import { Delivery } from '../models/Delivery';
import { BusinessMetrics } from '../models/BusinessMetrics';
import { User } from '../models/User';
import { Project } from '../models/Project';

dotenv.config();

async function seed() {
  try {
    await connectDB();

    console.log('🗑️  Limpando coleções...');
    await Promise.all([
      Client.deleteMany({}),
      Payment.deleteMany({}),
      Delivery.deleteMany({}),
      BusinessMetrics.deleteMany({}),
      User.deleteMany({}),
      Project.deleteMany({}),
    ]);

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminName = process.env.ADMIN_NAME;

    if (adminEmail && adminPassword && adminName) {
      console.log('👤 Criando usuário admin...');
      const admin = await User.create({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        plan: 'enterprise',
      });

      console.log(`   ✅ Admin criado: ${adminEmail}`);
      console.log(`   👑 Role: admin`);
      console.log('✅ Seed concluído com sucesso!');
      console.log(`   - 1 usuário admin criado`);
      console.log('');
      console.log('📝 Use a página "Usuários" no painel para criar novos clientes!');
    } else {
      console.log('⚠️ Admin não criado, pois ADMIN_EMAIL, ADMIN_PASSWORD e ADMIN_NAME não estão definidos.');
      console.log('✅ Seed executado com sucesso. O banco está limpo e pronto para uso vazio.');
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro no seed:', error);
    process.exit(1);
  }
}

seed();