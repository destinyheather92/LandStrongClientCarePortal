import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

export function DemoBanner({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-xl border border-blue/20 bg-mist/70 px-4 py-3 text-xs text-navy/70",
        className
      )}
    >
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue" />
      <p>{children}</p>
    </div>
  );
}
