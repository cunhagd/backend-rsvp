import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

interface AIResponse {
  success: boolean;
  text?: string;
  error?: string;
}

class AIService {
  private client: BedrockRuntimeClient | null = null;
  private modelId: string;
  private isEnabled: boolean;

  constructor() {
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    const region = process.env.AWS_REGION || 'us-east-1';
    this.modelId = process.env.MODEL_ID || 'amazon.nova-pro-v1:0';

    this.isEnabled = Boolean(accessKeyId && secretAccessKey);

    if (this.isEnabled) {
      try {
        this.client = new BedrockRuntimeClient({
          region,
          credentials: {
            accessKeyId: accessKeyId as string,
            secretAccessKey: secretAccessKey as string,
          },
        });
        console.log('✅ AWS Bedrock AI Service inicializado com sucesso');
      } catch (error) {
        console.error('❌ Erro ao inicializar Bedrock:', error);
        this.isEnabled = false;
        this.client = null;
      }
    } else {
      console.log('⚠️  AWS Bedrock desabilitado (credenciais não configuradas)');
    }
  }

  async analyzeNameForMatching(confirmedName: string, expectedNames: string[]): Promise<{
    bestMatch: string | null;
    confidence: number;
    explanation: string;
  }> {
    if (!this.isEnabled || !this.client) {
      console.log('⚠️  AI Service desabilitado');
      return {
        bestMatch: null,
        confidence: 0,
        explanation: 'AI Service não está configurado',
      };
    }

    try {
      console.log('🤖 Analisando nome com IA:', confirmedName);

      const prompt = `Você é um sistema de matching de nomes para um RSVP.

Dado o nome confirmado: "${confirmedName}"
E a lista de nomes esperados: ${JSON.stringify(expectedNames)}

Analise e retorne APENAS em JSON (sem markdown):
{
  "bestMatch": "nome exato da lista que melhor corresponde ao nome confirmado",
  "confidence": número entre 0 e 1 representando a confiança do match,
  "explanation": "breve explicação do matching"
}

Considere:
- Variações do mesmo nome (João vs Jo)
- Ordem de nomes (Maria Silva vs Silva Maria)
- Apelidos comuns
- Diminutivos

Se nenhum match for adequado, coloque bestMatch como null.`;

      const input = {
        modelId: this.modelId,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: 500,
        }),
      };

      const command = new InvokeModelCommand(input);
      const response = await this.client.send(command);

      const responseBody = JSON.parse(
        new TextDecoder().decode(response.body)
      );

      console.log('📊 Resposta Bedrock:', responseBody);

      // Extrair o texto da resposta
      const textContent = responseBody.content?.[0]?.text || responseBody.output?.[0]?.text || '';

      // Tentar fazer parse do JSON
      const jsonMatch = textContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        console.log('✅ Análise IA concluída:', result);
        return result;
      }

      console.log('⚠️  Não conseguiu fazer parse do JSON');
      return {
        bestMatch: null,
        confidence: 0,
        explanation: 'Erro ao processar resposta da IA',
      };
    } catch (error: any) {
      console.error('❌ Erro ao chamar Bedrock:', {
        message: error.message,
        code: error.code,
      });

      return {
        bestMatch: null,
        confidence: 0,
        explanation: `Erro: ${error.message}`,
      };
    }
  }

  async generateInsights(stats: {
    total_expected: number;
    total_confirmed: number;
    guests_staying: number;
    guests_day_use: number;
  }): Promise<string> {
    if (!this.isEnabled || !this.client) {
      return 'AI Service não está configurado';
    }

    try {
      console.log('🤖 Gerando insights com IA');

      const confirmationRate = Math.round(
        (stats.total_confirmed / stats.total_expected) * 100
      );

      const prompt = `Você é um assistente para um RSVP de festa.

Dados da festa:
- Convidados esperados: ${stats.total_expected}
- Confirmações: ${stats.total_confirmed} (${confirmationRate}%)
- Vão dormir: ${stats.guests_staying}
- Day use: ${stats.guests_day_use}

Gere um insight breve e motivador sobre como está o RSVP (máximo 2 linhas).
Seja positivo e entusiasmado!`;

      const input = {
        modelId: this.modelId,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: 300,
        }),
      };

      const command = new InvokeModelCommand(input);
      const response = await this.client.send(command);

      const responseBody = JSON.parse(
        new TextDecoder().decode(response.body)
      );

      const insight = responseBody.content?.[0]?.text || responseBody.output?.[0]?.text || '';
      console.log('✅ Insights gerados:', insight);
      return insight;
    } catch (error: any) {
      console.error('❌ Erro ao gerar insights:', error.message);
      return 'Erro ao gerar insights';
    }
  }
}

export default new AIService();
