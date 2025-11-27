import { useState, useRef, useCallback } from "react";
import { Mic, MicOff, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SoundWaveIndicator } from "@/components/SoundWaveIndicator";
import { RecordingTimer } from "@/components/RecordingTimer";
import { TranscriptionArea } from "@/components/TranscriptionArea";
import { AnamneseForm } from "@/components/AnamneseForm";
import {
  AudioRecorder,
  generateSessionId,
  AudioChunk,
} from "@/lib/audioRecorder";
import {
  sendAudioChunk,
  sendFinalSignal,
  AnamneseResponse,
} from "@/lib/webhookService";
import { toast } from "@/hooks/use-toast";

type ConsultationState = "idle" | "recording" | "processing" | "completed";

export function ConsultationRecorder() {
  const [state, setState] = useState<ConsultationState>("idle");
  const [transcription, setTranscription] = useState("");
  const [anamneseData, setAnamneseData] = useState<AnamneseResponse | null>(null);
  const [chunksSent, setChunksSent] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const recorderRef = useRef<AudioRecorder | null>(null);
  const sessionIdRef = useRef<string>("");

  const handleChunkReady = useCallback(async (chunk: AudioChunk) => {
    console.log(`Chunk ${chunk.index} ready, size: ${chunk.base64.length}`);
    setChunksSent(chunk.index);

    const response = await sendAudioChunk({
      session_id: sessionIdRef.current,
      audio_data_base64: chunk.base64,
      chunk_index: chunk.index,
      is_final: false,
    });

    if (response?.transcricao) {
      setTranscription((prev) => prev + " " + response.transcricao);
    }

    if (response?.anamnese || response?.raciocinio_clinico) {
      setAnamneseData((prev) => ({
        ...prev,
        ...response,
      }));
    }
  }, []);

  const startRecording = async () => {
    try {
      setError(null);
      sessionIdRef.current = generateSessionId();
      console.log("Starting session:", sessionIdRef.current);

      recorderRef.current = new AudioRecorder(handleChunkReady);
      await recorderRef.current.start();

      setState("recording");
      setTranscription("");
      setAnamneseData(null);
      setChunksSent(0);

      toast({
        title: "Consulta iniciada",
        description: "O áudio está sendo capturado e enviado automaticamente.",
      });
    } catch (err) {
      console.error("Error starting recording:", err);
      setError(
        "Não foi possível acessar o microfone. Verifique as permissões do navegador."
      );
      toast({
        title: "Erro ao iniciar",
        description: "Verifique se o microfone está disponível.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = async () => {
    if (recorderRef.current) {
      recorderRef.current.stop();
      recorderRef.current = null;
    }

    setState("processing");

    toast({
      title: "Processando...",
      description: "Finalizando análise da consulta.",
    });

    const finalResponse = await sendFinalSignal(sessionIdRef.current);

    if (finalResponse) {
      if (finalResponse.transcricao) {
        setTranscription((prev) => prev + " " + finalResponse.transcricao);
      }
      setAnamneseData((prev) => ({
        ...prev,
        ...finalResponse,
      }));
    }

    setState("completed");

    toast({
      title: "Consulta finalizada",
      description: "O prontuário estruturado está pronto para revisão.",
    });
  };

  const startNewConsultation = () => {
    setState("idle");
    setTranscription("");
    setAnamneseData(null);
    setChunksSent(0);
    setError(null);
  };

  const isRecording = state === "recording";
  const isProcessing = state === "processing";
  const isCompleted = state === "completed";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border shadow-medical">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Mic className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">AnamneseIA</h1>
                <p className="text-sm text-muted-foreground">
                  Assistente de Consulta Médica
                </p>
              </div>
            </div>

            {isRecording && (
              <div className="flex items-center gap-4">
                <div className="px-3 py-1.5 bg-success/10 text-success rounded-full text-sm font-medium flex items-center gap-2">
                  <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
                  Gravando
                </div>
                <span className="text-sm text-muted-foreground">
                  {chunksSent} chunk{chunksSent !== 1 ? "s" : ""} enviado
                  {chunksSent !== 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 pb-32">
        {/* Estado de Erro */}
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-3 animate-fade-in">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <p className="text-destructive">{error}</p>
          </div>
        )}

        {/* Estado Idle ou Recording */}
        {(state === "idle" || state === "recording") && (
          <div className="space-y-8">
            {/* Controles Principais */}
            <div className="medical-card text-center py-12">
              <div className="max-w-md mx-auto space-y-8">
                {isRecording && (
                  <>
                    <SoundWaveIndicator isActive={true} className="mb-4" />
                    <RecordingTimer isRunning={true} />
                  </>
                )}

                <Button
                  onClick={isRecording ? stopRecording : startRecording}
                  variant={isRecording ? "stop" : "default"}
                  size="xl"
                  className="w-full max-w-sm mx-auto h-20 text-xl"
                >
                  {isRecording ? (
                    <>
                      <MicOff className="w-7 h-7" />
                      PARAR E FINALIZAR CONSULTA
                    </>
                  ) : (
                    <>
                      <Mic className="w-7 h-7" />
                      INICIAR CONSULTA
                    </>
                  )}
                </Button>

                {!isRecording && (
                  <p className="text-muted-foreground text-sm">
                    Clique para iniciar a gravação da consulta. O áudio será
                    enviado automaticamente em intervalos de 5 segundos.
                  </p>
                )}
              </div>
            </div>

            {/* Área de Transcrição */}
            <TranscriptionArea
              transcription={transcription}
              isRecording={isRecording}
            />
          </div>
        )}

        {/* Estado Processando */}
        {isProcessing && (
          <div className="medical-card text-center py-16 animate-fade-in">
            <div className="max-w-md mx-auto space-y-6">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">
                Processando Consulta
              </h2>
              <p className="text-muted-foreground">
                Aguarde enquanto a IA analisa o áudio e gera o prontuário
                estruturado...
              </p>
            </div>
          </div>
        )}

        {/* Estado Completado - Formulário de Anamnese */}
        {isCompleted && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">
                Prontuário Estruturado
              </h2>
              <Button onClick={startNewConsultation} variant="outline">
                Nova Consulta
              </Button>
            </div>

            {/* Transcrição Final */}
            {transcription && (
              <TranscriptionArea
                transcription={transcription}
                isRecording={false}
              />
            )}

            {/* Formulário de Anamnese */}
            <AnamneseForm data={anamneseData} />
          </div>
        )}
      </main>
    </div>
  );
}
