import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { connect } from './database';
import guestRoutes from './routes/guests';

// Carregar .env baseado no NODE_ENV
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
dotenv.config({ path: path.resolve(__dirname, `../${envFile}`) });

const app = express();
const PORT = process.env.PORT || 3001;
let CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:8080';

// Remover trailing slash do CORS_ORIGIN se existir
CORS_ORIGIN = CORS_ORIGIN.replace(/\/$/, '');

console.log('[CORS DEBUG]', {
  NODE_ENV: process.env.NODE_ENV,
  envFile,
  CORS_ORIGIN: `"${CORS_ORIGIN}"`,
  CORS_ORIGIN_LENGTH: CORS_ORIGIN.length,
});

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: CORS_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

// Servir arquivos estáticos (admin dashboard)
app.use(express.static('public'));

// Rota explícita para admin
app.get('/admin', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../public/admin.html'));
});

// Conectar ao PostgreSQL e rodar migrações
async function initializeDatabase() {
  try {
    // Conectar ao banco
    await connect();
    console.log('✅ Conectado ao PostgreSQL');
    
    // Rodar migração de fix de schema
    console.log('🔧 Verificando e corrigindo schema do banco...');
    const pool = require('./database').default;
    const client = await pool.connect();
    
    try {
      // Verificar se coluna 'phone' existe
      const checkQuery = `
        SELECT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'guests'
          AND column_name = 'phone'
        );
      `;
      
      const result = await client.query(checkQuery);
      
      if (!result.rows[0].exists) {
        console.log('⚠️  Coluna "phone" não existe, adicionando...');
        
        await client.query(`
          ALTER TABLE guests ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
        `);
        
        console.log('✅ Coluna "phone" adicionada com sucesso');
      } else {
        console.log('✅ Coluna "phone" já existe');
      }
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error);
    process.exit(1);
  }
}

initializeDatabase();

// Rotas
app.use('/api', guestRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Rota não encontrada' 
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`🔗 Base de dados conectado via PostgreSQL`);
});

export default app;
