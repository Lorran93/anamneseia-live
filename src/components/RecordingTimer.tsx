import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface RecordingTimerProps {
  isRunning: boolean;
  onTimeUpdate?: (seconds: number) => void;
}

export function RecordingTimer({ isRunning, onTimeUpdate }: RecordingTimerProps) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => {
          const newValue = prev + 1;
          onTimeUpdate?.(newValue);
          return newValue;
        });
      }, 1000);
    } else {
      setSeconds(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, onTimeUpdate]);

  const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center gap-2 text-2xl font-mono text-foreground">
      <Clock className="w-6 h-6 text-muted-foreground" />
      <span>{formatTime(seconds)}</span>
    </div>
  );
}
