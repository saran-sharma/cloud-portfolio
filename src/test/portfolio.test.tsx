import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import emailjs from "@emailjs/browser";
import { track } from "@vercel/analytics";
import App from "@/App";
import { Contact } from "@/components/sections/Contact";
import { Projects } from "@/components/sections/Projects";
import { SaranAI } from "@/components/SaranAI";
import { portfolio } from "@/data/portfolio";
import { characterAlt, characterImage } from "@/city/character";
import { isEmailJsConfigured, openMailto } from "@/lib/contact";
import { getPortfolioResponse } from "@/lib/portfolio-assistant";

vi.mock("@emailjs/browser", () => ({ default: { send: vi.fn() } }));
vi.mock("@vercel/analytics", () => ({ track: vi.fn() }));
vi.mock("@/lib/contact", async (importOriginal) => ({ ...(await importOriginal<typeof import("@/lib/contact")>()), openMailto: vi.fn() }));
vi.mock("sonner", async (importOriginal) => {
  const original = await importOriginal<typeof import("sonner")>();
  return { ...original, toast: { error: vi.fn(), success: vi.fn() } };
});

const stubEmailJs = () => {
  vi.stubEnv("VITE_EMAILJS_SERVICE_ID", "test-service");
  vi.stubEnv("VITE_EMAILJS_TEMPLATE_ID", "test-template");
  vi.stubEnv("VITE_EMAILJS_PUBLIC_KEY", "test-public-key");
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("IntersectionObserver", class {
    observe() {}
    unobserve() {}
    disconnect() {}
  });
  vi.stubEnv("VITE_EMAILJS_SERVICE_ID", "");
  vi.stubEnv("VITE_EMAILJS_TEMPLATE_ID", "");
  vi.stubEnv("VITE_EMAILJS_PUBLIC_KEY", "");
  window.localStorage.clear();
  window.history.replaceState(null, "", "/?mode=recruiter");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("Portfolio identity and navigation", () => {
  it("renders the supplied positioning without inflated titles or metrics", async () => {
    render(<App />);
    await screen.findByRole("button", { name: "SaranAI" }, { timeout: 10000 });
    expect(screen.getByText("Data Platform Engineer | AI & Cloud")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("I build data platforms. I automate what slows them down.");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Saran S., Data Platform Engineer.");
    expect(screen.getByRole("link", { name: "Explore My Work" })).toHaveAttribute("href", "#projects");
    const portrait = screen.getByRole("img", { name: characterAlt });
    expect(portrait.getAttribute("src")).toBe(characterImage);
    expect(portrait).toHaveAttribute("loading", "eager");
    expect(screen.queryByText(/Senior Cloud|petabyte|under 30 minutes|40%|unverified|Platform Atlas|Powering/i)).not.toBeInTheDocument();
    expect(portfolio.certifications).toHaveLength(5);
    expect(screen.getByText("Claude Certified Associate - Foundations")).toBeInTheDocument();
    expect(screen.getByText("Microsoft Certified: Fabric Data Engineer Associate (DP-700)")).toBeInTheDocument();
    expect(screen.getByText("Capgemini, Chennai")).toBeInTheDocument();
    expect(screen.getByText("At Capgemini since April 2023")).toBeInTheDocument();
    for (const link of screen.getAllByRole("link")) {
      const href = link.getAttribute("href");
      if (href?.startsWith("#")) expect(document.getElementById(href.slice(1))).not.toBeNull();
    }
    const download = screen.getByRole("link", { name: "Download Resume" });
    expect(download).toHaveAttribute("href", "/resume.pdf");
    expect(download).toHaveAttribute("download");
  }, 20000);

  it("supports menu dismissal and always uses the single dark Saran City theme", async () => {
    window.localStorage.setItem("theme", "light");
    render(<App />);
    await screen.findByRole("button", { name: "SaranAI" }, { timeout: 10000 });
    const menu = screen.getByRole("button", { name: "Open navigation" });
    fireEvent.click(menu);
    expect(menu).toHaveAttribute("aria-expanded", "true");
    fireEvent.keyDown(window, { key: "Escape" });
    expect(menu).toHaveAttribute("aria-expanded", "false");
    expect(menu).toHaveFocus();
    expect(screen.queryByRole("button", { name: /theme/i })).toBeNull();
    expect(document.documentElement).toHaveClass("dark");
    expect(document.documentElement).not.toHaveClass("light");
  }, 20000);

  it("preserves the unknown-route recovery page", () => {
    window.history.replaceState(null, "", "/missing-page");
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    render(<App />);
    expect(screen.getByRole("heading", { name: "404" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Return to Home" })).toHaveAttribute("href", "/");
    expect(error).toHaveBeenCalled();
  });
});

describe("Public case studies", () => {
  it("shows six featured projects and three more, each with an accessible case study", async () => {
    render(<Projects />);
    expect(portfolio.projects.filter((project) => project.tier === "featured")).toHaveLength(6);
    expect(screen.getAllByRole("button", { name: /^View case study:/ })).toHaveLength(9);
    expect(screen.getByRole("heading", { name: "More engineering work" })).toBeInTheDocument();
    for (const project of portfolio.projects) {
      fireEvent.click(screen.getByRole("button", { name: `View case study: ${project.title}` }));
      const dialog = await screen.findByRole("dialog");
      expect(dialog).toHaveAccessibleName(project.title);
      const detail = within(dialog);
      expect(detail.getByText(project.what)).toBeInTheDocument();
      expect(detail.getByRole("heading", { name: "What I worked on" })).toBeInTheDocument();
      expect(detail.getByText(project.role)).toBeInTheDocument();
      expect(Boolean(detail.queryByRole("heading", { name: "Why it exists" }))).toBe(Boolean(project.why));
      expect(Boolean(detail.queryByRole("heading", { name: "Outcomes" }))).toBe(Boolean(project.outcomes?.length));
      expect(Boolean(detail.queryByRole("heading", { name: "Tools" }))).toBe(project.tools.length > 0);
      expect(Boolean(detail.queryByRole("figure"))).toBe(Boolean(project.visual));
      expect(dialog.textContent).not.toMatch(/unverified|verified delivery|Evidence & next/i);
      fireEvent.click(detail.getByRole("button", { name: "Close" }));
      await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
      await waitFor(() => expect(screen.getByRole("button", { name: `View case study: ${project.title}` })).toHaveFocus());
    }
  }, 30000);

  it("gives each visual project its own diagram structure", () => {
    const visuals = portfolio.projects.filter((project) => project.visual).map((project) => project.visual);
    expect(new Set(visuals).size).toBe(visuals.length);
    expect(visuals).toHaveLength(8);
  });
});

const fillContact = () => {
  fireEvent.change(screen.getByLabelText("Your name"), { target: { value: "Test Visitor" } });
  fireEvent.change(screen.getByLabelText("Email address"), { target: { value: "visitor@example.com" } });
  fireEvent.change(screen.getByLabelText("What are you working on?"), { target: { value: "A data platform engineering opportunity." } });
};

describe("Contact delivery", () => {
  it("falls back to a pre-filled email without faking delivery or success", () => {
    render(<Contact />);
    expect(screen.getByRole("button", { name: "Write in my email app" })).toBeInTheDocument();
    fillContact();
    fireEvent.submit(screen.getByRole("form", { name: "Contact Saran" }));
    expect(emailjs.send).not.toHaveBeenCalled();
    expect(openMailto).toHaveBeenCalledTimes(1);
    const href = vi.mocked(openMailto).mock.calls[0][0];
    expect(href).toContain(`mailto:${portfolio.profile.email}?subject=`);
    expect(decodeURIComponent(href)).toContain("A data platform engineering opportunity.");
    expect(screen.getByText(/Your email app should open/)).toBeInTheDocument();
    expect(screen.queryByText(/Message sent/)).not.toBeInTheDocument();
    expect(screen.getByLabelText("Your name")).toHaveValue("Test Visitor");
  });

  it("rejects whitespace-only inputs explicitly", () => {
    render(<Contact />);
    fillContact();
    fireEvent.change(screen.getByLabelText("Your name"), { target: { value: "  " } });
    fireEvent.submit(screen.getByRole("form", { name: "Contact Saran" }));
    expect(screen.getByText(/Please fill in your name/)).toBeInTheDocument();
    expect(emailjs.send).not.toHaveBeenCalled();
    expect(openMailto).not.toHaveBeenCalled();
  });

  it("preserves EmailJS parameters and clears inputs only after successful delivery", async () => {
    stubEmailJs();
    vi.mocked(emailjs.send).mockResolvedValue({ status: 200, text: "OK" });
    render(<Contact />);
    fillContact();
    fireEvent.submit(screen.getByRole("form", { name: "Contact Saran" }));
    expect(emailjs.send).toHaveBeenCalledWith("test-service", "test-template", {
      from_name: "Test Visitor",
      from_email: "visitor@example.com",
      reply_to: "visitor@example.com",
      to_email: portfolio.profile.email,
      message: "A data platform engineering opportunity.",
      page_url: window.location.href,
    }, { publicKey: "test-public-key" });
    expect(screen.getByRole("button", { name: "Sending..." })).toBeDisabled();
    expect(screen.getByRole("form", { name: "Contact Saran" })).toHaveAttribute("aria-busy", "true");
    await screen.findByText("Message sent. Thanks for reaching out.");
    expect(screen.getByLabelText("Your name")).toHaveValue("");
  });

  it("ignores a second submission while the first is still sending", async () => {
    stubEmailJs();
    let finish: (value: { status: number; text: string }) => void = () => {};
    vi.mocked(emailjs.send).mockReturnValue(new Promise((resolve) => { finish = resolve; }));
    render(<Contact />);
    fillContact();
    const form = screen.getByRole("form", { name: "Contact Saran" });
    fireEvent.submit(form);
    fireEvent.submit(form);
    expect(emailjs.send).toHaveBeenCalledTimes(1);
    await act(async () => { finish({ status: 200, text: "OK" }); });
    await screen.findByText("Message sent. Thanks for reaching out.");
  });

  it("surfaces delivery failures, keeps the visitor's message and offers the email fallback", async () => {
    stubEmailJs();
    vi.mocked(emailjs.send).mockRejectedValue(new Error("Simulated delivery failure"));
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    render(<Contact />);
    fillContact();
    fireEvent.submit(screen.getByRole("form", { name: "Contact Saran" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Message could not be sent. Please email me directly.");
    expect(screen.getByLabelText("Your name")).toHaveValue("Test Visitor");
    const fallback = screen.getByRole("link", { name: "send it from your email app" });
    expect(fallback.getAttribute("href")).toContain(`mailto:${portfolio.profile.email}`);
    expect(decodeURIComponent(fallback.getAttribute("href") ?? "")).toContain("A data platform engineering opportunity.");
    expect(screen.getByRole("button", { name: "Send message" })).toBeEnabled();
    expect(error).toHaveBeenCalled();
  });

  it("reports rate limiting and timeouts clearly", async () => {
    stubEmailJs();
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(emailjs.send).mockRejectedValueOnce({ status: 429, text: "Too Many Requests" });
    render(<Contact />);
    fillContact();
    fireEvent.submit(screen.getByRole("form", { name: "Contact Saran" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/Too many messages/);
  });

  it("treats .env.example placeholder values as not configured and uses the email fallback", () => {
    vi.stubEnv("VITE_EMAILJS_SERVICE_ID", "your_service_id");
    vi.stubEnv("VITE_EMAILJS_TEMPLATE_ID", "your_template_id");
    vi.stubEnv("VITE_EMAILJS_PUBLIC_KEY", "your_public_key");
    render(<Contact />);
    expect(screen.getByRole("button", { name: "Write in my email app" })).toBeInTheDocument();
    fillContact();
    fireEvent.submit(screen.getByRole("form", { name: "Contact Saran" }));
    expect(emailjs.send).not.toHaveBeenCalled();
    expect(openMailto).toHaveBeenCalledTimes(1);
  });

  it("is only configured when all three values are real", () => {
    expect(isEmailJsConfigured("service_a1", "template_b2", "pk_c3")).toBe(true);
    expect(isEmailJsConfigured("service_a1", "template_b2", "")).toBe(false);
    expect(isEmailJsConfigured("service_a1", undefined, "pk_c3")).toBe(false);
    expect(isEmailJsConfigured("service_a1", "your_template_id", "pk_c3")).toBe(false);
  });

  it("never exposes a private key or non-public EmailJS variable", () => {
    const names = Object.keys(import.meta.env).filter((key) => key.includes("EMAILJS"));
    for (const name of names) expect(name).toMatch(/^VITE_EMAILJS_(SERVICE_ID|TEMPLATE_ID|PUBLIC_KEY)$/);
  });
});

describe("Analytics events", () => {
  it("tracks resume downloads with a fixed source label and no visitor data", async () => {
    render(<Contact />);
    const resume = screen.getByRole("link", { name: /Resume/ });
    resume.addEventListener("click", (event) => event.preventDefault());
    fireEvent.click(resume);
    await waitFor(() => expect(track).toHaveBeenCalledWith("resume_download", { source: "contact" }));
  });

  it("tracks a direct Recruiter Mode visit once", async () => {
    render(<App />);
    await screen.findByRole("button", { name: "SaranAI" }, { timeout: 10000 });
    await waitFor(() => expect(track).toHaveBeenCalledWith("recruiter_mode_open", { source: "direct_link" }));
    expect(vi.mocked(track).mock.calls.filter(([name]) => name === "recruiter_mode_open")).toHaveLength(1);
  }, 20000);
});

describe("Local portfolio guide", () => {
  it("uses updated data and preserves uncertainty", () => {
    expect(getPortfolioResponse("certifications")).toContain("AZ-104");
    expect(getPortfolioResponse("certifications")).toContain("Claude Certified Associate - Foundations, Anthropic (August 2026)");
    expect(getPortfolioResponse("experience")).toContain("Data Platform Engineer at Capgemini");
    expect(getPortfolioResponse("projects")).toContain("Reporting automation");
    expect(getPortfolioResponse("weather tomorrow")).toContain("don't have verified information");
  });

  it("answers locally and exposes real navigation and download links", async () => {
    render(<SaranAI />);
    fireEvent.click(screen.getByRole("button", { name: "SaranAI" }));
    const dialog = await screen.findByRole("dialog");
    const guide = within(dialog);
    expect(guide.getByText(/local, rule-based guide/)).toBeInTheDocument();
    fireEvent.change(guide.getByRole("textbox"), { target: { value: "certifications" } });
    fireEvent.click(guide.getByRole("button", { name: "Send question" }));
    expect(guide.getByRole("log")).toHaveTextContent("AZ-104");
    expect(guide.getByRole("link", { name: "Download resume" })).toHaveAttribute("download");
    expect(guide.getByRole("link", { name: "GitHub" })).toHaveAttribute("href", portfolio.profile.github);
  });
});
