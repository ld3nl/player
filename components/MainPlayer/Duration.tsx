import { cn } from "cnfast";
import type { DurationProps } from "@/lib/types";

// Arithmetic avoids wrapping long talks back to zero after an hour.
export const Duration = ({ className, seconds }: DurationProps) => {
  const total = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor(total / 60) % 60;
  const remaining = total % 60;
  const formatted = [
    hours || null,
    String(minutes).padStart(2, "0"),
    String(remaining).padStart(2, "0"),
  ]
    .filter((value) => value !== null)
    .join(":");
  return (
    <time dateTime={`PT${total}S`} className={cn(className)}>
      {formatted}
    </time>
  );
};
