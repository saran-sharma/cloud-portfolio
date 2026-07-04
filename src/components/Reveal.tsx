import { useReveal } from "@/hooks/use-reveal";
import { cn } from "@/lib/utils";

export const Reveal = ({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) => {
  const { ref, shown } = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      style={{ animationDelay: `${delay}ms` }}
      className={cn(shown ? "animate-fade-in-up" : "opacity-0", className)}
    >
      {children}
    </div>
  );
};
