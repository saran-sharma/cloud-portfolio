import { useState } from "react";
import { portfolio } from "@/data/portfolio";
import { SectionHeader } from "@/components/SectionHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Mail, Phone, MapPin, Github, Linkedin, Send } from "lucide-react";

export const Contact = () => {
  const p = portfolio.profile;
  const [loading, setLoading] = useState(false);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData(e.currentTarget);
    const subject = encodeURIComponent(`Portfolio enquiry from ${data.get("name")}`);
    const body = encodeURIComponent(`${data.get("message")}\n\n— ${data.get("name")} (${data.get("email")})`);
    window.location.href = `mailto:${p.email}?subject=${subject}&body=${body}`;
    setTimeout(() => {
      toast.success("Opening your email client…");
      setLoading(false);
    }, 400);
  };

  return (
    <section id="contact" className="relative py-24">
      <div className="container">
        <SectionHeader
          eyebrow="Contact"
          title={<>Let's build the next <span className="gradient-text">platform</span>.</>}
          subtitle="Recruiters and hiring managers — the fastest way to reach me is below."
        />

        <div className="mx-auto mt-14 grid max-w-5xl gap-8 lg:grid-cols-[1fr_1.2fr]">
          <div className="glass rounded-2xl p-6 space-y-5">
            <a href={`mailto:${p.email}`} className="flex items-start gap-4 rounded-xl p-3 -m-3 hover:bg-secondary/50 transition-colors">
              <Mail className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Email</div>
                <div className="font-medium">{p.email}</div>
              </div>
            </a>
            <a href={`tel:${p.phone.replace(/\s/g, "")}`} className="flex items-start gap-4 rounded-xl p-3 -m-3 hover:bg-secondary/50 transition-colors">
              <Phone className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Phone</div>
                <div className="font-medium">{p.phone}</div>
              </div>
            </a>
            <div className="flex items-start gap-4 p-3 -m-3">
              <MapPin className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Location</div>
                <div className="font-medium">{p.location}</div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button asChild variant="outline" className="flex-1 rounded-full">
                <a href={p.linkedin} target="_blank" rel="noreferrer"><Linkedin className="mr-2 h-4 w-4" /> LinkedIn</a>
              </Button>
              <Button asChild variant="outline" className="flex-1 rounded-full">
                <a href={p.github} target="_blank" rel="noreferrer"><Github className="mr-2 h-4 w-4" /> GitHub</a>
              </Button>
            </div>
          </div>

          <form onSubmit={onSubmit} className="glass rounded-2xl p-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" required placeholder="Jane Recruiter" className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required placeholder="jane@company.com" className="mt-1.5" />
              </div>
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" name="message" required rows={5} placeholder="Tell me about the role or project…" className="mt-1.5" />
            </div>
            <Button type="submit" disabled={loading} size="lg" className="w-full rounded-full bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-95">
              <Send className="mr-2 h-4 w-4" /> {loading ? "Sending…" : "Send message"}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};
