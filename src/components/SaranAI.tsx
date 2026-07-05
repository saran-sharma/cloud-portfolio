import { FormEvent, useMemo, useRef, useState } from "react";
import { Bot, ExternalLink, FileText, Github, Linkedin, MessageCircle, Send, X } from "lucide-react";
import { portfolio } from "@/data/portfolio";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Message = {
  role: "assistant" | "visitor";
  text: string;
};

const openingMessage =
  "Hi, I am SaranAI, Saran's portfolio assistant. Ask me about his Azure experience, projects, certifications, resume, LinkedIn, GitHub, or contact details.";

const normalize = (value: string) => value.toLowerCase().trim();

const includesAny = (value: string, terms: string[]) => terms.some((term) => value.includes(term));

const scrollToSection = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
};

const openUrl = (url: string) => {
  window.open(url, "_blank", "noopener,noreferrer");
};

const summarizeProjects = () =>
  portfolio.projects
    .map((project) => `- ${project.title}: ${project.summary} Impact: ${project.impact}`)
    .join("\n");

const buildResponse = (input: string) => {
  const q = normalize(input);
  const p = portfolio.profile;

  if (includesAny(q, ["show project", "projects", "cloud project", "terraform project", "kubernetes project", "automation project"])) {
    scrollToSection("projects");
    return `Here are Saran's featured projects:\n${summarizeProjects()}\n\nWould you like to explore Saran's Azure projects, certifications, or experience next?`;
  }

  if (includesAny(q, ["contact", "email", "phone", "schedule", "interview", "reach"])) {
    scrollToSection("contact");
    return `You can contact Saran at ${p.email} or ${p.phone}. For interviews, share the role, company, location and tech stack so Saran can respond with the right context.`;
  }

  if (includesAny(q, ["resume", "cv", "download"])) {
    openUrl(p.resumeUrl);
    return "I opened Saran's resume PDF. Would you like to review his projects, certifications, or experience next?";
  }

  if (includesAny(q, ["linkedin"])) {
    openUrl(p.linkedin);
    return "I opened Saran's LinkedIn profile. Would you like to explore his Azure projects, certifications, or experience next?";
  }

  if (includesAny(q, ["github", "code", "repo"])) {
    openUrl(p.github);
    return "I opened Saran's GitHub profile. Would you like to explore his Terraform, automation, or Azure work next?";
  }

  if (includesAny(q, ["we're hiring", "we are hiring", "hiring", "role opening", "job opening"])) {
    return "Great. Could you share the role, company, location, and tech stack? Based on Saran's Azure, DevOps, Terraform, Kubernetes, production support, and platform engineering background, I can help map his fit to the opportunity.";
  }

  if (includesAny(q, ["who is", "about", "summary", "background"])) {
    return `${p.name} is a ${p.title} based in ${p.location}. He works across Azure cloud engineering, DevOps, platform engineering, infrastructure automation, incident management, and AI-powered operations. His current focus is building reliable Azure platforms with Terraform, CI/CD, observability and automation.`;
  }

  if (includesAny(q, ["experience", "worked", "career"])) {
    const exp = portfolio.experience[0];
    return `Saran is currently a ${exp.role} at ${exp.company}, working on a ${exp.client} engagement. His experience includes Azure landing zones, AKS, Terraform and ARM modules, Azure DevOps/GitHub Actions pipelines, governance automation, production support, incident response, SLOs and AI-assisted incident triage.`;
  }

  if (includesAny(q, ["why should", "hire", "fit", "candidate"])) {
    return "Saran is a strong fit for cloud/platform roles because he combines Azure engineering, Terraform automation, CI/CD, Kubernetes, observability, production support and incident management. He is especially relevant for teams that need practical platform engineering and reliable operations, not only infrastructure setup.";
  }

  if (includesAny(q, ["azure", "cloud service", "services"])) {
    return "Saran has worked across Azure platform areas including Azure DevOps, Azure Data Factory, Azure Synapse Analytics, ADLS Gen2, Azure Monitor, Key Vault, Azure Functions, AKS, RBAC, networking, landing zones, governance, and cost-aware automation.";
  }

  if (includesAny(q, ["devops", "ci/cd", "pipeline", "deployment"])) {
    return "Saran's DevOps experience includes Azure DevOps, GitHub Actions, reusable pipeline patterns, release engineering, Terraform-backed provisioning, automation with PowerShell/Python, source-controlled runbooks and production deployment support.";
  }

  if (includesAny(q, ["terraform", "iac", "infrastructure as code"])) {
    return "Saran uses Terraform and ARM/Bicep patterns for Azure infrastructure provisioning, reusable modules, landing zones, RBAC, networking and governance automation. His work emphasizes repeatability, reviewability and faster environment provisioning.";
  }

  if (includesAny(q, ["kubernetes", "aks", "docker", "container"])) {
    return "Saran's Kubernetes experience is centered on AKS, Docker, Helm and production platform reliability. He focuses on cluster operations, golden paths for teams, observability and reducing operational friction around containerized workloads.";
  }

  if (includesAny(q, ["ai", "automation", "incident intelligence", "incident advisor", "ai ops", "ai-powered"])) {
    return "Saran has explored AI-powered operations through incident intelligence use cases such as alert clustering, probable root-cause suggestions, post-mortem drafting and smarter runbook automation. He does not present this as a finished product unless project details confirm it.";
  }

  if (includesAny(q, ["certification", "certified", "az-104", "az-204", "dp-700"])) {
    const certs = portfolio.certifications.map((cert) => `${cert.code} ${cert.name}`).join(", ");
    return `Saran's listed certifications are: ${certs}. Additional certifications should be listed only when earned and verified.`;
  }

  if (includesAny(q, ["education", "college", "degree", "bits"])) {
    return "Saran is pursuing M.Tech in Cloud Computing through BITS Pilani WILP. He also holds a B.E. in Mechanical Engineering from SRM Valliammai Engineering College.";
  }

  if (includesAny(q, ["skill", "tech stack", "tools"])) {
    return `Saran's core stack includes ${portfolio.techStack.join(", ")}. He is strongest across Azure, DevOps, Terraform, Kubernetes, automation, observability and production support.`;
  }

  return "I don't have enough information about that. Please contact Saran directly.";
};

