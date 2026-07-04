import { cn } from "@/lib/utils";

export const SectionHeader = ({
  eyebrow,
  title,
  subtitle,
  className,
}: {
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: string;
  className?: string;
}) => (
  <div className={cn("mx-auto max-w-2xl text-center", className)}>
    <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/40 px-3 py-1 text-xs font-mono uppercase tracking-wider text-primary">
      <span className="h-1 w-1 rounded-full bg-primary" /> {eyebrow}
    </div>
    <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">{title}</h2>
    {subtitle && <p className="mt-4 text-muted-foreground">{subtitle}</p>}
  </div>
);
