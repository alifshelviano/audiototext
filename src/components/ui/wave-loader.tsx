
"use client";
import { cn } from "@/lib/utils/utils";

interface WaveLoaderProps {
  className?: string;
  barClassName?: string;
  text?: string;
}

export function WaveLoader({ className, barClassName, text }: WaveLoaderProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-4", className)}>
      <div className="flex items-center justify-center space-x-1.5">
        <div className={cn("w-2 h-8 bg-cyan-800 rounded-full animate-wave animation-delay-100", barClassName)}></div>
        <div className={cn("w-2 h-8 bg-cyan-800 rounded-full animate-wave animation-delay-200", barClassName)}></div>
        <div className={cn("w-2 h-8 bg-cyan-800 rounded-full animate-wave animation-delay-400", barClassName)}></div>
      </div>
      {text && <p className="text-gray-600 font-medium">{text}</p>}
    </div>
  );
}
