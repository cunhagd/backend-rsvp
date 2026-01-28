import twilio from 'twilio';

interface GuestNotificationData {
  name: string;
  age: number;
  phone: string;
  willStay: boolean;
  arrivalDay: string | null;
}

class WhatsAppNotifier {
  private client: any;
  private fromNumber: string;
  private toNumber: string;
  private isEnabled: boolean;

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_WHATSAPP_FROM;
    const toNumber = process.env.OWNER_WHATSAPP_NUMBER;

    this.isEnabled = Boolean(accountSid && authToken && fromNumber && toNumber);
    this.fromNumber = fromNumber || '';
    this.toNumber = toNumber || '';

    if (this.isEnabled) {
      this.client = twilio(accountSid, authToken);
      console.log('✅ WhatsApp Notifier inicializado com sucesso');
    } else {
      console.log('⚠️  WhatsApp Notifier desabilitado (credenciais não configuradas)');
    }
  }

  private formatMessage(guest: GuestNotificationData): string {
    const stayInfo = guest.willStay
      ? `✅ Vai dormir\n📅 Chegada: ${this.formatArrivalDay(guest.arrivalDay)}`
      : '❌ Não vai dormir';

    return `🎉 **NOVA CONFIRMAÇÃO RSVP**

👤 **${guest.name}**
🎂 Idade: ${guest.age} anos
📱 Telefone: ${guest.phone}
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
    if (!this.isEnabled) {
      console.log('⚠️  WhatsApp Notifier desabilitado, pulando notificação');
      return false;
    }

    try {
      const message = this.formatMessage(guest);

      console.log('📤 Enviando notificação WhatsApp...');
      console.log('Para:', this.toNumber);
      console.log('Mensagem:', message);

      const result = await this.client.messages.create({
        from: this.fromNumber,
        to: this.toNumber,
        body: message,
      });

      console.log('✅ WhatsApp enviado com sucesso! SID:', result.sid);
      return true;
    } catch (error: any) {
      console.error('❌ Erro ao enviar WhatsApp:', {
        message: error.message,
        code: error.code,
        stack: error.stack,
      });
      
      // Não falhar o fluxo de confirmação se WhatsApp falhar
      return false;
    }
  }
}

export default new WhatsAppNotifier();
