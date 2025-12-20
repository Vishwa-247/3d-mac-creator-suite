import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MacWindowProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export const MacWindow = ({ title, children, className }: MacWindowProps) => {
  return (
    <section
      aria-label={title}
      className={cn(
        "relative rounded-3xl border border-border/80 bg-gradient-to-br from-card/95 via-card/90 to-[hsl(215_20%_65%/0.12)] shadow-2xl backdrop-blur-xl overflow-hidden animate-scale-in",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-border/70 bg-[linear-gradient(135deg,hsl(215_24%_26%/0.92),hsl(215_19%_34%/0.98))] px-4 py-2.5 text-xs text-muted-foreground/90">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[hsl(0_84%_60%)] shadow-xs" aria-hidden="true" />
          <span className="h-3 w-3 rounded-full bg-[hsl(45_97%_51%)] shadow-xs" aria-hidden="true" />
          <span className="h-3 w-3 rounded-full bg-[hsl(120_57%_40%)] shadow-xs" aria-hidden="true" />
        </div>
        <div className="flex-1 truncate px-3 text-center text-[11px] font-medium text-[hsl(210_40%_98%/0.85)]">
          {title}
        </div>
        <div className="w-12" aria-hidden="true" />
      </div>
      <div className="p-5 md:p-7 lg:p-8">
        {children}
      </div>
    </section>
  );
};
