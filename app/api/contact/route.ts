import { Resend } from 'resend';

/**
 * Contact form endpoint. Sends the enquiry to CONTACT_TO_EMAIL through Resend, with reply-to set to the
 * visitor so you can answer straight from your inbox. Env vars: see .env.example.
 */

const LIMITS = { name: 100, email: 200, company: 120, service: 80, package: 40, message: 5000 };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* best-effort per-IP throttle; resets whenever the server instance restarts */
const WINDOW_MS = 10 * 60 * 1000, MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();
function throttled(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_PER_WINDOW;
}

function esc(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

function field(body: Record<string, unknown>, key: keyof typeof LIMITS) {
  const v = body[key];
  return typeof v === 'string' ? v.trim().slice(0, LIMITS[key]) : '';
}

export async function POST(req: Request) {
  const apiKey = process.env.RESEND_API_KEY, to = process.env.CONTACT_TO_EMAIL;
  if (!apiKey || !to) {
    console.error('Contact form: RESEND_API_KEY or CONTACT_TO_EMAIL is not set');
    return Response.json({ error: 'The contact form is not set up yet.' }, { status: 500 });
  }

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return Response.json({ error: 'Invalid request.' }, { status: 400 }); }

  /* honeypot: real people never see this field */
  if (typeof body.website === 'string' && body.website.trim()) return Response.json({ ok: true });

  const name = field(body, 'name'), email = field(body, 'email'), company = field(body, 'company');
  const service = field(body, 'service'), pkg = field(body, 'package'), message = field(body, 'message');
  if (!name || !EMAIL_RE.test(email) || message.length < 10) {
    return Response.json({ error: 'Please add your name, a valid email and a short message.' }, { status: 400 });
  }

  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';
  if (throttled(ip)) return Response.json({ error: 'Too many messages. Please try again in a few minutes.' }, { status: 429 });

  const rows: [string, string][] = [['Name', name], ['Email', email], ['Company', company], ['Package', pkg], ['Project type', service]];
  const text = rows.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join('\n') + `\n\n${message}`;
  const html =
    `<table style="font:14px/1.5 sans-serif;border-collapse:collapse">` +
    rows.filter(([, v]) => v).map(([k, v]) => `<tr><td style="padding:2px 12px 2px 0;color:#666">${k}</td><td>${esc(v)}</td></tr>`).join('') +
    `</table><p style="font:14px/1.6 sans-serif;white-space:pre-wrap">${esc(message)}</p>`;

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: process.env.CONTACT_FROM_EMAIL || 'Portfolio <onboarding@resend.dev>',
    to: to.split(',').map((s) => s.trim()),
    replyTo: email,
    subject: `New enquiry from ${name}${[pkg && `${pkg} package`, service].filter(Boolean).map((x) => ` · ${x}`).join('')}`,
    text,
    html,
  });
  if (error) {
    console.error('Contact form: Resend error', error);
    return Response.json({ error: 'Could not send right now. Please try again later.' }, { status: 502 });
  }
  return Response.json({ ok: true });
}
