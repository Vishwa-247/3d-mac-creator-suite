import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DesktopLayout } from "@/components/mac/DesktopLayout";
import { MacWindow } from "@/components/mac/MacWindow";
import { Sparkles, ArrowRight, Layers3, Monitor, PaintBucket } from "lucide-react";

const Index = () => {
  return (
    <DesktopLayout>
      <MacWindow title="Portfolio — 3D Mac Theme Builder" className="max-w-5xl mx-auto">
        <div className="grid gap-8 lg:grid-cols-[1.25fr_minmax(0,1fr)] items-start">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              <span>3D macOS-inspired portfolio workspace</span>
            </div>
            <header className="space-y-3">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight leading-tight">
                Design your own
                <span className="bg-gradient-to-r from-primary to-[hsl(211_96%_78%)] bg-clip-text text-transparent"> Mac-style portfolio</span>
              </h1>
              <p className="text-sm md:text-base text-muted-foreground max-w-xl">
                A playful, 3D macOS desktop where your work lives in windows, your skills sit in the dock, and your story feels like a custom theme.
              </p>
            </header>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="lg" className="group">
                Start theme session
                <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </Button>
              <Button variant="outline" size="lg">
                View projects
              </Button>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[hsl(120_57%_40%)]" />
                  Live-like preview windows
                </span>
                <span className="hidden md:inline text-muted-foreground/60">•</span>
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[hsl(45_97%_51%)]" />
                  Dock-style navigation
                </span>
              </div>
            </div>
            <section className="grid gap-3 sm:grid-cols-3" aria-label="Highlights">
              <article className="rounded-2xl border border-border/80 bg-background/70 p-3 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-1.5">
                  <Monitor className="h-4 w-4 text-primary" aria-hidden="true" />
                  <h2 className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">3D windows</h2>
                </div>
                <p className="text-xs text-muted-foreground/90">
                  Layered glass panels, soft shadows and subtle tilt bring your portfolio to life.
                </p>
              </article>
              <article className="rounded-2xl border border-border/80 bg-background/70 p-3 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-1.5">
                  <Layers3 className="h-4 w-4 text-primary" aria-hidden="true" />
                  <h2 className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">Layout presets</h2>
                </div>
                <p className="text-xs text-muted-foreground/90">
                  Arrange sections like apps on a desktop: hero, work, lab, and contact.
                </p>
              </article>
              <article className="rounded-2xl border border-border/80 bg-background/70 p-3 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-1.5">
                  <PaintBucket className="h-4 w-4 text-primary" aria-hidden="true" />
                  <h2 className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">Theme-ready</h2>
                </div>
                <p className="text-xs text-muted-foreground/90">
                  Ready for custom icons, wallpapers, and color schemes as you iterate.
                </p>
              </article>
            </section>
          </div>

          <aside className="relative">
            <div className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-[radial-gradient(circle_at_0%_0%,hsl(198_93%_59%/0.3),transparent_55%),radial-gradient(circle_at_100%_100%,hsl(211_96%_78%/0.3),transparent_60%)] opacity-70" />
            <div className="relative space-y-4">
              <MacWindow title="Theme Preview — Desktop" className="shadow-xl border-border/90">
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between text-muted-foreground/80">
                    <span className="font-medium">Your name here</span>
                    <Badge className="rounded-full px-2 py-0.5 text-[10px]">Available for work</Badge>
                  </div>
                  <p className="text-muted-foreground/90">
                    Product designer & front-end creative crafting interfaces that feel like tiny operating systems.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-border/70 bg-background/80 p-2">
                      <p className="text-[11px] font-medium mb-1">Focus</p>
                      <p className="text-[11px] text-muted-foreground">UI design, micro-interactions, 3D-inspired layouts.</p>
                    </div>
                    <div className="rounded-xl border border-border/70 bg-background/80 p-2">
                      <p className="text-[11px] font-medium mb-1">Stack</p>
                      <p className="text-[11px] text-muted-foreground">React, motion, visual systems, theme building.</p>
                    </div>
                  </div>
                </div>
              </MacWindow>
              <MacWindow title="Project Shelf" className="shadow-xl border-dashed border-border/80">
                <div className="space-y-3 text-xs">
                  <p className="text-muted-foreground/90">
                    This area will become your live project gallery—each tile a draggable, Mac-style window with its own theme.
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    <div className="rounded-xl bg-[hsl(215_24%_26%/0.95)] text-[hsl(210_40%_98%)] p-2 shadow-md">
                      <p className="font-medium">Desktop UI</p>
                      <p className="text-[10px] opacity-80">Glassmorphism · Dock</p>
                    </div>
                    <div className="rounded-xl bg-background/90 border border-border/80 p-2">
                      <p className="font-medium text-[11px]">Theme Lab</p>
                      <p className="text-[10px] text-muted-foreground">Color systems</p>
                    </div>
                    <div className="rounded-xl bg-background/90 border border-border/80 p-2">
                      <p className="font-medium text-[11px]">Case studies</p>
                      <p className="text-[10px] text-muted-foreground">Story windows</p>
                    </div>
                  </div>
                </div>
              </MacWindow>
            </div>
          </aside>
        </div>
      </MacWindow>
    </DesktopLayout>
  );
};

export default Index;
