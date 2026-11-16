import { Nav } from "@/components/Nav";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Experience } from "@/components/sections/Experience";
import { Skills } from "@/components/sections/Skills";
import { Projects } from "@/components/sections/Projects";
import { Certifications } from "@/components/sections/Certifications";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/sections/Footer";
import { ScrollProgress, ScrollSky } from "@/components/ScrollSky";
import { TechMarquee } from "@/components/TechMarquee";
import { useScrollEffects } from "@/hooks/use-scroll-effects";
import { lazy, Suspense, useRef } from "react";

const SaranAI = lazy(() => import("@/components/SaranAI").then((module) => ({ default: module.SaranAI })));

const Index = ({ onExploreCity }: { onExploreCity?: () => void }) => {
  const host = useRef<HTMLDivElement>(null);
  useScrollEffects(host);
  return (
    <div ref={host} className="portfolio-page min-h-dvh text-foreground">
      <ScrollProgress />
      <ScrollSky />
      <a href="#main-content" className="skip-link">Skip to content</a>
      <Nav onExploreCity={onExploreCity} />
      <main id="main-content" tabIndex={-1}>
        <Hero />
        <About />
        <TechMarquee />
        <Projects />
        <Skills />
        <Experience />
        <Certifications />
        <Contact />
      </main>
      <Footer />
      <Suspense fallback={null}><SaranAI /></Suspense>
    </div>
  );
};

export default Index;
