export const MenuBar = () => {
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const day = now.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });

  return (
    <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-2 text-xs text-muted-foreground">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-primary shadow-xs" aria-hidden="true" />
          <span className="text-[11px] font-semibold tracking-wide text-foreground">Mac Theme Studio</span>
        </div>
        <ul className="hidden gap-3 md:flex">
          <li className="cursor-default text-[11px] text-muted-foreground/90">Portfolio</li>
          <li className="cursor-default text-[11px] text-muted-foreground/90">Builder</li>
          <li className="cursor-default text-[11px] text-muted-foreground/90">Themes</li>
        </ul>
      </div>
      <div className="flex items-center gap-3 text-[11px]">
        <span className="hidden md:inline text-muted-foreground/80">{day}</span>
        <span className="font-medium text-foreground/90">{time}</span>
      </div>
    </nav>
  );
};
