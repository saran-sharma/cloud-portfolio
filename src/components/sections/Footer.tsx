import { portfolio } from "@/data/portfolio";
import { Github, Linkedin, Mail } from "lucide-react";

export const Footer = () => {
  const p = portfolio.profile;
  return (
    <footer className="border-t border-border py-10">
      <div className="container flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground md:flex-row">
        <div className="flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-md bg-gradient-primary text-primary-foreground text-xs font-bold">S</span>
          <span>© {new Date().getFullYear()} {p.name}. Built with care in Chennai.</span>
        </div>
        <div className="flex items-center gap-4">
          <a href={p.github} target="_blank" rel="noreferrer" aria-label="GitHub" className="hover:text-foreground transition-colors">
            <Github className="h-4 w-4" />
          </a>
          <a href={p.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn" className="hover:text-foreground transition-colors">
            <Linkedin className="h-4 w-4" />
          </a>
          <a href={`mailto:${p.email}`} aria-label="Email" className="hover:text-foreground transition-colors">
            <Mail className="h-4 w-4" />
          </a>
        </div>
      </div>
    </footer>
  );
};
