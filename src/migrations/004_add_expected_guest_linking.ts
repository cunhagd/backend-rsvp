import pool from '../database';
import dotenv from 'dotenv';

dotenv.config();

const addExpectedGuestIdSQL = `
-- Adicionar coluna expected_guest_id à tabela guests
ALTER TABLE guests ADD COLUMN IF NOT EXISTS expected_guest_id INTEGER REFERENCES expected_guests(id) ON DELETE SET NULL;

-- Criar índice para busca rápida
CREATE INDEX IF NOT EXISTS idx_guests_expected_guest_id ON guests(expected_guest_id);
`;

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Adicionando coluna expected_guest_id...');
    
    const statements = addExpectedGuestIdSQL
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
