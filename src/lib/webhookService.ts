const WEBHOOK_URL = 'https://webhook.anamneseia.com/webhook/c27321e5-96d8-4ce0-a521-16de0511e4ac';

export interface WebhookPayload {
  session_id: string;
  audio_data_base64: string;
  chunk_index: number;
  is_final: boolean;
}

export interface AnamneseResponse {
  transcricao?: string;
  anamnese?: {
    identificacao?: string;
    queixa_principal?: string;
    historia_doenca_atual?: string;
    interrogatorio_sistematico?: string;
    antecedentes_pessoais?: {
      patologicos?: string;
      cirurgicos?: string;
      medicamentos?: string;
    };
    antecedentes_familiares?: string;
    habitos_vida?: string;
  };
  raciocinio_clinico?: {
    hipoteses_diagnosticas?: string[];
    conduta_sugerida?: string;
  };
  error?: string;
}

export async function sendAudioChunk(payload: WebhookPayload): Promise<AnamneseResponse | null> {
  try {
    console.log(`Sending chunk ${payload.chunk_index} to webhook...`, {
      session_id: payload.session_id,
      is_final: payload.is_final,
      audio_size: payload.audio_data_base64.length,
    });

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error('Webhook response not OK:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    console.log('Webhook response:', data);
    return data as AnamneseResponse;
  } catch (error) {
    console.error('Error sending chunk to webhook:', error);
    return null;
  }
}

export async function sendFinalSignal(sessionId: string): Promise<AnamneseResponse | null> {
  try {
    console.log('Sending final signal for session:', sessionId);

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session_id: sessionId,
        audio_data_base64: '',
        chunk_index: -1,
        is_final: true,
      }),
    });

    if (!response.ok) {
      console.error('Final signal response not OK:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    console.log('Final response:', data);
    return data as AnamneseResponse;
  } catch (error) {
    console.error('Error sending final signal:', error);
    return null;
  }
}
