# 📱 Telegram Notifier - Configuração

## Como Configurar Notificações no Telegram (100% GRATUITO)

### Passo 1: Criar Bot no Telegram

1. Abra Telegram (app ou web)
2. Procure por **@BotFather** (é o bot oficial do Telegram)
3. Abra a conversa e clique **Start**
4. Digite `/newbot`
5. Escolha um nome para seu bot (ex: `Gustavo30RSVPBot`)
6. Escolha um username único (ex: `gustavo30rsvp_bot`)
7. **Copie o Token** que aparece (algo como `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`)

✅ **Seu Bot Token está pronto!**

---

### Passo 2: Encontrar seu Chat ID

1. No Telegram, procure por **@userinfobot**
2. Abra a conversa e clique **Start**
3. O bot mostrará seu **ID** (um número, ex: `123456789`)

✅ **Seu Chat ID está pronto!**

**OU alternativamente:**

1. Abra seu bot (o que você criou no Passo 1)
2. Digite `/start` (qualquer mensagem funciona)
3. Acesse este URL no navegador:
   ```
   https://api.telegram.org/bot[SEU_TOKEN]/getUpdates
   ```
   Substitua `[SEU_TOKEN]` pelo token do Passo 1
4. Procure por `"chat":{"id":XXXXX...}` - este é seu Chat ID

---

### Passo 3: Adicionar Bot ao Telegram (Opcional mas Recomendado)

Para não receber mensagens diretas de um estranho, crie um **grupo privado**:

1. No Telegram, clique no **+** (novo chat)
2. Selecione **Novo grupo**
3. Adicione o bot que criou (procure pelo username, ex: `@gustavo30rsvp_bot`)
4. Dê um nome ao grupo (ex: "RSVP Notificações")
5. Você receberá uma mensagem do bot no grupo
6. Copie o **Chat ID do grupo** (pode usar o método do passo 2)

---

### Passo 4: Adicionar Variáveis no Railway

No Dashboard Railway, adicione 2 variáveis:

```
TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
TELEGRAM_CHAT_ID=123456789
```

Se usar um grupo, o Chat ID será um número negativo:
```
TELEGRAM_CHAT_ID=-987654321
```

---

### Passo 5: Deploy

1. Salve as variáveis no Railway
2. Faça um novo deploy:
   ```bash
   git add -A
   git commit -m "Ativar notificações Telegram"
   git push origin main
   ```
3. Aguarde o rebuild (~2-3 min)

---

## ✅ Teste

1. Abra https://gustavo30.up.railway.app
2. Preencha a modal RSVP completamente
3. Clique em "Confirmar"
4. **Você receberá uma mensagem no Telegram instantaneamente!**

---

## 📋 Exemplo de Mensagem

```
🎉 NOVA CONFIRMAÇÃO RSVP

👤 João Silva
🎂 Idade: 30 anos
📱 Telefone: (11)987654321
✅ Vai dormir
📅 Chegada: 🎪 Sexta-feira

━━━━━━━━━━━━━━━━━━
✨ Confirmado em 28/01/2026, 14:30:45
```

---

## ✨ Vantagens do Telegram

- ✅ 100% gratuito (sem limite de mensagens)
- ✅ Notificações em tempo real
- ✅ Suporta múltiplos formatos (HTML, emojis, etc)
- ✅ Funciona em qualquer dispositivo
- ✅ Sem necessidade de cartão de crédito
- ✅ API confiável e estável

---

## ❓ Dúvidas?

- Documentação Telegram Bot: https://core.telegram.org/bots
- Procure por `@BotFather` se tiver dúvidas sobre seu bot
