# cloud-portfolio

## Contact Form

The contact form uses EmailJS.

1. Create an EmailJS service and email template.
2. Copy `.env.example` to `.env`.
3. Fill in:
   - `VITE_EMAILJS_SERVICE_ID`
   - `VITE_EMAILJS_TEMPLATE_ID`
   - `VITE_EMAILJS_PUBLIC_KEY`

Recommended EmailJS template variables:

- `from_name`
- `from_email`
- `reply_to`
- `to_email`
- `message`
- `page_url`
