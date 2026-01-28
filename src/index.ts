import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connect } from './database';
import guestRoutes from './routes/guests';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:8080';

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: CORS_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

// Conectar ao PostgreSQL
connect()
  .catch((error) => {
    console.error('❌ Erro ao conectar PostgreSQL:', error);
    process.exit(1);
  });

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
