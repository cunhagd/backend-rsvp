import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Para conexões remotas
  },
});

pool.on('error', (err) => {
  console.error('Erro no pool PostgreSQL:', err);
});

export const query = (text: string, params?: any[]) => {
  return pool.query(text, params);
};

export const connect = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Conectado ao PostgreSQL');
    client.release();
  } catch (err) {
    console.error('❌ Erro ao conectar PostgreSQL:', err);
    throw err;
  }
};

export default pool;
