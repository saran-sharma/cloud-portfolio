import { useRef, useState, type FormEvent } from "react";
import emailjs from "@emailjs/browser";
import { ArrowUpRight, Download, Github, Linkedin, Loader2, Mail, MapPin, Phone, Send } from "lucide-react";
import { toast } from "sonner";
import { portfolio } from "@/data/portfolio";
import { buildMailto, isEmailJsConfigured, openMailto, type ContactDraft } from "@/lib/contact";
import { trackResumeDownload } from "@/lib/analytics";

const SEND_TIMEOUT_MS = 15000;

type Status = { kind: "error" | "success" | "info"; text: string } | null;

const readDraft = (form: HTMLFormElement): ContactDraft => {
  const data = new FormData(form);
  return {
    name: String(data.get("name") ?? ""),
    email: String(data.get("email") ?? ""),
    message: String(data.get("message") ?? ""),
  };
};

export const Contact = () => {
  const p = portfolio.profile;
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<Status>(null);
  const [draft, setDraft] = useState<ContactDraft>({ name: "", email: "", message: "" });
  const sending = useRef(false);
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
  const configured = isEmailJsConfigured(serviceId, templateId, publicKey);
  const mailto = buildMailto(p.email, draft);

  const reportError = (text: string) => {
    setStatus({ kind: "error", text });
    toast.error(text);
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sending.current) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const { name, email, message } = readDraft(form);
    if (String(data.get("website") ?? "").trim()) return;
    if (!name.trim() || !email.trim() || !message.trim()) {
      reportError("Please fill in your name, email and message.");
      return;
    }
    if (!configured) {
      setStatus({ kind: "info", text: `Your email app should open with your message ready to send. If nothing opens, email ${p.email} directly.` });
      openMailto(buildMailto(p.email, readDraft(form)));
      return;
    }
    sending.current = true;
    setLoading(true);
    setStatus(null);
    try {
      let timer = 0;
      const timeout = new Promise<never>((_, reject) => {
        timer = window.setTimeout(() => reject(new Error("timeout")), SEND_TIMEOUT_MS);
      });
      try {
        await Promise.race([
          emailjs.send(serviceId, templateId, {
            from_name: name.trim(),
            from_email: email.trim(),
            reply_to: email.trim(),
            to_email: p.email,
            message: message.trim(),
            page_url: window.location.href,
          }, { publicKey }),
          timeout,
        ]);
      } finally {
        window.clearTimeout(timer);
      }
      const text = "Message sent. Thanks for reaching out.";
      setStatus({ kind: "success", text });
      toast.success(text);
      form.reset();
      setDraft({ name: "", email: "", message: "" });
    } catch (error) {
      console.error("EmailJS submission failed:", error);
      const code = (error as { status?: number } | null)?.status;
      if (error instanceof Error && error.message === "timeout") reportError("Sending took too long. Please try again, or email me directly.");
      else if (code === 429) reportError("Too many messages were sent just now. Please wait a minute, or email me directly.");
      else reportError("Message could not be sent. Please email me directly.");
    } finally {
      sending.current = false;
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="section-space contact-section">
      <div className="page-shell">
        <p className="eyebrow">Contact</p>
        <div className="contact-heading">
          <h2>Let's talk about <span className="text-gold">what you're building.</span></h2>
          <p>I'm open to relevant professional opportunities and engineering collaborations. If you're working on data platforms, cloud automation or AI-enabled operations, I'd like to hear about it.</p>
        </div>
        <div className="contact-layout">
          <div>
            <a className="contact-email" href={`mailto:${p.email}`}>{p.email}<ArrowUpRight size={22} aria-hidden="true" /></a>
            <div className="contact-links">
              <a href={p.linkedin} target="_blank" rel="noreferrer"><Linkedin size={15} aria-hidden="true" /> LinkedIn</a>
              <a href={p.github} target="_blank" rel="noreferrer"><Github size={15} aria-hidden="true" /> GitHub</a>
              <a href={p.resumeUrl} download onClick={() => trackResumeDownload("contact")}><Download size={15} aria-hidden="true" /> Resume</a>
            </div>
            <div className="contact-details">
              <span><MapPin size={14} aria-hidden="true" /> {p.location}</span>
              <a href={`tel:${p.phone.replace(/\s/g, "")}`}><Phone size={14} aria-hidden="true" /> {p.phone}</a>
            </div>
          </div>
          <form className="contact-form" onSubmit={onSubmit} onChange={(event) => setDraft(readDraft(event.currentTarget))} aria-label="Contact Saran" aria-busy={loading}>
            <div hidden aria-hidden="true"><label htmlFor="website">Website</label><input id="website" name="website" tabIndex={-1} autoComplete="off" /></div>
            <div className="form-row">
              <div><label htmlFor="name">Your name</label><input id="name" name="name" autoComplete="name" required maxLength={120} placeholder="Your name" disabled={loading} /></div>
              <div><label htmlFor="email">Email address</label><input id="email" name="email" type="email" autoComplete="email" required maxLength={254} placeholder="you@company.com" disabled={loading} /></div>
            </div>
            <div><label htmlFor="message">What are you working on?</label><textarea id="message" name="message" required maxLength={6000} rows={4} placeholder="Tell me about the role, project or challenge..." disabled={loading} /></div>
            <button className="action-button action-primary" type="submit" disabled={loading}>
              {loading ? <Loader2 size={15} className="animate-spin" aria-hidden="true" /> : configured ? <Send size={15} aria-hidden="true" /> : <Mail size={15} aria-hidden="true" />}
              {loading ? "Sending..." : configured ? "Send message" : "Write in my email app"}
            </button>
            {!configured && <p className="form-note">Form delivery isn't available right now, so this opens your email app with your message ready to send.</p>}
            <div aria-live="polite" aria-atomic="true">
              {status && <p className={`form-status is-${status.kind}`} role={status.kind === "error" ? "alert" : "status"}>{status.text}</p>}
            </div>
            {status?.kind === "error" && <p className="form-note">Or <a href={mailto}>send it from your email app</a>. Your message is kept in the form.</p>}
          </form>
        </div>
      </div>
    </section>
  );
};
