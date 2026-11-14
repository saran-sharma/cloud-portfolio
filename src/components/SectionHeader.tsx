import { cn } from "@/lib/utils";

export const SectionHeader = ({ eyebrow, title, subtitle, className }: {
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: string;
  className?: string;
}) => (
  <div className={cn("section-heading", className)}>
    <p className="eyebrow">{eyebrow}</p>
    <div className="section-heading-row">
      <h2>{title}</h2>
      {subtitle && <p className="section-intro">{subtitle}</p>}
    </div>
  </div>
);
