import { ArrowUp } from "lucide-react";
import { portfolio } from "@/data/portfolio";

export const Footer = () => (
  <footer className="site-footer page-shell">
    <a className="wordmark" href="#top">SARAN S<span className="text-gold">.</span></a>
    <p>&copy; {new Date().getFullYear()} {portfolio.profile.name} &middot; {portfolio.profile.location}</p>
    <a href="#top" className="text-link">Back to top <ArrowUp size={14} /></a>
  </footer>
);
