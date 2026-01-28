import pool from '../database';
import dotenv from 'dotenv';

dotenv.config();

const createTablesSQL = `
-- Criar tabela de convidados
CREATE TABLE IF NOT EXISTS guests (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  age INTEGER NOT NULL,
  phone VARCHAR(20) NOT NULL,
  has_children BOOLEAN DEFAULT FALSE,
  will_stay BOOLEAN DEFAULT FALSE,
  arrival_day VARCHAR(50),
  confirmed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de filhos
CREATE TABLE IF NOT EXISTS children (
  id SERIAL PRIMARY KEY,
  guest_id INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  age INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE CASCADE
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_guests_name ON guests(name);
CREATE INDEX IF NOT EXISTS idx_guests_confirmed_at ON guests(confirmed_at);
CREATE INDEX IF NOT EXISTS idx_children_guest_id ON children(guest_id);

-- Criar view para estatísticas
CREATE OR REPLACE VIEW guest_stats AS
SELECT 
  COUNT(*) as total_guests,
  COUNT(CASE WHEN will_stay THEN 1 END) as guests_staying,
  COUNT(CASE WHEN has_children THEN 1 END) as guests_with_children,
  (SELECT COUNT(*) FROM children) as total_children
FROM guests;
`;

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Iniciando migração do banco de dados...');
    
    // Dividir e executar cada statement separadamente
    const statements = createTablesSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const statement of statements) {
      await client.query(statement);
      console.log('✅ Executado:', statement.substring(0, 50) + '...');
    }

    console.log('✅ Migração concluída com sucesso!');
    console.log('📊 Tabelas criadas: guests, children');
    console.log('👀 View criada: guest_stats');
  } catch (error) {
    console.error('❌ Erro durante migração:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Executar migração
runMigration().catch(err => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
