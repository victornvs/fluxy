import mongoose from 'mongoose';

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI || (process.env.NODE_ENV === 'development' ? 'mongodb://localhost:27017/fluxy' : '');

  if (!uri) {
    console.error('❌ MONGODB_URI não configurado. Verifique o arquivo .env.');
    process.exit(1);
  }

  console.log('URI carregada:', uri);

  try {
    await mongoose.connect(uri);
    console.log('✅ MongoDB conectado com sucesso');
  } catch (error) {
    console.error('❌ Erro ao conectar ao MongoDB:', error);
    process.exit(1);
  }
}