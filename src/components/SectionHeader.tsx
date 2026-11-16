import { useReveal } from "@/hooks/use-reveal";
import { cn } from "@/lib/utils";

export const SectionHeader = ({ eyebrow, title, subtitle, className, index }: {
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: string;
  className?: string;
  /** Large outlined chapter number shown behind the heading, for example "02". */
  index?: string;
}) => {
  const { ref, shown } = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} data-progress="" className={cn("section-heading", shown && "is-shown", className)}>
      {index && <span className="section-index" aria-hidden="true">{index}</span>}
      <p className="eyebrow">{eyebrow}</p>
      <div className="section-heading-row">
        <h2>{title}</h2>
        {subtitle && <p className="section-intro">{subtitle}</p>}
      </div>
    </div>
  );
};
