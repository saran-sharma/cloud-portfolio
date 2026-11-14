import { useState, type FormEvent } from "react";
import emailjs from "@emailjs/browser";
import { ArrowUpRight, Download, Github, Linkedin, MapPin, Phone, Send } from "lucide-react";
import { toast } from "sonner";
import { portfolio } from "@/data/portfolio";

export const Contact = () => {
  const p = portfolio.profile;
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ kind: "error" | "success"; text: string } | null>(null);
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
  const configured = Boolean(serviceId && templateId && publicKey);

  const reportError = (text: string) => {
    setStatus({ kind: "error", text });
    toast.error(text);
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();
    if (String(data.get("website") ?? "").trim()) return;
    if (!name || !email || !message) {
      reportError("Please fill in your name, email and message.");
      return;
    }
    if (!configured) {
      reportError("The contact form is not configured. Please email me directly using the link beside this form.");
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      await emailjs.send(serviceId, templateId, {
        from_name: name,
        from_email: email,
        reply_to: email,
        to_email: p.email,
        message,
        page_url: window.location.href,
      }, { publicKey });
      const text = "Message sent. Thanks for reaching out.";
      setStatus({ kind: "success", text });
      toast.success(text);
      form.reset();
    } catch (error) {
      console.error("EmailJS submission failed:", error);
      reportError("Message could not be sent. Please email me directly.");
    } finally {
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
            <a className="contact-email" href={`mailto:${p.email}`}>{p.email}<ArrowUpRight size={22} /></a>
            <div className="contact-links">
              <a href={p.linkedin} target="_blank" rel="noreferrer"><Linkedin size={15} /> LinkedIn</a>
              <a href={p.github} target="_blank" rel="noreferrer"><Github size={15} /> GitHub</a>
              <a href={p.resumeUrl} download><Download size={15} /> Resume</a>
            </div>
            <div className="contact-details">
              <span><MapPin size={14} /> {p.location}</span>
              <a href={`tel:${p.phone.replace(/\s/g, "")}`}><Phone size={14} /> {p.phone}</a>
            </div>
          </div>
          <form className="contact-form" onSubmit={onSubmit} aria-label="Contact Saran" aria-busy={loading}>
            <div hidden aria-hidden="true"><label htmlFor="website">Website</label><input id="website" name="website" tabIndex={-1} autoComplete="off" /></div>
            <div className="form-row">
              <div><label htmlFor="name">Your name</label><input id="name" name="name" autoComplete="name" required maxLength={120} placeholder="Your name" /></div>
              <div><label htmlFor="email">Email address</label><input id="email" name="email" type="email" autoComplete="email" required maxLength={254} placeholder="you@company.com" /></div>
            </div>
            <div><label htmlFor="message">What are you working on?</label><textarea id="message" name="message" required maxLength={6000} rows={4} placeholder="Tell me about the role, project or challenge..." /></div>
            <button className="action-button action-primary" type="submit" disabled={loading}><Send size={15} /> {loading ? "Sending..." : "Send message"}</button>
            {!configured && <p className="form-note">Contact form delivery is not configured. You can always <a href={`mailto:${p.email}`}>email me directly</a>.</p>}
            <div aria-live="polite" aria-atomic="true">{status && <p className={`form-status is-${status.kind}`}>{status.text}</p>}</div>
          </form>
        </div>
      </div>
    </section>
  );
};
