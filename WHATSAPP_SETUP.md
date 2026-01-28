# 📱 WhatsApp Notifier - Configuração

## Como Configurar Notificações no WhatsApp

### Passo 1: Criar Conta Twilio

1. Acesse [https://www.twilio.com](https://www.twilio.com)
2. Clique em "Sign Up"
3. Preencha os dados e crie sua conta (teste gratuito com R$20)
4. Confirme seu email

### Passo 2: Ativar WhatsApp Sandbox

1. Após login, vá para **Console** → **Explore Products** → **Messaging**
2. Clique em **Try WhatsApp**
3. Em **Sandbox Settings**, você verá:
   - **From Number**: Algo como `whatsapp:+1234567890` (número Twilio)
   - Instruções para "Juntar-se ao Sandbox"

### Passo 3: Juntar-se ao Sandbox

1. Abra WhatsApp no seu celular
2. Envie a mensagem exatamente como instruído para o número Twilio
3. Você receberá uma confirmação de que está no sandbox

### Passo 4: Obter Credenciais

1. No Console Twilio, vá para **Account** → **API keys & tokens**
2. Copie:
   - **Account SID** (ex: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
   - **Auth Token** (ex: `yourauthtokenhere`)

3. Em **Messaging** → **Services** → **Sandbox Settings**, copie:
   - **From Number** (ex: `whatsapp:+1234567890`)

4. O seu número WhatsApp pessoal (para receber as notificações):
   - Formato: `whatsapp:+55XX9XXXXXXXX` (incluir país/DDD)
   - Exemplo: `whatsapp:+5511987654321`

### Passo 5: Configurar Variáveis de Ambiente

Adicione ao seu arquivo `.env.production` (no Railway):

```env
# Twilio Credentials for WhatsApp Notifications
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=yourauthtokenhere
TWILIO_WHATSAPP_FROM=whatsapp:+1234567890
OWNER_WHATSAPP_NUMBER=whatsapp:+5511987654321
```

### Passo 6: Deploy no Railway

1. Adicione as 4 variáveis de ambiente no Dashboard Railway
2. Faça um novo deploy (git push)
3. Aguarde rebuild

### Teste

Envie uma confirmação de presença na modal. Se tudo estiver configurado corretamente, você receberá uma mensagem:

```
🎉 **NOVA CONFIRMAÇÃO RSVP**

👤 **João Silva**
🎂 Idade: 30 anos
📱 Telefone: (11)987654321
✅ Vai dormir
📅 Chegada: 🎪 Sexta-feira

━━━━━━━━━━━━━━━━━━
✨ Confirmado em 28/01/2026, 14:30:45
```

## ⚠️ Limites do Sandbox

- Sandbox é **grátis** e ideal para teste
- Pode receber mensagens de até **100 números únicos** no primeiro mês
- Número Twilio é `+1` (US-based)
- Para produção ilimitada, upgrade para conta paga

## Dúvidas?

- Documentação Twilio: [https://www.twilio.com/docs/whatsapp](https://www.twilio.com/docs/whatsapp)
- Suporte: [https://www.twilio.com/help](https://www.twilio.com/help)
