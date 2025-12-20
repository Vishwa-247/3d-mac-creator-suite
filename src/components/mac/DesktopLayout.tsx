import { ReactNode } from "react";
import { Dock } from "./Dock";
import { MenuBar } from "./MenuBar";

interface DesktopLayoutProps {
  children: ReactNode;
}

export const DesktopLayout = ({ children }: DesktopLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-[hsl(210_40%_96%)] to-[hsl(199_95%_73%/0.25)] text-foreground flex flex-col">
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-background/70 border-b border-border/80">
        <MenuBar />
      </header>
      <main className="relative flex-1 flex items-center justify-center px-4 py-10 md:px-8">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_0%_0%,hsl(198_93%_59%/0.18),transparent_60%),radial-gradient(circle_at_100%_100%,hsl(211_96%_78%/0.18),transparent_60%)]" />
        <div className="relative z-10 w-full max-w-6xl flex flex-col gap-6 md:gap-8">
          {children}
        </div>
      </main>
      <footer className="relative z-10 pb-6">
        <Dock />
      </footer>
    </div>
  );
};
