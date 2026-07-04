import { ArrowRight, Download, MapPin, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { portfolio } from "@/data/portfolio";
import heroBg from "@/assets/hero-bg.jpg";

export const Hero = () => {
  const p = portfolio.profile;
  return (
    <section id="top" className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-28">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-30"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />
      <div aria-hidden className="absolute inset-0 -z-10 mesh-bg" />
      <div aria-hidden className="absolute inset-0 -z-10 grid-bg opacity-40" />

      <div className="container">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr] lg:items-center">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs font-medium">
              <span className="relative flex h-2 w-2">
                <span className="absolute inset-0 animate-ping rounded-full bg-accent opacity-75" />
                <span className="relative h-2 w-2 rounded-full bg-accent" />
              </span>
              {p.availability}
            </div>

            <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
              <span className="block">{p.name}.</span>
              <span className="block gradient-text">Cloud, DevOps &</span>
              <span className="block">Platform Engineer.</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              {p.tagline}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4" /> {p.location}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-primary" /> Azure • Kubernetes • Terraform
              </span>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-95">
                <a href="#contact">
                  Let's build together <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full glass">
                <a href={p.resumeUrl} download>
                  <Download className="mr-2 h-4 w-4" /> Download résumé
                </a>
              </Button>
            </div>

          </div>

          <div className="relative mx-auto w-full max-w-sm">
            <div className="absolute -inset-6 -z-10 rounded-full bg-gradient-primary opacity-30 blur-3xl animate-glow-pulse" />
            <div className="glass relative rounded-3xl p-3 shadow-elegant animate-float">
              <div className="overflow-hidden rounded-2xl bg-gradient-primary p-[1px]">
                <img
                  src={p.image}
                  alt={`${p.name} — professional headshot`}
                  width={768}
                  height={768}
                  className="aspect-square w-full rounded-2xl object-cover"
                />
              </div>
              <div className="mt-3 flex items-center justify-between rounded-xl bg-background/50 px-3 py-2 text-xs">
                <div className="font-mono text-muted-foreground">status</div>
                <div className="flex items-center gap-1.5 text-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent animate-glow-pulse" />
                  online · Chennai
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
