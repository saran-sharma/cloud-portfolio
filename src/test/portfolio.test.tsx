import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import emailjs from "@emailjs/browser";
import App from "@/App";
import { Contact } from "@/components/sections/Contact";
import { Projects } from "@/components/sections/Projects";
import { SaranAI } from "@/components/SaranAI";
import { portfolio } from "@/data/portfolio";
import { getPortfolioResponse } from "@/lib/portfolio-assistant";

vi.mock("@emailjs/browser", () => ({ default: { send: vi.fn() } }));
vi.mock("sonner", async (importOriginal) => {
  const original = await importOriginal<typeof import("sonner")>();
  return { ...original, toast: { error: vi.fn(), success: vi.fn() } };
});

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
    const portrait = screen.getByRole("img", { name: "Portrait of Saran S." });
    expect(portrait.getAttribute("src")).toContain("profilepic");
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
  it("makes unconfigured delivery explicit without faking success", () => {
    render(<Contact />);
    fillContact();
    fireEvent.submit(screen.getByRole("form", { name: "Contact Saran" }));
    expect(screen.getByText(/The contact form is not configured/)).toBeInTheDocument();
    expect(emailjs.send).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Your name")).toHaveValue("Test Visitor");
  });

  it("rejects whitespace-only inputs explicitly", () => {
    render(<Contact />);
    fillContact();
    fireEvent.change(screen.getByLabelText("Your name"), { target: { value: "  " } });
    fireEvent.submit(screen.getByRole("form", { name: "Contact Saran" }));
    expect(screen.getByText(/Please fill in your name/)).toBeInTheDocument();
    expect(emailjs.send).not.toHaveBeenCalled();
  });

  it("preserves EmailJS parameters and clears inputs only after successful delivery", async () => {
    vi.stubEnv("VITE_EMAILJS_SERVICE_ID", "test-service");
    vi.stubEnv("VITE_EMAILJS_TEMPLATE_ID", "test-template");
    vi.stubEnv("VITE_EMAILJS_PUBLIC_KEY", "test-public-key");
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
    await screen.findByText("Message sent. Thanks for reaching out.");
    expect(screen.getByLabelText("Your name")).toHaveValue("");
  });

  it("surfaces delivery failures and keeps the visitor's message", async () => {
    vi.stubEnv("VITE_EMAILJS_SERVICE_ID", "test-service");
    vi.stubEnv("VITE_EMAILJS_TEMPLATE_ID", "test-template");
    vi.stubEnv("VITE_EMAILJS_PUBLIC_KEY", "test-public-key");
    vi.mocked(emailjs.send).mockRejectedValue(new Error("Simulated delivery failure"));
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    render(<Contact />);
    fillContact();
    fireEvent.submit(screen.getByRole("form", { name: "Contact Saran" }));
    await screen.findByText("Message could not be sent. Please email me directly.");
    expect(screen.getByLabelText("Your name")).toHaveValue("Test Visitor");
    expect(error).toHaveBeenCalled();
  });
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
