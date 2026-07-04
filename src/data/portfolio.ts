import profileImg from "@/assets/profile.jpg";
import p1 from "@/assets/project-1.jpg";
import p2 from "@/assets/project-2.jpg";
import p3 from "@/assets/project-3.jpg";
import p4 from "@/assets/project-4.jpg";

export const portfolio = {
  profile: {
    name: "Saran S",
    title: "Senior Cloud & DevOps Engineer | Platform Engineer",
    tagline: "Building resilient Azure platforms with automation, observability and AI-powered ops.",
    location: "Chennai, India",
    email: "hello@saran.dev",
    phone: "+91 00000 00000",
    linkedin: "https://www.linkedin.com/in/saran-s",
    github: "https://github.com/saran-s",
    resumeUrl: "/resume.pdf",
    image: profileImg,
    availability: "Open to Senior Cloud / Platform Engineering roles",
  },
  about: {
    paragraphs: [
      "I'm a Senior Cloud & DevOps Engineer with 3+ years of hands-on experience designing, automating and operating large-scale Microsoft Azure platforms — currently at Capgemini on a Microsoft engagement.",
      "My focus is Platform Engineering: paved-road infrastructure with Terraform and ARM, golden-path CI/CD on Azure DevOps and GitHub Actions, Kubernetes on AKS, and deep observability with Azure Monitor, Log Analytics, Grafana and Prometheus.",
      "I love turning toil into code — automating governance, incident response and repetitive operations with Python and PowerShell, and increasingly leveraging AI to make on-call smarter and platforms self-healing.",
    ],
    stats: [
      { label: "Years in Cloud/DevOps", value: "3+" },
      { label: "Azure services shipped", value: "40+" },
      { label: "Automations delivered", value: "50+" },
      { label: "Certifications", value: "4" },
    ],
  },
  experience: [
    {
      company: "Capgemini",
      client: "Microsoft (Cloud + AI Platform)",
      role: "Senior Cloud & DevOps Engineer",
      period: "Apr 2023 — Present",
      location: "Chennai, India",
      bullets: [
        "Design and operate Azure landing zones, AKS clusters and shared platform services for Microsoft's engineering teams.",
        "Ship Terraform + ARM modules and reusable Azure DevOps / GitHub Actions pipelines as a paved road for product teams.",
        "Automate governance, cost and RBAC controls with Python and PowerShell across hundreds of subscriptions.",
        "Lead incident response, on-call and blameless post-mortems; drive reliability improvements with SLOs.",
        "Prototype AI-powered incident intelligence to accelerate triage and root-cause analysis.",
      ],
    },
  ],
  education: [
    {
      school: "BITS Pilani (Work Integrated Learning Program)",
      degree: "M.Tech, Cloud Computing",
      period: "2025 — 2027",
    },
    {
      school: "SRM Valliammai Engineering College",
      degree: "B.E., Mechanical Engineering",
      period: "2018 — 2022",
    },
  ],
  skills: [
    {
      category: "Cloud",
      items: ["Microsoft Azure", "Azure RBAC", "Key Vault", "Azure Networking", "Landing Zones", "Cost Governance"],
    },
    {
      category: "Infrastructure as Code",
      items: ["Terraform", "ARM Templates", "Bicep", "Modules & Policy as Code"],
    },
    {
      category: "CI/CD & Automation",
      items: ["Azure DevOps", "GitHub Actions", "Jenkins", "Git", "Release Engineering"],
    },
    {
      category: "Containers & Platforms",
      items: ["Kubernetes (AKS)", "Docker", "Helm", "Platform Engineering", "Internal Developer Platforms"],
    },
    {
      category: "Observability & SRE",
      items: ["Azure Monitor", "Log Analytics", "Grafana", "Prometheus", "Incident Management", "SLOs"],
    },
    {
      category: "Languages & Scripting",
      items: ["Python", "PowerShell", "Bash", "Linux", "YAML"],
    },
  ],
  projects: [
    {
      title: "Azure Platform Automation",
      summary: "End-to-end paved road for provisioning Azure landing zones, RBAC, networking and observability with Terraform and pipelines.",
      tags: ["Azure", "Terraform", "Azure DevOps", "Python"],
      image: p1,
      impact: "Cut environment provisioning from days to under 30 minutes.",
    },
    {
      title: "ADLS Gen1 → Gen2 Migration",
      summary: "Automated large-scale migration of data lake workloads from ADLS Gen1 to Gen2 with validation, cutover and rollback tooling.",
      tags: ["Azure Data Lake", "PowerShell", "Automation"],
      image: p2,
      impact: "Zero-downtime migration across petabyte-scale datasets.",
    },
    {
      title: "Incident Intelligence — AI Initiative",
      summary: "AI-assisted incident triage that clusters alerts, suggests probable root causes and drafts post-mortems from telemetry.",
      tags: ["AI Ops", "Azure OpenAI", "Log Analytics", "Python"],
      image: p3,
      impact: "Reduced mean time to acknowledge by ~40% in pilot.",
    },
    {
      title: "Azure Automation Migration",
      summary: "Migrated legacy runbooks and scheduled jobs into a modern, source-controlled Azure Automation + GitHub Actions workflow.",
      tags: ["Azure Automation", "PowerShell", "GitHub Actions"],
      image: p4,
      impact: "Standardised 100+ runbooks with full auditability.",
    },
  ],
  certifications: [
    { code: "AZ-104", name: "Microsoft Azure Administrator", issuer: "Microsoft" },
    { code: "AZ-204", name: "Developing Solutions for Microsoft Azure", issuer: "Microsoft" },
    { code: "DP-700", name: "Fabric Data Engineer Associate", issuer: "Microsoft" },
    { code: "DBX-DE", name: "Databricks Certified Data Engineer Associate", issuer: "Databricks" },
  ],
  services: [
    {
      title: "Cloud Architecture on Azure",
      description: "Landing zones, networking, security and cost-aware Azure architecture built to scale.",
      icon: "Cloud",
    },
    {
      title: "Platform Engineering",
      description: "Paved-road IDPs, golden-path pipelines and reusable Terraform modules for product teams.",
      icon: "Layers",
    },
    {
      title: "Kubernetes & AKS",
      description: "Production-grade AKS clusters, GitOps workflows, Helm charts and cluster reliability.",
      icon: "Boxes",
    },
    {
      title: "CI/CD & Automation",
      description: "Azure DevOps and GitHub Actions pipelines, release engineering, and toil-killing automation.",
      icon: "GitBranch",
    },
    {
      title: "Observability & SRE",
      description: "Azure Monitor, Grafana and Prometheus stacks, SLOs, incident response and on-call.",
      icon: "Activity",
    },
    {
      title: "AI-powered Ops",
      description: "LLM-assisted incident triage, runbook automation and platform copilots.",
      icon: "Sparkles",
    },
  ],
  techStack: [
    "Azure", "Terraform", "ARM", "Bicep", "Azure DevOps", "GitHub Actions",
    "Docker", "Kubernetes", "AKS", "Helm", "Python", "PowerShell",
    "Bash", "Linux", "Azure Monitor", "Log Analytics", "Grafana", "Prometheus",
    "Jenkins", "Git", "Azure RBAC", "Key Vault", "Networking", "Azure OpenAI",
  ],
  blog: [
    {
      title: "Designing a paved road on Azure that developers actually use",
      excerpt: "Lessons from building an internal developer platform on top of AKS, Terraform and GitHub Actions.",
      date: "Coming soon",
      tag: "Platform Engineering",
    },
    {
      title: "From alerts to answers: AI-assisted incident triage",
      excerpt: "How we prototyped an LLM-powered assistant that clusters alerts and drafts post-mortems.",
      date: "Coming soon",
      tag: "AI Ops",
    },
    {
      title: "Terraform modules that scale across 100+ subscriptions",
      excerpt: "Patterns for versioning, testing and rolling out Terraform modules in a large Azure estate.",
      date: "Coming soon",
      tag: "Infrastructure as Code",
    },
  ],
};

export type Portfolio = typeof portfolio;
