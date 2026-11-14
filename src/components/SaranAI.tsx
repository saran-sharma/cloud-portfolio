import { useEffect, useRef, useState, type FormEvent } from "react";
import { MessageSquare, Send } from "lucide-react";
import { portfolio } from "@/data/portfolio";
import { getPortfolioResponse } from "@/lib/portfolio-assistant";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

type Message = { role: "guide" | "visitor"; text: string };

export const SaranAI = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([{ role: "guide", text: "Welcome. Ask about Saran's experience, projects, toolkit or certifications." }]);
  const [open, setOpen] = useState(false);
  const log = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (log.current) log.current.scrollTop = log.current.scrollHeight;
  }, [messages, open]);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const question = input.trim();
    if (!question) return;
    setMessages((current) => [...current, { role: "visitor", text: question }, { role: "guide", text: getPortfolioResponse(question) }]);
    setInput("");
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><button className="assistant-launcher"><MessageSquare size={14} /><span>SaranAI</span></button></DialogTrigger>
      <DialogContent className="assistant-dialog">
        <DialogTitle className="assistant-title">SaranAI / Portfolio guide</DialogTitle>
        <DialogDescription className="assistant-description">A local, rule-based guide, not a generative AI service. Questions stay in this browser and answers use only the public portfolio.</DialogDescription>
        <div ref={log} className="assistant-messages" role="log" aria-label="Portfolio conversation" aria-live="polite">
          {messages.map((message, index) => <p className={`assistant-message ${message.role === "visitor" ? "is-visitor" : ""}`} key={index}><span className="sr-only">{message.role === "visitor" ? "You" : "Guide"}: </span>{message.text}</p>)}
        </div>
        <div className="assistant-actions">
          <DialogClose asChild><a href="#projects">Explore projects</a></DialogClose>
          <a href={portfolio.profile.resumeUrl} download>Download resume</a>
          <a href={portfolio.profile.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
          <a href={portfolio.profile.github} target="_blank" rel="noreferrer">GitHub</a>
        </div>
        <form onSubmit={submit} className="assistant-form">
          <input value={input} onChange={(event) => setInput(event.target.value)} aria-label="Ask the portfolio guide" placeholder="Ask about Saran..." maxLength={500} required />
          <button type="submit" aria-label="Send question"><Send size={16} /></button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
