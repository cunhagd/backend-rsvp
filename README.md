# RSVP Backend - Gustavo's 30th Birthday

Backend Express.js para gerenciar confirmações de presença do aniversário de 30 anos do Gustavo.

## Funcionalidades

- ✅ Confirmação de presença com validação
- ✅ Gerenciamento de crianças
- ✅ Controle de hospedagem e data de chegada
- ✅ API RESTful completa
- ✅ CORS configurado para frontend
- ✅ PostgreSQL para persistência de dados
- ✅ Script de migração automática

## Instalação

```bash
npm install
```

## Configuração

1. Copie o arquivo `.env.example` para `.env`:
```bash
cp .env.example .env
```

2. Atualize a variável de ambiente com sua conexão PostgreSQL:
```
PORT=3001
DATABASE_URL=postgresql://usuario:senha@host:porta/banco
NODE_ENV=development
CORS_ORIGIN=http://localhost:8080
```

## Executar

### 1. Criar tabelas (primeira vez)
```bash
npx ts-node src/migrations/001_create_tables.ts
```

### 2. Iniciar servidor (desenvolvimento)
```bash
npm run dev
```

### 3. Modo produção
```bash
npm run build
npm start
```

## API Endpoints

### POST `/api/guests`
Criar nova confirmação de presença

**Body:**
```json
{
  "name": "João Silva",
  "age": 35,
  "hasChildren": true,
  "children": [
    {
      "name": "Maria Silva",
      "age": 8,
      "willStay": true,
      "arrivalDay": "friday"
    }
  ],
  "willStay": true,
  "arrivalDay": "friday"
}
```

### GET `/api/guests`
Listar todas as confirmações com estatísticas

### GET `/api/guests/:id`
Obter detalhes de um convidado

### PUT `/api/guests/:id`
Atualizar confirmação de presença

### DELETE `/api/guests/:id`
Remover confirmação de presença

## Estrutura do Projeto

```
src/
├── database.ts        # Configuração PostgreSQL
├── migrations/        # Scripts de migração
├── models/            # (Não usados, substituídos por queries SQL)
├── routes/            # Definição de rotas
├── schemas/           # Validações com Joi
└── index.ts           # Entrada da aplicação
```

## Variáveis de Ambiente

- `PORT` - Porta do servidor (padrão: 3001)
- `DATABASE_URL` - URL de conexão com PostgreSQL
- `NODE_ENV` - Ambiente (development/production)
- `CORS_ORIGIN` - URL do frontend para CORS

## Banco de Dados

### Tabelas criadas:

**guests**
- id (SERIAL PRIMARY KEY)
- name (VARCHAR UNIQUE)
- age (INTEGER)
- has_children (BOOLEAN)
- will_stay (BOOLEAN)
- arrival_day (VARCHAR)
- confirmed_at (TIMESTAMP)
- updated_at (TIMESTAMP)

**children**
- id (SERIAL PRIMARY KEY)
- guest_id (INTEGER FOREIGN KEY)
- name (VARCHAR)
- age (INTEGER)
- will_stay (BOOLEAN)
- arrival_day (VARCHAR)
- created_at (TIMESTAMP)

### View criada:
**guest_stats** - Estatísticas gerais dos convidados

## Tecnologias

- Express.js
- TypeScript
- PostgreSQL + pg
- Joi (validação)
- CORS
