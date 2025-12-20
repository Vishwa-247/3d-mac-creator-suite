import { Sparkles, Mail, Github, Figma, Palette, TerminalSquare } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const dockItems = [
  { id: "about", label: "About", icon: Sparkles },
  { id: "projects", label: "Projects", icon: TerminalSquare },
  { id: "design", label: "Design", icon: Figma },
  { id: "style", label: "Theme Lab", icon: Palette },
  { id: "github", label: "GitHub", icon: Github, href: "#" },
  { id: "contact", label: "Contact", icon: Mail },
];

export const Dock = () => {
  return (
    <TooltipProvider>
      <nav
        aria-label="Desktop dock"
        className="mx-auto flex items-end justify-center gap-3 rounded-3xl border border-border/80 bg-background/80 px-4 py-2 shadow-2xl backdrop-blur-xl w-max animate-enter"
      >
        {dockItems.map((item) => {
          const Icon = item.icon;
          const isExternal = Boolean(item.href && item.href !== "#" && item.href.startsWith("http"));

          const content = (
            <button
              type="button"
              className="group relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-card/90 to-[hsl(215_24%_26%/0.9)] shadow-lg hover:shadow-xl border border-border/70 hover:-translate-y-1 hover:scale-[1.05] transition-transform duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Icon className="h-6 w-6 text-primary-foreground drop-shadow-sm" aria-hidden="true" />
              <span className="sr-only">{item.label}</span>
              <span className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-foreground/90 px-2 py-0.5 text-[11px] font-medium text-background opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100">
                {item.label}
              </span>
            </button>
          );

          if (item.href) {
            return (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <a href={item.href} target={isExternal ? "_blank" : undefined} rel={isExternal ? "noreferrer" : undefined}>
                    {content}
                  </a>
                </TooltipTrigger>
                <TooltipContent side="top">{item.label}</TooltipContent>
              </Tooltip>
            );
          }

          return (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>{content}</TooltipTrigger>
              <TooltipContent side="top">{item.label}</TooltipContent>
            </Tooltip>
          );
        })}
      </nav>
    </TooltipProvider>
  );
};
