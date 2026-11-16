export type ContactDraft = { name: string; email: string; message: string };

const MAX_BODY = 1500;

/** A mailto link carrying whatever the visitor has typed, so a failed or unavailable form never loses the message. */
export const buildMailto = (to: string, draft: ContactDraft) => {
  const name = draft.name.trim();
  const email = draft.email.trim();
  const message = draft.message.trim();
  if (!name && !email && !message) return `mailto:${to}`;
  const signature = [name, email && `<${email}>`].filter(Boolean).join(" ");
  const body = [message.slice(0, MAX_BODY), signature && `\n${signature}`].filter(Boolean).join("\n");
  const subject = `Portfolio enquiry${name ? ` from ${name}` : ""}`;
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

export const openMailto = (href: string) => {
  window.location.href = href;
};

/** True only when every value is set and is not an `.env.example` placeholder such as "your_public_key". */
export const isEmailJsConfigured = (...values: (string | undefined)[]) =>
  values.length > 0 && values.every((value) => Boolean(value && value.trim() && !/^your_/i.test(value.trim())));
