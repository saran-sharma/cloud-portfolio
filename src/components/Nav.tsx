import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Gamepad2, Menu, X } from "lucide-react";

const links = [
  { href: "#top", label: "Home" },
  { href: "#about", label: "About" },
  { href: "#projects", label: "Projects" },
  { href: "#skills", label: "Skills" },
  { href: "#experience", label: "Experience" },
  { href: "#certifications", label: "Credentials" },
  { href: "#contact", label: "Contact" },
];

export const Nav = ({ onExploreCity }: { onExploreCity?: () => void }) => {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("#top");
  const menuButton = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const sections = links.map((link) => document.querySelector(link.href)).filter((section): section is HTMLElement => section instanceof HTMLElement);
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) setActive(`#${entry.target.id}`);
      }
    }, { rootMargin: "-15% 0px -65% 0px" });
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (open) menuRef.current?.querySelector("a")?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && open) {
        setOpen(false);
        menuButton.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <header className="site-header">
      <nav className="site-nav page-shell" aria-label="Primary">
        <a className="wordmark" href="#top" aria-label="Saran S. home">
          <span className="monogram" aria-hidden="true">S<span>.</span></span>
          <span>SARAN S<span className="text-gold">.</span></span>
        </a>
        <ul ref={menuRef} id="navigation-links" className={`nav-links ${open ? "is-open" : ""}`}>
          {links.map((link) => (
            <li key={link.href}>
              <a href={link.href} aria-current={active === link.href ? "location" : undefined} onClick={() => setOpen(false)}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="nav-actions">
          {onExploreCity && (
            <button type="button" className="nav-city" onClick={onExploreCity}             aria-label="Explore Saran Universe" title="Explore Saran Universe">
                          <Gamepad2 size={16} aria-hidden="true" /> <span>Saran Universe</span>
            </button>
          )}
          <a href="#contact" className="nav-connect">Let's connect <ArrowUpRight size={15} /></a>
          <button ref={menuButton} className="icon-button menu-toggle" onClick={() => setOpen(!open)} aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} aria-controls="navigation-links">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>
    </header>
  );
};
