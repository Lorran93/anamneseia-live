import { FileText } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TranscriptionAreaProps {
  transcription: string;
  isRecording: boolean;
}

export function TranscriptionArea({ transcription, isRecording }: TranscriptionAreaProps) {
  return (
    <div className="medical-card animate-fade-in">
      <div className="section-title">
        <FileText className="w-5 h-5 text-primary" />
        <span>Transcrição em Tempo Real</span>
        {isRecording && (
          <span className="ml-2 px-2 py-0.5 text-xs bg-success/10 text-success rounded-full">
            Ao vivo
          </span>
        )}
      </div>
      
      <ScrollArea className="h-64 rounded-lg border border-border bg-muted/30 p-4">
        {transcription ? (
          <p className="text-foreground leading-relaxed whitespace-pre-wrap">
            {transcription}
            {isRecording && (
              <span className="inline-block w-2 h-4 ml-1 bg-primary animate-pulse" />
            )}
          </p>
        ) : (
          <p className="text-muted-foreground italic">
            {isRecording
              ? "Aguardando transcrição..."
              : "A transcrição aparecerá aqui durante a consulta."}
          </p>
        )}
      </ScrollArea>
    </div>
  );
}
