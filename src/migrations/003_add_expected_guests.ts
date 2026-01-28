import pool from '../database';
import dotenv from 'dotenv';

dotenv.config();

const addExpectedGuestsTableSQL = `
-- Criar tabela de convidados esperados
CREATE TABLE IF NOT EXISTS expected_guests (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar índice para busca rápida
CREATE INDEX IF NOT EXISTS idx_expected_guests_name ON expected_guests(name);

-- Atualizar view de estatísticas para incluir comparação
CREATE OR REPLACE VIEW guest_stats AS
SELECT 
  (SELECT COUNT(*) FROM expected_guests) as total_expected,
  COUNT(DISTINCT g.id) as total_confirmed,
  COUNT(CASE WHEN g.will_stay THEN 1 END) as guests_staying,
  COUNT(CASE WHEN NOT g.will_stay THEN 1 END) as guests_day_use
FROM guests g;
`;

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Adicionando tabela de convidados esperados...');
    
    const statements = addExpectedGuestsTableSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const statement of statements) {
      try {
        await client.query(statement);
        console.log('✅ Executado:', statement.substring(0, 60) + '...');
      } catch (err: any) {
        if (err.message.includes('already exists')) {
          console.log('ℹ️  Já existe:', statement.substring(0, 40) + '...');
        } else {
          throw err;
        }
      }
    }

    console.log('✅ Migração concluída!');
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
