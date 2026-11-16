import { useReveal } from "@/hooks/use-reveal";
import { cn } from "@/lib/utils";

export const Reveal = ({
  children,
  className,
  delay = 0,
  progress = false,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  /** Also track how far the block has travelled through the viewport (--ep) for scroll-linked effects. */
  progress?: boolean;
}) => {
  const { ref, shown } = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      style={{ animationDelay: `${delay}ms`, transitionDelay: `${delay}ms` }}
      data-progress={progress ? "" : undefined}
      className={cn("reveal", shown && "is-shown", className)}
    >
      {children}
    </div>
  );
};
