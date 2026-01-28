import pool from '../database';
import dotenv from 'dotenv';

dotenv.config();

const fixSchemaSQL = `
-- Adicionar coluna 'phone' se não existir
ALTER TABLE guests 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- Adicionar coluna 'has_children' se não existir  
ALTER TABLE guests 
ADD COLUMN IF NOT EXISTS has_children BOOLEAN DEFAULT FALSE;

-- Adicionar coluna 'will_stay' se não existir
ALTER TABLE guests 
ADD COLUMN IF NOT EXISTS will_stay BOOLEAN DEFAULT FALSE;

-- Adicionar coluna 'arrival_day' se não existir
ALTER TABLE guests 
ADD COLUMN IF NOT EXISTS arrival_day VARCHAR(50);

-- Adicionar coluna 'confirmed_at' se não existir
ALTER TABLE guests 
ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Adicionar coluna 'updated_at' se não existir
ALTER TABLE guests 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Garantir que 'name' tem UNIQUE constraint
ALTER TABLE guests 
DROP CONSTRAINT IF EXISTS guests_name_key,
ADD CONSTRAINT guests_name_key UNIQUE (name);

-- Reconstruir índices se necessário
CREATE INDEX IF NOT EXISTS idx_guests_name ON guests(name);
CREATE INDEX IF NOT EXISTS idx_guests_confirmed_at ON guests(confirmed_at);
`;

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Iniciando verificação e correção do schema...');
    
    // Primeiro, verificar se a tabela existe
    const tableCheckQuery = `
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'guests'
      );
    `;
    
    const tableResult = await client.query(tableCheckQuery);
    
    if (!tableResult.rows[0].exists) {
      console.log('⚠️  Tabela "guests" não existe, criando...');
      
      const createTableSQL = `
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
      `;
      
      await client.query(createTableSQL);
      console.log('✅ Tabela "guests" criada com sucesso');
    } else {
      console.log('✅ Tabela "guests" existe, verificando colunas...');
      
      // Executar alterações
      const statements = fixSchemaSQL
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
    }

    // Verificar schema final
    const schemaCheck = `
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'guests'
      ORDER BY ordinal_position;
    `;
    
    const schemaResult = await client.query(schemaCheck);
    console.log('\n📋 Schema final da tabela guests:');
    console.table(schemaResult.rows);

    console.log('\n✅ Migração de schema concluída com sucesso!');
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
