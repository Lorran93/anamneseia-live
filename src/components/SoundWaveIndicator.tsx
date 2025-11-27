import { cn } from "@/lib/utils";

interface SoundWaveIndicatorProps {
  isActive: boolean;
  className?: string;
}

export function SoundWaveIndicator({ isActive, className }: SoundWaveIndicatorProps) {
  return (
    <div className={cn("flex items-center justify-center gap-1 h-12", className)}>
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={cn(
            "w-1.5 rounded-full bg-success transition-all duration-200",
            isActive ? "sound-wave" : "h-2"
          )}
          style={{
            height: isActive ? `${Math.random() * 24 + 16}px` : "8px",
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
}
