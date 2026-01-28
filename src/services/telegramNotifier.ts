import TelegramBot from 'node-telegram-bot-api';

interface GuestNotificationData {
  name: string;
  age: number;
  phone: string;
  willStay: boolean;
  arrivalDay: string | null;
}

class TelegramNotifier {
  private bot: TelegramBot | null = null;
  private chatId: string;
  private isEnabled: boolean;

  constructor() {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    this.chatId = chatId || '';
    this.isEnabled = Boolean(botToken && chatId);

    if (this.isEnabled) {
      try {
        this.bot = new TelegramBot(botToken!);
        console.log('✅ Telegram Notifier inicializado com sucesso');
      } catch (error) {
        console.error('❌ Erro ao inicializar Telegram Bot:', error);
        this.isEnabled = false;
      }
    } else {
      console.log('⚠️  Telegram Notifier desabilitado (credenciais não configuradas)');
    }
  }

  private formatMessage(guest: GuestNotificationData): string {
    const stayInfo = guest.willStay
      ? `✅ Vai dormir\n📅 Chegada: ${this.formatArrivalDay(guest.arrivalDay)}`
      : '❌ Não vai dormir';

    return `🎉 <b>NOVA CONFIRMAÇÃO RSVP</b>

👤 <b>${guest.name}</b>
🎂 Idade: ${guest.age} anos
📱 Telefone: <code>${guest.phone}</code>
${stayInfo}

━━━━━━━━━━━━━━━━━━
✨ Confirmado em ${new Date().toLocaleString('pt-BR')}`;
  }

  private formatArrivalDay(day: string | null): string {
    if (!day) return 'N/A';
    
    const days: { [key: string]: string } = {
      'friday': '🎪 Sexta-feira',
      'saturday': '🎊 Sábado',
    };

    return days[day] || day;
  }

  async notifyNewGuest(guest: GuestNotificationData): Promise<boolean> {
    if (!this.isEnabled || !this.bot) {
      console.log('⚠️  Telegram Notifier desabilitado, pulando notificação');
      return false;
    }

    try {
      const message = this.formatMessage(guest);

      console.log('📤 Enviando notificação Telegram...');
      console.log('Chat ID:', this.chatId);

      await this.bot.sendMessage(this.chatId, message, {
        parse_mode: 'HTML',
      });

      console.log('✅ Telegram enviado com sucesso!');
      return true;
    } catch (error: any) {
      console.error('❌ Erro ao enviar Telegram:', {
        message: error.message,
        code: error.code,
      });
      
      // Não falhar o fluxo de confirmação se Telegram falhar
      return false;
    }
  }
}

export default new TelegramNotifier();