export const SaranAI = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([{ role: "assistant", text: openingMessage }]);
  const inputRef = useRef<HTMLInputElement>(null);

  const quickActions = useMemo(
    () => [
      { label: "Projects", icon: MessageCircle, prompt: "Show projects" },
      { label: "Resume", icon: FileText, prompt: "Resume" },
      { label: "LinkedIn", icon: Linkedin, prompt: "LinkedIn" },
      { label: "GitHub", icon: Github, prompt: "GitHub" },
    ],
    []
  );

  const ask = (prompt: string) => {
    const trimmed = prompt.trim();
    if (!trimmed) return;

    setMessages((current) => [
      ...current,
      { role: "visitor", text: trimmed },
      { role: "assistant", text: buildResponse(trimmed) },
    ]);
    setInput("");
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    ask(input);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
      {open && (
        <section
          id="saranai-panel"
          aria-label="SaranAI portfolio assistant"
          className="mb-3 w-[calc(100vw-2rem)] max-w-sm overflow-hidden rounded-2xl border border-border bg-background/95 shadow-elegant backdrop-blur-xl"
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
                <Bot className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-sm font-semibold">SaranAI</h2>
                <p className="text-xs text-muted-foreground">Recruiter portfolio assistant</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" aria-label="Close SaranAI" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="max-h-80 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={cn(
                  "rounded-xl px-3 py-2 text-sm leading-relaxed whitespace-pre-line",
                  message.role === "assistant"
                    ? "bg-secondary/70 text-foreground"
                    : "ml-8 bg-primary text-primary-foreground"
                )}
              >
                {message.text}
              </div>
            ))}
          </div>

          <div className="border-t border-border px-4 py-3">
            <div className="mb-3 grid grid-cols-2 gap-2">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={action.label}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="justify-start rounded-full"
                    onClick={() => ask(action.prompt)}
                  >
                    <Icon className="h-4 w-4" />
                    {action.label}
                  </Button>
                );
              })}
            </div>

            <form onSubmit={onSubmit} className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about Saran..."
                aria-label="Ask SaranAI"
                className="h-10"
              />
              <Button type="submit" size="icon" aria-label="Send question">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </section>
      )}

      <Button
        type="button"
        size="lg"
        className="rounded-full bg-gradient-primary text-primary-foreground shadow-glow"
        aria-expanded={open}
        aria-controls="saranai-panel"
        onClick={() => {
          setOpen((current) => !current);
          window.setTimeout(() => inputRef.current?.focus(), 120);
        }}
      >
        {open ? <X className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
        <span>SaranAI</span>
      </Button>
    </div>
  );
};
